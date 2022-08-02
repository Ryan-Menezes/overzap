const router = require('express').Router();

const LoginController = require('./controllers/login.controller');
const CategoryController = require('./controllers/categoria.controller');

router.get('/', LoginController.index);
router.post('/signup', LoginController.signup);
router.post('/login', LoginController.login);

router.get('/categorias', CategoryController.index);
router.post('/categorias', CategoryController.store);
router.put('/categorias/:id', CategoryController.update);
router.delete('/categorias/:id', CategoryController.delete);

module.exports = router;
