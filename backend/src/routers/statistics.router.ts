import express from "express";
import StatisticsController from "../controllers/statistics.controller";

const statisticsRouter = express.Router();

statisticsRouter.get("/cottages", (req, res) => { StatisticsController.getTotalCottages(req, res) });
statisticsRouter.get("/owners", (req, res) => { StatisticsController.getTotalOwners(req, res) });
statisticsRouter.get("/tourists", (req, res) => { StatisticsController.getTotalTourists(req, res) });
statisticsRouter.get("/reservations/last-day", (req, res) => { StatisticsController.getReservationsLastDay(req, res) });
statisticsRouter.get("/reservations/last-week", (req, res) => { StatisticsController.getReservationsLastWeek(req, res) });
statisticsRouter.get("/reservations/last-month", (req, res) => { StatisticsController.getReservationsLastMonth(req, res) });

statisticsRouter.get("/all", (req, res) => { StatisticsController.getAllStatistics(req, res) });

export default statisticsRouter;
