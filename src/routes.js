const router = require('express').Router();

const LoginController = require('./controllers/login.controller');

router.post('/signup', LoginController.signup);

module.exports = router;
