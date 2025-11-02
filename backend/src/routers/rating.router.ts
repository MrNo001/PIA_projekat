import { Router, Request, Response } from 'express';
import { RatingController } from '../controllers/rating.controller';

const router = Router();

// Helper function to handle async controller methods
const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => {
  return (req: Request, res: Response, next: any) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};

// Create or update a rating for a reservation
router.post('/', asyncHandler(RatingController.createOrUpdateRating));

// Get rating for a specific reservation
router.get('/reservation/:reservationId', asyncHandler(RatingController.getReservationRating));

// Get all ratings for a cottage (from completed reservations)
router.get('/cottage/:cottageId', asyncHandler(RatingController.getCottageRatings));

// Get all ratings by a user (from their completed reservations)
router.get('/user/:username', asyncHandler(RatingController.getUserRatings));

// Delete a rating (remove from reservation)
router.delete('/reservation/:reservationId', asyncHandler(RatingController.deleteRating));

export default router;
