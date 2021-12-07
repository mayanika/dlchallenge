const {Job, Contract, connection} = require('../model');
const {AppError} = require('../common');
const sequelize = require('sequelize');

class JobsModel {
    static async getProfileUnpaidJobs(profile_id) {
        // Take contracts model to get statuses constants. Statuses could be moved to some external config if need. In that case we will need to require that config in here.
        const ContractsModel = require('../models/contracts');

        return await Job.findAll({
            where: {
                paid: null
            },

            include: [
                {
                    model: Contract,
                    attributes: [],
                    where: {
                        [sequelize.Op.or]: [
                            {ClientId: profile_id},
                            {ContractorId: profile_id}
                        ],

                        status: ContractsModel.status.IN_PROGRESS
                    }
                }
            ]
        });
    }

    static async getClientTotalUnpaidBalance(client_id, transaction) {
        return Job.sum('price', {
            where: {
                paid: null
            },

            include: [
                {
                    model: Contract,
                    attributes: [],
                    where: {
                        ClientId: client_id
                    }
                }
            ],

            transaction
        });
    }

    static async payForJob(client_id, job_id) {
        const ProfilesModel = require('../models/profiles');

        let transaction = await connection.transaction();

        try {
            let client = await ProfilesModel.getClientInfo(client_id, ['id', 'balance'], transaction);
            if (!client) {
                throw new AppError(404, 'Client not found', {reason: 'client_not_found'});
            }

            let job = await Job.findOne({
                attributes: ['id', 'price', 'paid'],
                where: {
                    id: job_id
                },
                include: [
                    {
                        model: Contract,
                        //TODO: Maybe we should check the status of contract - if it is not terminated? Need to ask PM.
                        attributes: ['ContractorId'],
                        where: {
                            ClientId: client.id
                        }
                    }
                ],
                transaction
            });
            if (!job) {
                throw new AppError(404, 'Job not found', {reason: 'job_not_found'});
            }
            else if (job.paid) {
                throw new AppError(500, 'Job is already paid', {reason: 'job_is_paid'});
            }
            else if (client.balance < job.price) {
                throw new AppError(500, 'Client has insufficient funds', {reason: 'client_insufficient_funds'});
            }

            let contractor = await ProfilesModel.getContractorInfo(job.Contract.ContractorId, ['id', 'balance'], transaction);
            let amount = job.price;

            await client.update({balance: client.balance - amount}, {transaction});
            await contractor.update({balance: contractor.balance + amount}, {transaction});

            await transaction.commit();

            return true;
        }
        catch(error) {
            await transaction.rollback();// Assume success
            throw error;
        }
    }
}

module.exports = JobsModel;