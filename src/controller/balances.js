const ProfilesModel = require('../models/profiles');

class BalancesController {
    static async deposit(req, res, next) {
        try {
            // Better check some security rights of req.profile on deposit action of userId from request
            res.json(await ProfilesModel.depositClientBalance(parseInt(req.params.userId) || null, parseFloat(req.body.deposit)));
        }
        catch(error) {
            next(error);
        }
    }
}

module.exports = BalancesController;