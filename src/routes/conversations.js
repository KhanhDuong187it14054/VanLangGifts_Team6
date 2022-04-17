const express = require('express');
const router = express.Router();

const conversationController = require('../app/controllers/ConversationController');
const middlewareController = require('../app/controllers/MiddlewareController');

//get conversation
// router.get("/:userId", middlewareController.verifyToken, conversationController.create , conversationController.getCon)
router.get("/:userId", middlewareController.verifyToken, conversationController.createConversation)

module.exports = router;