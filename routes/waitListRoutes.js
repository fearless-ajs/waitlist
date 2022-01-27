const express = require('express');
const WaitListController = require('./../app/Http/Controllers/WaitListController');

const router = express.Router();

router.route('/')
    .post(WaitListController.joinWaitList);
module.exports = router;