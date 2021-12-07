const express = require('express');
const bodyParser = require('body-parser');
const {connection} = require('./model');
const {getProfile} = require('./middleware/getProfile')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', connection)
app.set('models', connection.models)

const controllers = require('./controller');

const router = require('express').Router();
router.get('/contracts/:id', controllers.contracts.get);
router.get('/contracts', controllers.contracts.list);
router.get('/jobs/unpaid', controllers.jobs.listUnpaid);
router.post('/jobs/:job_id/pay', controllers.jobs.pay);
router.post('/balances/deposit/:userId', controllers.balances.deposit);
router.get('/admin/best-profession', controllers.admin.bestProfession);
router.get('/admin/best-clients', controllers.admin.bestClients);

// Handle request
app.use('/', getProfile, router);

// Handle error 404
app.use(function(req, res, next) {
    const err = new Error('Page not found');
    err.status = 404;
    next(err);
});

// Handle errors
app.use(function(error, req, res, next) {
    let status = error.status || 500;

    // Log errors in here if needed
    console.error(error);

    res.status(status);
    res.json({
        status  : status,
        message : error.message
    });
});


module.exports = app;
