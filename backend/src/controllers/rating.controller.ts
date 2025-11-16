import { Request, Response } from 'express';
import Reservation from '../models/reservation';
import Cottage from '../models/cottage';

export class RatingController {
  
  static updateCottageRating = async (cottageId: any) => {
    try {
      const reservations = await Reservation.find({
        cottageId: cottageId,
        status: 'completed',
        'rating.score': { $exists: true }
      });

      if (reservations.length === 0) {
        await Cottage.findByIdAndUpdate(cottageId, { Ocena: -1 });
        return;
      }

      const totalRating = reservations.reduce((sum, reservation) => {
        return sum + (reservation.rating?.score || 0);
      }, 0);

      const averageRating = totalRating / reservations.length;

      await Cottage.findByIdAndUpdate(cottageId, { Ocena: averageRating });
    } catch (error) {
      console.error('Error updating cottage rating:', error);
      throw error;
    }
  };

  static createOrUpdateRating = async (req: Request, res: Response) => {
    try {
      const { reservationId, rating, comment } = req.body;

      if (!reservationId || !rating) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      const reservation = await Reservation.findById(reservationId);

      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      // Only the reservation owner can rate
      const authUser = (req as any).user as { username: string, role: string } | undefined;
      if (!authUser || reservation.userUsername !== authUser.username) {
        return res.status(403).json({ message: 'Not authorized to rate this reservation' });
      }

      if (reservation.status !== 'completed') {
        return res.status(403).json({ 
          message: 'You can only rate completed reservations' 
        });
      }

      reservation.rating = {
        score: rating,
        comment: comment || '',
        ratedAt: new Date()
      };

      await reservation.save();

      await RatingController.updateCottageRating(reservation.cottageId);

      res.status(201).json({ 
        message: 'Rating saved successfully', 
        reservation: reservation 
      });
    } catch (error) {
      console.error('Error creating/updating rating:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  static getReservationRating = async (req: Request, res: Response) => {
    try {
      const { reservationId } = req.params;

      const reservation = await Reservation.findById(reservationId);
      
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      if (!reservation.rating) {
        return res.status(404).json({ message: 'No rating found for this reservation' });
      }

      res.json(reservation.rating);
    } catch (error) {
      console.error('Error fetching rating:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  static getCottageRatings = async (req: Request, res: Response) => {
    try {
      const { cottageId } = req.params;

      const reservations = await Reservation.find({ 
        cottageId, 
        status: 'completed',
        'rating.score': { $exists: true }
      })
        .populate('cottageId', 'Title Photos')
        .sort({ 'rating.ratedAt': -1 });

      const ratings = reservations.map(reservation => ({
        reservationId: reservation._id,
        cottageId: reservation.cottageId,
        userUsername: reservation.userUsername,
        rating: reservation.rating,
        startDate: reservation.startDate,
        endDate: reservation.endDate
      }));

      res.json(ratings);
    } catch (error) {
      console.error('Error fetching cottage ratings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  static getUserRatings = async (req: Request, res: Response) => {
    try {
      const { username } = req.params;

      const reservations = await Reservation.find({ 
        userUsername: username,
        status: 'completed',
        'rating.score': { $exists: true }
      })
        .populate('cottageId', 'Title Photos')
        .sort({ 'rating.ratedAt': -1 });

      const ratings = reservations.map(reservation => ({
        reservationId: reservation._id,
        cottageId: reservation.cottageId,
        userUsername: reservation.userUsername,
        rating: reservation.rating,
        startDate: reservation.startDate,
        endDate: reservation.endDate
      }));

      res.json(ratings);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  static deleteRating = async (req: Request, res: Response) => {
    try {
      const { reservationId } = req.params;

      const reservation = await Reservation.findById(reservationId);
      
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      if (!reservation.rating) {
        return res.status(404).json({ message: 'No rating found for this reservation' });
      }

      // Only the reservation owner can delete their rating
      const authUser = (req as any).user as { username: string, role: string } | undefined;
      if (!authUser || reservation.userUsername !== authUser.username) {
        return res.status(403).json({ message: 'Not authorized to delete this rating' });
      }

      const cottageId = reservation.cottageId;

      reservation.rating = undefined;
      await reservation.save();

      await RatingController.updateCottageRating(cottageId);

      res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
      console.error('Error deleting rating:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}
