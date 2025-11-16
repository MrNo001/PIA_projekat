import { Router, Request, Response } from 'express';
import { ReservationController } from '../controllers/reservation.controller';

const router = Router();

router.use((req, res, next) => {
  console.log(`[Reservation Router] ${req.method} ${req.path}`);
  next();
});

const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => {
  return (req: Request, res: Response, next: any) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};

router.get('/test', (req, res) => {
  res.json({ message: 'Reservation router is working' });
});

router.post('/create', asyncHandler(ReservationController.createReservation));

router.get('/user/:userUsername', asyncHandler(ReservationController.getUserReservations));

router.get('/user/:userUsername/current', asyncHandler(ReservationController.getCurrentReservations));

router.get('/user/:userUsername/archived', asyncHandler(ReservationController.getArchivedReservations));

router.get('/cottage/:cottageId', asyncHandler(ReservationController.getCottageReservations));

router.get('/:reservationId', asyncHandler(ReservationController.getReservationById));

router.put('/:reservationId/status', asyncHandler(ReservationController.updateReservationStatus));

router.put('/:reservationId/cancel', asyncHandler(ReservationController.cancelReservation));

router.put('/:reservationId/cottage', asyncHandler(ReservationController.updateReservationCottage));

export default router;
