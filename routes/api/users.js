var mongoose = require('mongoose');
var router = require('express').Router();
var User = mongoose.model('User');

router.get('/:id', function(req, res, next){
    var user = User.findById(req.params.id);
    if(!user)
        return res.status(401);
    
    res.json({user: user});
    next();
})

module.exports = router;