const {Profile, connection} = require('../model');
const {AppError} = require('../common');

class ProfilesModel {
    static get type() {
        return {
            CLIENT      : 'client',
            CONTRACTOR  : 'contractor'
        }
    }

    static async getClientInfo(client_id, attributes, transaction) {
        return Profile.findOne({
            attributes: attributes,
            where: {
                id: client_id,
                type: ProfilesModel.type.CLIENT
            },
            transaction
        });
    }

    static async getContractorInfo(contractor_id, attributes, transaction) {
        return Profile.findOne({
            attributes: attributes,
            where: {
                id: contractor_id,
                type: ProfilesModel.type.CONTRACTOR
            },
            transaction
        });
    }

    static async depositClientBalance(client_id, deposit) {
        deposit = Math.abs(parseInt(deposit) || 0); //Ensure deposit is positive value
        if (!deposit) {
            throw new AppError(500, 'Deposit value are empty or not a number', {reason: 'deposit_incorrect'});
        }

        const JobsModel = require('../models/jobs');
        let transaction = await connection.transaction();

        try {
            let client = await ProfilesModel.getClientInfo(client_id, ['id', 'balance'], transaction);
            if (!client) {
                throw new AppError(404, 'Client not found', {reason: 'client_not_found'});
            }

            let total_unpaid_balance = await JobsModel.getClientTotalUnpaidBalance(client.id, transaction);
            let max_deposit = total_unpaid_balance * 0.25;
            if (deposit > max_deposit) {
                throw new AppError(500, 'Deposit value can not be more than 25% of unpaid jobs total', {reason: 'deposit_too_large'});
            }

            await client.update({balance: client.balance + deposit}, {transaction});

            await transaction.commit();
        }
        catch(error) {
            await transaction.rollback();
            throw error;
        }

    }
}

module.exports = ProfilesModel;