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

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

// User management routes
router.get('/users', getAllUsers);
router.put('/users/:username', updateUser);
router.delete('/users/:username', deleteUser);

// Registration request routes
router.get('/requests', getPendingRequests);
router.put('/requests/:username/approve', approveRequest);
router.put('/requests/:username/reject', rejectRequest);

// Cottage management routes
router.get('/cottages', getAllCottages);
router.put('/cottages/:cottageId/block', blockCottage);
router.put('/cottages/:cottageId/unblock', unblockCottage);

export default router;
