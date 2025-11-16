import { Request, Response } from 'express';
import Reservation from '../models/reservation';
import Cottage from '../models/cottage';
import User from '../models/user';
import { v4 as uuidv4 } from 'uuid';

export class ReservationController {
  


  static autoUpdateCompletedReservations = async () => {
    try {
      const now = new Date();
      console.log(`Auto-updating reservations at ${now.toISOString()}`);
      


      const completedResult = await Reservation.updateMany(
        {
          status: 'confirmed',
          $expr: { $lt: [{ $toDate: "$endDate" }, now] }
        },
        {
          $set: { 
            status: 'completed',
            updatedAt: now
          }
        }
      );
      console.log(`Auto-updated ${completedResult.modifiedCount} reservations to completed status`);
      


      const expiredResult = await Reservation.updateMany(
        {
          status: 'pending',
          $expr: { $lt: [{ $toDate: "$startDate" }, now] }
        },
        {
          $set: { 
            status: 'expired',
            updatedAt: now
          }
        }
      );
      console.log(`Auto-updated ${expiredResult.modifiedCount} reservations to expired status`);
      

      const pendingCheck = await Reservation.find({ status: 'pending' });
      console.log(`Found ${pendingCheck.length} pending reservations total`);
      pendingCheck.forEach(res => {
        const startDate = new Date(res.startDate);
        const shouldExpire = startDate < now;
        console.log(`Reservation ${res._id}: startDate=${startDate.toISOString()}, now=${now.toISOString()}, shouldExpire=${shouldExpire}`);
      });
      
      return completedResult.modifiedCount + expiredResult.modifiedCount;
    } catch (error) {
      console.error('Error auto-updating reservations:', error);
      return 0;
    }
  };
  

  static createReservation = async (req: Request, res: Response) => {
    console.log('ReservationController.createReservation called');
    console.log('Request body:', req.body);
    try {
      const { cottageId, userUsername, startDate, endDate, adults, children, specialRequests } = req.body;


      if (!cottageId || !userUsername || !startDate || !endDate || !adults) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // ensure authenticated user matches userUsername
      const authUser = (req as any).user as { username: string, role: string } | undefined;
      if (!authUser || authUser.username !== userUsername) {
        return res.status(403).json({ message: 'Not authorized to create reservation for this user' });
      }

      console.log('Cottage ID:', cottageId);

      const cottage = await Cottage.findOne({_id: cottageId});
      if (!cottage) {
        return res.status(404).json({ message: 'Cottage not found' });
      }


      const user = await User.findOne({ username: userUsername });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }


      const start = new Date(startDate);
      const end = new Date(endDate);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      

      const startMonth = start.getMonth() + 1; // 1-12
      const isSummer = startMonth >= 5 && startMonth <= 8;
      const pricePerNight = isSummer ? cottage.PriceSummer : cottage.PriceWinter;
      

      const basePrice = pricePerNight * nights;
      

      let multiplier = 1;
      if (adults === 1) {
        multiplier = 1;
      } else if (adults === 2) {
        multiplier = 1.5;
      } else {
        multiplier = 2;
      }
      
      const totalPrice = Math.round(basePrice * multiplier);


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


      const reservation = new Reservation({
        _id: uuidv4(), // Generate UUID for _id
        cottageId,
        userUsername,
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


  static getUserReservations = async (req: Request, res: Response) => {
    try {

      await this.autoUpdateCompletedReservations();
      
      const { userUsername } = req.params;
      
      const reservations = await Reservation.find({ userUsername })
        .populate('cottageId', 'Title Photos PriceSummer Location')
        .sort({ createdAt: -1 });
      
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


  static getCurrentReservations = async (req: Request, res: Response) => {
    try {

      await this.autoUpdateCompletedReservations();
      
      const { userUsername } = req.params;
      
      const reservations = await Reservation.find({ 
        userUsername,
        status: { $in: ['pending', 'confirmed'] }
      })
        .populate('cottageId', 'Title Photos PriceSummer Location')
        .sort({ startDate: 1 });
      
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching current reservations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


  static getArchivedReservations = async (req: Request, res: Response) => {
    try {

      await this.autoUpdateCompletedReservations();
      
      const { userUsername } = req.params;
      
      const reservations = await Reservation.find({ 
        userUsername,
        status: 'completed'
      })
        .populate('cottageId', 'Title Photos PriceSummer Location')
        .sort({ startDate: -1 }); // Most recent first
      
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching archived reservations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


  static getCottageReservations = async (req: Request, res: Response) => {
    try {

      await this.autoUpdateCompletedReservations();
      
      const { cottageId } = req.params;
      
      const reservations = await Reservation.find({ cottageId })
        .sort({ startDate: 1 });
      
      res.json(reservations);
    } catch (error) {
      console.error('Error fetching cottage reservations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


  static updateReservationStatus = async (req: Request, res: Response) => {
    try {
      const { reservationId } = req.params;
      const { status } = req.body;

      if (!['pending', 'confirmed', 'cancelled', 'completed', 'expired'].includes(status)) {
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


  static cancelReservation = async (req: Request, res: Response) => {
    try {
      const { reservationId } = req.params;
      const authUser = (req as any).user as { username: string, role: string } | undefined; // To verify ownership

      const reservation = await Reservation.findById(reservationId);
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }


      if (!authUser || reservation.userUsername !== authUser.username) {
        return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
      }


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


  static getReservationById = async (req: Request, res: Response) => {
    try {
      const { reservationId } = req.params;
      
      const reservation = await Reservation.findById(reservationId)
        .populate('cottageId', 'Title Photos PriceSummer Description');
      
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
      
      res.json(reservation);
    } catch (error) {
      console.error('Error fetching reservation:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


  static updateReservationCottage = async (req: Request, res: Response) => {
    try {
      const { reservationId } = req.params;
      const { cottageId } = req.body;

      const reservation = await Reservation.findByIdAndUpdate(
        reservationId,
        { cottageId, updatedAt: new Date() },
        { new: true }
      );

      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      res.json({ message: 'Reservation cottage updated', reservation });
    } catch (error) {
      console.error('Error updating reservation cottage:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}
