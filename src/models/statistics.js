const {Job, Contract, Profile} = require('../model');
const moment = require('moment');
const {AppError} = require('../common');
const sequelize = require('sequelize');

const ProfilesModel = require('./profiles');

class StatisticsModel {
    static async getBestProfession(start_date, end_date) {
        let start_date_value = moment(start_date);
        if (!start_date_value.isValid()) {
            throw new AppError(500, 'Invalid start date', {reason: 'start_date_invalid'});
        }

        let end_date_value = moment(end_date);
        if (!end_date || !end_date_value.isValid()) {
            throw new AppError(500, 'Invalid end date', {reason: 'end_date_invalid'});
        }

        if (end_date_value < start_date_value) {
            throw new AppError(500, 'Invalid time range', {reason: 'time_range_invalid'});
        }

        // Not sure if it is best syntax of sequelize query. In my opinion it would be better to make raw query
        // or change database structure for table Jobs to have additional fields ContractorId and ClientId. It would require more space on
        // disk to store that redundant data but the queries would be much simpler and faster.
        let result = await Job.findOne({
            attributes: [
                sequelize.col('profession')
            ],
            raw: true,
            where: {
                paid: 1,
                [sequelize.Op.and]: [
                    {
                        paymentDate: {
                            [sequelize.Op.gte]: start_date_value
                        }
                    },
                    {
                        paymentDate: {
                            [sequelize.Op.lte]: end_date_value
                        }
                    }
                ]
            },
            include: [
                {
                    model: Contract,
                    include: [
                        {
                            model: Profile,
                            attributes: ['id', 'profession'],
                            as: 'Contractor',
                            where: {
                                type: ProfilesModel.type.CONTRACTOR
                            }
                        }
                    ]
                }
            ],
            group: [
                sequelize.col('profession')
            ],
            order: [
                [sequelize.fn('sum', sequelize.col('Job.price')), 'desc']
            ]
        });

        return result ? result.profession : '';
    }

    static async getBestClients(start_date, end_date, limit) {
        limit = parseInt(limit) || 2;

        let start_date_value = moment(start_date);
        if (!start_date_value.isValid()) {
            throw new AppError(500, 'Invalid start date', {reason: 'start_date_invalid'});
        }

        let end_date_value = moment(end_date);
        if (!end_date || !end_date_value.isValid()) {
            throw new AppError(500, 'Invalid end date', {reason: 'end_date_invalid'});
        }

        if (end_date_value < start_date_value) {
            throw new AppError(500, 'Invalid time range', {reason: 'time_range_invalid'});
        }

        // Same as with getBestProfession. I think there should be much better way to do that kind of queries %)
        let result = await Job.findAll({
            attributes: [
                [sequelize.fn('sum', sequelize.col('Job.price')), 'paid']
            ],
            raw: true,
            where: {
                paid: 1,
                [sequelize.Op.and]: [
                    {
                        paymentDate: {
                            [sequelize.Op.gte]: start_date_value
                        }
                    },
                    {
                        paymentDate: {
                            [sequelize.Op.lte]: end_date_value
                        }
                    }
                ]
            },
            include: [
                {
                    model: Contract,
                    include: [
                        {
                            model: Profile,
                            attributes: ['id', 'firstName', 'lastName'],
                            as: 'Client',
                            where: {
                                type: ProfilesModel.type.CLIENT
                            }
                        }
                    ]
                }
            ],
            group: [
                sequelize.col('Contract->Client.id')
            ],
            order: [
                [sequelize.fn('sum', sequelize.col('Job.price')), 'desc']
            ],
            limit: limit
        });

        return result.map((client) => {
            return {
                id: client['Contract.ClientId'],
                fullName: client['Contract.Client.firstName']+' '+client['Contract.Client.lastName'],
                paid: client.paid
            };
        });
    }
}

module.exports = StatisticsModel;