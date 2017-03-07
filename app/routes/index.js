var express = require('express'),
  router = express.Router();

router.use('/api', require('./api.routes'));
router.use('/scrape', require('./scrape.routes'));

module.exports = router;
