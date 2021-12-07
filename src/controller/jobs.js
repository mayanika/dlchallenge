const JobsModel = require('../models/jobs');

class JobsController {
    static async listUnpaid(req, res, next) {
        try {
            res.json(await JobsModel.getProfileUnpaidJobs(req.profile.id));
        }
        catch(error) {
            next(error);
        }
    }

    static async pay(req, res, next) {
        try {
            res.json(await JobsModel.payForJob(req.profile.id, parseInt(req.params.job_id) || null));
        }
        catch(error) {
            next(error);
        }
    }
}

module.exports = JobsController;