var express = require('express');
var router = express.Router();

/*Get image page*/
router.get('/', function(req, res, next){
	res.render('image.ejs', {title: 'Show images!'});
});

module.exports = router;