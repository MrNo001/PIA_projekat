import { Router, Request, Response } from 'express';
import { RatingController } from '../controllers/rating.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
      
const asyncHandler = (fn: (req: Request, res: Response) => Promise<any>) => {
  return (req: Request, res: Response, next: any) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};

router.post('/', authenticateJWT as any, asyncHandler(RatingController.createOrUpdateRating));

router.get('/reservation/:reservationId', asyncHandler(RatingController.getReservationRating));

router.get('/cottage/:cottageId', asyncHandler(RatingController.getCottageRatings));

router.get('/user/:username', asyncHandler(RatingController.getUserRatings));

router.delete('/reservation/:reservationId', authenticateJWT as any, asyncHandler(RatingController.deleteRating));

export default router;
