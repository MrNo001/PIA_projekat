import { Router, Request, Response } from 'express';
import { ReservationController } from '../controllers/reservation.controller';

const router = Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`[Reservation Router] ${req.method} ${req.path}`);
  next();
});

// Helper function to handle async controller methods
const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => {
  return (req: Request, res: Response, next: any) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Reservation router is working' });
});

// Create a new reservation
router.post('/create', asyncHandler(ReservationController.createReservation));

// Get all reservations for a user
router.get('/user/:userUsername', asyncHandler(ReservationController.getUserReservations));

// Get current reservations for a user (pending, confirmed)
router.get('/user/:userUsername/current', asyncHandler(ReservationController.getCurrentReservations));

// Get archived reservations for a user (completed, cancelled)
router.get('/user/:userUsername/archived', asyncHandler(ReservationController.getArchivedReservations));

// Get all reservations for a cottage
router.get('/cottage/:cottageId', asyncHandler(ReservationController.getCottageReservations));

// Get reservation by ID
router.get('/:reservationId', asyncHandler(ReservationController.getReservationById));

// Update reservation status
router.put('/:reservationId/status', asyncHandler(ReservationController.updateReservationStatus));

// Cancel reservation
router.put('/:reservationId/cancel', asyncHandler(ReservationController.cancelReservation));

// Update reservation cottage reference
router.put('/:reservationId/cottage', asyncHandler(ReservationController.updateReservationCottage));

export default router;
