import { Request, Response } from 'express';
import Reservation from '../models/reservation';
import Cottage from '../models/cottage';

export class RatingController {
  
  // Helper method to update cottage's average rating
  static updateCottageRating = async (cottageId: any) => {
    try {
      // Get all completed reservations with ratings for this cottage
      const reservations = await Reservation.find({
        cottageId: cottageId,
        status: 'completed',
        'rating.score': { $exists: true }
      });

      if (reservations.length === 0) {
        // No ratings yet, set Ocena to -1
        await Cottage.findByIdAndUpdate(cottageId, { Ocena: -1 });
        return;
      }

      // Calculate average rating
      const totalRating = reservations.reduce((sum, reservation) => {
        return sum + (reservation.rating?.score || 0);
      }, 0);

      const averageRating = totalRating / reservations.length;

      // Update the cottage's Ocena field
      await Cottage.findByIdAndUpdate(cottageId, { Ocena: averageRating });
    } catch (error) {
      console.error('Error updating cottage rating:', error);
      throw error;
    }
  };

  // Create or update a rating for a specific reservation
  static createOrUpdateRating = async (req: Request, res: Response) => {
    try {
      const { reservationId, rating, comment } = req.body;

      // Validate required fields
      if (!reservationId || !rating) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Validate rating range
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      // Find the reservation
      const reservation = await Reservation.findById(reservationId);

      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      // Check if reservation is completed
      if (reservation.status !== 'completed') {
        return res.status(403).json({ 
          message: 'You can only rate completed reservations' 
        });
      }

      // Update the reservation with rating
      reservation.rating = {
        score: rating,
        comment: comment || '',
        ratedAt: new Date()
      };

      await reservation.save();

      // Update the cottage's Ocena (average rating)
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

  // Get rating for a specific reservation
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

  // Get all ratings for a cottage (from completed reservations)
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

  // Get all ratings by a user (from their completed reservations)
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

  // Delete a rating (remove rating from reservation)
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

      const cottageId = reservation.cottageId;

      // Remove the rating
      reservation.rating = undefined;
      await reservation.save();

      // Update the cottage's Ocena (average rating)
      await RatingController.updateCottageRating(cottageId);

      res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
      console.error('Error deleting rating:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}
