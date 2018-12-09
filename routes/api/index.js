var router = require('express').Router();

router.use('/users', require('./users'));
router.use('/messages', require('./messages'));

module.exports = router;