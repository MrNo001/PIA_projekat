import { Router, Request, Response } from 'express';
import { ReservationController } from '../controllers/reservation.controller';

const router = Router();

// Helper function to handle async controller methods
const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => {
  return (req: Request, res: Response, next: any) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};

// Create a new reservation
router.post('/', asyncHandler(ReservationController.createReservation));

// Get all reservations for a user
router.get('/user/:userId', asyncHandler(ReservationController.getUserReservations));

// Get all reservations for a cottage
router.get('/cottage/:cottageId', asyncHandler(ReservationController.getCottageReservations));

// Get reservation by ID
router.get('/:reservationId', asyncHandler(ReservationController.getReservationById));

// Update reservation status
router.put('/:reservationId/status', asyncHandler(ReservationController.updateReservationStatus));

// Cancel reservation
router.put('/:reservationId/cancel', asyncHandler(ReservationController.cancelReservation));

export default router;
