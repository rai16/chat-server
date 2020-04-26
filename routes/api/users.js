var auth = require('../auth')
var router = require('express').Router()
var UserController = require('../../controllers/UserController')
//TODO: Add auth.required after dev done
//get all users
router.get('/', UserController.getUserList)

//get user by id
router.get('/:id', UserController.findUserById)

//check if username exist
router.get('/check/:username', UserController.checkIfUsernamePresent)

//login a user
router.post('/login', UserController.userLogin)

//register a new user
router.post('/register', UserController.registerUser)

module.exports = router;
