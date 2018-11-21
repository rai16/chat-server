var _ = require('lodash');
var mongoose = require('mongoose');
var router = require('express').Router();
var User = mongoose.model('User');

router.get('/', function(req, res, next){
    var users = User.find({});
    //send only username and last seen
    var result = [];
    for(user in users){
        result.push(_.pick(user, ['username', 'last_seen']));
    }
    res.json({users: user});
    next();
})

router.get('/:id', function(req, res, next){
    var user = User.findById(req.params.id);
    if(!user){
        return res.status(401);
    }
    return res.json({user: user});
})

router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(422).json({errors: "Username/Password can't be blank"});
    }
    var user = User.findOne({username: req.body.username});
    if(!user){
        return res.status(422).json({errors: "User doesn't exist. Please register."});
    }
    if(!user.validPassword(req.body.password)){
        return res.status(422).json({errors: "The password isn't correct. Please try again."});
    }
    return res.json({loggedIn: true});
})

router.post('/register', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(422).json({errors: "Username/Password can't be blank"});
    }

    var user = new User();
    user.username = req.body.username;
    user.setPassword(req.body.password);
    user.last_seen = NULL;
    
    user.save().then(function(){
        return res.json({userCreated: true});
    }).catch(next);
    
})

module.exports = router;