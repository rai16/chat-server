var router = require('express').Router()
var auth = require('../auth')
var MessageController = require('../../controllers/MessageController')
//TODO: Add auth.required after dev done
//given a user id, function will return all messages sent to or from this user
router.get('/:userId', MessageController.getAllMessagesForUserId)

//given sender and receiver return all messages between them
router.get('/:senderId/:receiverId', MessageController.getAllMessagesForSenderAndReceiverIds)

//send a message to a particular user
router.post('/send', MessageController.sendMessage)

module.exports = router;
