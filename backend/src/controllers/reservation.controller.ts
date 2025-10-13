import { Request, Response } from 'express';
import Reservation from '../models/reservation';
import Vikendica from '../models/vikendica';
import User from '../models/user';

export class ReservationController {
  
  // Create a new reservation
  static createReservation = async (req: Request, res: Response) => {
    try {
      const { cottageId, userId, startDate, endDate, adults, children, specialRequests } = req.body;

      // Validate required fields
      if (!cottageId || !userId || !startDate || !endDate || !adults) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Check if cottage exists
      const cottage = await Vikendica.findById(cottageId);
      if (!cottage) {
        return res.status(404).json({ message: 'Cottage not found' });
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Calculate nights and total price
      const start = new Date(startDate);
      const end = new Date(endDate);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      const totalPrice = nights * cottage.PriceSummer;

      // Check for date conflicts (optional - you might want to implement this)
      const existingReservation = await Reservation.findOne({
        cottageId,
        $or: [
          {
            startDate: { $lte: end },
            endDate: { $gte: start }
          }
        ],
        status: { $in: ['pending', 'confirmed'] }
      });

      if (existingReservation) {
        return res.status(409).json({ message: 'Cottage is already reserved for these dates' });
      }

      // Create reservation
      const reservation = new Reservation({
        cottageId,
        userId,
        startDate: start,
        endDate: end,
        adults,
        children,
        totalPrice,
        nights,
        specialRequests: specialRequests || '',
        status: 'pending'
      });

      await reservation.save();
      res.status(201).json({ message: 'Reservation created successfully', reservation });
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Get all reservations for a user
  static getUserReservations = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const reservations = await Reservation.find({ userId })
        .populate('cottageId', 'Title Photos PriceSummer')
        .sort({ createdAt: -1 });
      
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Get all reservations for a cottage (for owners)
  static getCottageReservations = async (req: Request, res: Response) => {
    try {
      const { cottageId } = req.params;
      
      const reservations = await Reservation.find({ cottageId })
        .populate('userId', 'firstName lastName email')
        .sort({ startDate: 1 });
      
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching cottage reservations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Update reservation status
  static updateReservationStatus = async (req: Request, res: Response) => {
    try {
      const { reservationId } = req.params;
      const { status } = req.body;

      if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const reservation = await Reservation.findByIdAndUpdate(
        reservationId,
        { status, updatedAt: new Date() },
        { new: true }
      );

      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      res.json({ message: 'Reservation status updated', reservation });
    } catch (error) {
      console.error('Error updating reservation status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Cancel reservation
  static cancelReservation = async (req: Request, res: Response) => {
    try {
      const { reservationId } = req.params;
      const { userId } = req.body; // To verify ownership

      const reservation = await Reservation.findById(reservationId);
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      // Check if user owns this reservation
      if (reservation.userId.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
      }

      // Check if cancellation is allowed (e.g., not too close to start date)
      const now = new Date();
      const startDate = new Date(reservation.startDate);
      const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

      if (daysUntilStart < 2) {
        return res.status(400).json({ message: 'Cannot cancel reservation less than 2 days before start date' });
      }

      reservation.status = 'cancelled';
      reservation.updatedAt = new Date();
      await reservation.save();

      res.json({ message: 'Reservation cancelled successfully' });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Get reservation by ID
  static getReservationById = async (req: Request, res: Response) => {
    try {
      const { reservationId } = req.params;
      
      const reservation = await Reservation.findById(reservationId)
        .populate('cottageId', 'Title Photos PriceSummer Description')
        .populate('userId', 'firstName lastName email phone');
      
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
      
      res.json(reservation);
    } catch (error) {
      console.error('Error fetching reservation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}
