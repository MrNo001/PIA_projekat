import { Request, Response } from 'express';
import Cottage from '../models/cottage';
import User from '../models/user';
import Reservation from '../models/reservation';

class StatisticsController {
    
    // Get total number of cottages
    static getTotalCottages(req: Request, res: Response) {
        Cottage.countDocuments({})
            .then(count => {
                res.status(200).json({ count });
            })
            .catch(err => {
                console.error('Error counting cottages:', err);
                res.status(500).json({ message: 'Failed to count cottages', error: err.message });
            });
    }

    // Get total number of owners
    static getTotalOwners(req: Request, res: Response) {
        User.countDocuments({ role: 'owner', isActive: true })
            .then(count => {
                res.status(200).json({ count });
            })
            .catch(err => {
                console.error('Error counting owners:', err);
                res.status(500).json({ message: 'Failed to count owners', error: err.message });
            });
    }

    // Get total number of tourists
    static getTotalTourists(req: Request, res: Response) {
        User.countDocuments({ role: 'tourist', isActive: true })
            .then(count => {
                res.status(200).json({ count });
            })
            .catch(err => {
                console.error('Error counting tourists:', err);
                res.status(500).json({ message: 'Failed to count tourists', error: err.message });
            });
    }

    // Get reservations from last day
    static getReservationsLastDay(req: Request, res: Response) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        Reservation.countDocuments({ 
            createdAt: { $gte: yesterday } 
        })
            .then(count => {
                res.status(200).json({ count });
            })
            .catch(err => {
                console.error('Error counting reservations from last day:', err);
                res.status(500).json({ message: 'Failed to count reservations from last day', error: err.message });
            });
    }

    // Get reservations from last week
    static getReservationsLastWeek(req: Request, res: Response) {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        lastWeek.setHours(0, 0, 0, 0);

        Reservation.countDocuments({ 
            createdAt: { $gte: lastWeek } 
        })
            .then(count => {
                res.status(200).json({ count });
            })
            .catch(err => {
                console.error('Error counting reservations from last week:', err);
                res.status(500).json({ message: 'Failed to count reservations from last week', error: err.message });
            });
    }

    // Get reservations from last month
    static getReservationsLastMonth(req: Request, res: Response) {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        lastMonth.setHours(0, 0, 0, 0);

        Reservation.countDocuments({ 
            createdAt: { $gte: lastMonth } 
        })
            .then(count => {
                res.status(200).json({ count });
            })
            .catch(err => {
                console.error('Error counting reservations from last month:', err);
                res.status(500).json({ message: 'Failed to count reservations from last month', error: err.message });
            });
    }

    // Get all statistics in one call
    static getAllStatistics(req: Request, res: Response) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        lastWeek.setHours(0, 0, 0, 0);

        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        lastMonth.setHours(0, 0, 0, 0);

        Promise.all([
            Cottage.countDocuments({}),
            User.countDocuments({ role: 'owner', isActive: true }),
            User.countDocuments({ role: 'tourist', isActive: true }),
            Reservation.countDocuments({ createdAt: { $gte: yesterday } }),
            Reservation.countDocuments({ createdAt: { $gte: lastWeek } }),
            Reservation.countDocuments({ createdAt: { $gte: lastMonth } })
        ])
            .then(([cottages, owners, tourists, reservationsLastDay, reservationsLastWeek, reservationsLastMonth]) => {
                res.status(200).json({
                    cottages,
                    owners,
                    tourists,
                    reservationsLastDay,
                    reservationsLastWeek,
                    reservationsLastMonth
                });
            })
            .catch(err => {
                console.error('Error getting all statistics:', err);
                res.status(500).json({ message: 'Failed to get statistics', error: err.message });
            });
    }
}

export default StatisticsController;
