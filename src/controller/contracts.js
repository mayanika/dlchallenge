const ContractsModel = require('../models/contracts');
const ProfilesModel = require('../models/profiles');
const {AppError} = require('../common');

class ContractsController {
    static async get(req, res, next) {
        try {
            let contract_id = parseInt(req.params.id) || null;

            let contract;
            // Use profile type to divide logic of contract data fetch in case of different rights or data output (for example)
            if (req.profile.type === ProfilesModel.type.CLIENT) {
                contract = await ContractsModel.getClientContract(req.profile.id, contract_id);
            }
            else if(req.profile.type === ProfilesModel.type.CONTRACTOR) {
                contract = await ContractsModel.getContractorContract(req.profile.id, contract_id);
            }
            else {
                throw new AppError(403, 'Access forbidden');
            }

            res.json(contract);
        }
        catch(error) {
            next(error);
        }
    }

    static async list(req, res, next) {
        try {
            let list;
            // Use profile type to divide logic of contracts data fetch in case of different rights or data output (for example)
            if (req.profile.type === ProfilesModel.type.CLIENT) {
                list = await ContractsModel.getClientOpenContractsList(req.profile.id);
            }
            else if(req.profile.type === ProfilesModel.type.CONTRACTOR) {
                list = await ContractsModel.getContractorOpenContractsList(req.profile.id);
            }
            else {
                throw new AppError(403, 'Access forbidden');
            }

            res.json(list);
        }
        catch(error) {
            next(error);
        }
    }
}

module.exports = ContractsController;