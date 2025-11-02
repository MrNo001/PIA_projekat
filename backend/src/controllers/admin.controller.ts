import { Request, Response } from 'express';
import User from '../models/user';
import Cottage from '../models/cottage';
import Reservation from '../models/reservation';
import mongoose from 'mongoose';

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const totalTourists = await User.countDocuments({ role: 'tourist' });
    const totalCottages = await Cottage.countDocuments();
    
    // Count pending registration requests (users with isActive: false)
    const pendingRequests = await User.countDocuments({ 
      isActive: false,
      role: { $in: ['owner', 'tourist'] }
    });
    
    // Count blocked cottages
    const blockedCottages = await Cottage.countDocuments({ 
      isBlocked: true,
      blockedUntil: { $gt: new Date() }
    });

    res.json({
      totalUsers,
      totalOwners,
      totalTourists,
      totalCottages,
      pendingRequests,
      blockedCottages
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

// Get all users with pagination and filtering
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role = 'all', 
      status = 'all', 
      search = '' 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = {};
    
    if (role !== 'all') {
      filter.role = role;
    }
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Update user (activate/deactivate and profile fields)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const { isActive, firstName, lastName, email, address, phone, creditCard } = req.body;

    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    if (phone) updateData.phone = phone;
    if (creditCard) updateData.creditCard = creditCard;

    const user = await User.findOneAndUpdate(
      { username },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user permanently
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Delete user and all related data
    await User.findOneAndDelete({ username });
    
    // Delete user's cottages if they're an owner
    if (user.role === 'owner') {
      await Cottage.deleteMany({ OwnerUsername: user.username });
    }
    
    // Delete user's reservations
    await Reservation.deleteMany({ userUsername: user.username });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get pending registration requests
export const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role = 'all', 
      status = 'pending', 
      search = '' 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = { isActive: false };
    
    if (role !== 'all') {
      filter.role = role;
    }
    
    if (status === 'approved') {
      filter.isActive = true;
    } else if (status === 'rejected') {
      filter.isActive = false;
      filter.rejectionReason = { $exists: true };
    }
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const requests = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(filter);

    res.json({
      requests,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
};

// Approve registration request
export const approveRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const user = await User.findOneAndUpdate(
      { username },
      { 
        isActive: true,
        pending: false,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'Registration request approved', user });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
};

// Reject registration request
export const rejectRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      res.status(400).json({ error: 'Rejection reason is required' });
      return;
    }

    const user = await User.findOneAndUpdate(
      { username },
      { 
        isActive: false,
        pending: false,
        rejectionReason,
        rejectedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'Registration request rejected', user });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
};

// Get all cottages with rating information
export const getAllCottages = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      ratingFilter = 'all', 
      statusFilter = 'all', 
      search = '' 
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = {};
    
    if (statusFilter === 'blocked') {
      filter.isBlocked = true;
      filter.blockedUntil = { $gt: new Date() };
    } else if (statusFilter === 'active') {
      filter.$or = [
        { isBlocked: false },
        { blockedUntil: { $lte: new Date() } }
      ];
    }
    
    if (search) {
      filter.$or = [
        { Title: { $regex: search, $options: 'i' } },
        { Description: { $regex: search, $options: 'i' } },
        { OwnerUsername: { $regex: search, $options: 'i' } }
      ];
    }

    const cottages = await Cottage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get rating information for each cottage
    const cottagesWithRatings = await Promise.all(
      cottages.map(async (cottage) => {
        // Get completed reservations with ratings for this cottage
        const reservations = await Reservation.find({
          cottageId: cottage._id,
          status: 'completed',
          'rating.score': { $exists: true }
        }).sort({ 'rating.ratedAt': -1 });

        const ratings = reservations.map(r => r.rating?.score || 0);
        const lastThreeRatings = ratings.slice(0, 3);
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
          : 0;

        return {
          ...cottage.toObject(),
          lastThreeRatings,
          averageRating,
          hasLowRatings: lastThreeRatings.length === 3 && lastThreeRatings.every(r => r < 3)
        };
      })
    );

    // Apply rating filter
    let filteredCottages = cottagesWithRatings;
    if (ratingFilter === 'low') {
      filteredCottages = cottagesWithRatings.filter(c => c.hasLowRatings);
    } else if (ratingFilter === 'normal') {
      filteredCottages = cottagesWithRatings.filter(c => !c.hasLowRatings);
    }

    const total = filteredCottages.length;

    res.json({
      cottages: filteredCottages,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Error fetching cottages:', error);
    res.status(500).json({ error: 'Failed to fetch cottages' });
  }
};

// Block cottage temporarily
export const blockCottage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cottageId } = req.params;
    const { hours = 48 } = req.body;

    const blockedUntil = new Date();
    blockedUntil.setHours(blockedUntil.getHours() + hours);

    const cottage = await Cottage.findByIdAndUpdate(
      cottageId,
      { 
        isBlocked: true,
        blockedUntil
      },
      { new: true }
    );

    if (!cottage) {
      res.status(404).json({ error: 'Cottage not found' });
      return;
    }

    res.json({ 
      message: `Cottage blocked for ${hours} hours`,
      cottage,
      blockedUntil
    });
  } catch (error) {
    console.error('Error blocking cottage:', error);
    res.status(500).json({ error: 'Failed to block cottage' });
  }
};

// Unblock cottage
export const unblockCottage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cottageId } = req.params;

    const cottage = await Cottage.findByIdAndUpdate(
      cottageId,
      { 
        isBlocked: false,
        blockedUntil: null
      },
      { new: true }
    );

    if (!cottage) {
      res.status(404).json({ error: 'Cottage not found' });
      return;
    }

    res.json({ 
      message: 'Cottage unblocked successfully',
      cottage
    });
  } catch (error) {
    console.error('Error unblocking cottage:', error);
    res.status(500).json({ error: 'Failed to unblock cottage' });
  }
};
