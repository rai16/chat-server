var _ = require('lodash');
var mongoose = require('mongoose');
var router = require('express').Router();
var User = mongoose.model('User');
var crypto = require('crypto');

router.get('/', function(req, res, next){
    var users = User.find({})
    .exec(function(err, users){
        if(err)
            next();
    //send only username and last seen
        var result = [];
        users.forEach(user => {
            result.push(_.pick(user, ['_id', 'username', 'last_seen', 'create_date']));
        });
        return res.json({users: result});
    });
})

router.get('/:id', function(req, res, next){
    User.findById(req.params.id)
    .exec(function(err, user){
        if(err)
            return res.status(422).json({errors: "User not found."});

        if(!user){
            return res.status(401);
        }
        return res.json({user: _.pick(user, ['username', 'last_seen', 'create_date'])});
    });
})

router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(422).json({errors: "Username/Password can't be blank"});
    }

    User.findOne({username: req.body.username})
    .exec(function(err, user){
        if(err)
            return res.status(401).json({errors: "Could not login. please try again."});
        
        if(user === null){
            return res.status(401).json({errors: "User doesn't exist. Please register."});
        }
        var hash = crypto.pbkdf2Sync(req.body.password, user.salt, 10000, 512, 'sha512').toString('hex');
        if(hash !== user.hash){
            return res.status(401).json({errors: "The password isn't correct. Please try again."});
        }
        return res.json({loggedIn: true, userid: user._id.toString()});
    });
})

router.post('/register', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(422).json({errors: "Username/Password can't be blank"});
    }

    var user = new User();
    user.username = req.body.username;
    user.salt = crypto.randomBytes(16).toString('hex');
    user.hash = crypto.pbkdf2Sync(req.body.password, user.salt, 10000, 512, 'sha512').toString('hex');
    user.last_seen = null;
    
    user.save().then(function(){
        return res.json({userCreated: true});
    }).catch(next);

})

module.exports = router;