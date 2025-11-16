import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getAllCottages,
  blockCottage,
  unblockCottage
} from '../controllers/admin.controller';

const router = express.Router();

router.get('/dashboard/stats', getDashboardStats);

router.get('/users', getAllUsers);
router.put('/users/:username', updateUser);
router.delete('/users/:username', deleteUser);

router.get('/requests', getPendingRequests);
router.put('/requests/:username/approve', approveRequest);
router.put('/requests/:username/reject', rejectRequest);

router.get('/cottages', getAllCottages);
router.put('/cottages/:cottageId/block', blockCottage);
router.put('/cottages/:cottageId/unblock', unblockCottage);

export default router;
