const {Contract} = require('../model');
const {AppError} = require('../common');
const sequelize = require('sequelize');

class ContractsModel {
    static get status() {
        return {
            NEW         : 'new',
            IN_PROGRESS : 'in_progress',
            TERMINATED  : 'terminated'
        };
    }

    static async getClientContract(client_id, contract_id) {
        let contract = await Contract.findOne({
            where: {
                id: contract_id,
                ClientId: client_id
            }
        });

        if (!contract) {
            throw new AppError(404, 'Contract not found', {reason: 'contract_not_found'});
        }

        return contract;
    }

    static async getClientOpenContractsList(client_id) {
        return Contract.findAll({
            where: {
                ClientId: client_id,
                status: {
                    [sequelize.Op.ne]: ContractsModel.status.TERMINATED
                }
            }
        });
    }

    static async getContractorContract(contractor_id, contract_id){
        let contract = await Contract.findOne({
            where: {
                id: contract_id,
                ContractorId: contract_id
            }
        });

        if (!contract) {
            throw new AppError(404, 'Contract not found', {reason: 'contract_not_found'});
        }

        return contract;
    }

    static async getContractorOpenContractsList(contractor_id){
        return Contract.findAll({
            where: {
                ContractorId: contractor_id,
                status: {
                    [sequelize.Op.ne]: ContractsModel.status.TERMINATED
                }
            }
        });
    }
}

module.exports = ContractsModel;