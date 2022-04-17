const express = require('express');
const router = express.Router();

const authController = require('../app/controllers/AuthController');
const middlewareController = require('../app/controllers/MiddlewareController');

// router.put('/:id', authController.updatePassword);
// router.delete('/:id', authController.deletePassword);


router.get('/login', authController.login);
router.post('/login', authController.loginCon);

// router.get('/private', middlewareController.verifyToken ,authController.private1);
// router.get('/student', middlewareController.verifyToken, middlewareController.checkAdmin, authController.private2);

router.get('/register', authController.register);
router.post('/register', authController.registerCon);

router.post("/logout", middlewareController.verifyToken, authController.userLogout);

module.exports = router;