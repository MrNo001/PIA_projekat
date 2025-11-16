import { Router, Request, Response } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { authenticateJWT, authorizeRoles, authorizeSelfOrRoles } from '../middleware/auth';

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

router.post('/create', authenticateJWT as any, asyncHandler(ReservationController.createReservation));

router.get('/user/:userUsername', authenticateJWT as any, authorizeSelfOrRoles('userUsername','administrator') as any, asyncHandler(ReservationController.getUserReservations));

router.get('/user/:userUsername/current', authenticateJWT as any, authorizeSelfOrRoles('userUsername','administrator') as any, asyncHandler(ReservationController.getCurrentReservations));

router.get('/user/:userUsername/archived', authenticateJWT as any, authorizeSelfOrRoles('userUsername','administrator') as any, asyncHandler(ReservationController.getArchivedReservations));

router.get('/cottage/:cottageId', asyncHandler(ReservationController.getCottageReservations));

router.get('/:reservationId', asyncHandler(ReservationController.getReservationById));

router.put('/:reservationId/status', authenticateJWT as any, authorizeRoles('administrator') as any, asyncHandler(ReservationController.updateReservationStatus));

router.put('/:reservationId/cancel', authenticateJWT as any, asyncHandler(ReservationController.cancelReservation));

router.put('/:reservationId/cottage', authenticateJWT as any, authorizeRoles('administrator') as any, asyncHandler(ReservationController.updateReservationCottage));

export default router;
