var express = require('express'),
  router = express.Router();

router.use('/api', require('./api.routes'));

module.exports = router;
