const StatisticsModel = require('../models/statistics');

class AdminController {
    static async bestProfession(req, res, next) {
        try {
            res.json(await StatisticsModel.getBestProfession(req.query.start_date, req.query.end_date));
        }
        catch(error) {
            next(error);
        }
    }

    static async bestClients(req, res, next) {
        try {
            res.json(await StatisticsModel.getBestClients(req.query.start_date, req.query.end_date, parseInt(req.query.limit)));
        }
        catch(error) {
            next(error);
        }
    }
}

module.exports = AdminController;