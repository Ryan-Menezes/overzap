const router = require('express').Router();

// MIDDLEWARES
const { authentication } = require('./middleware');

// CONTROLLERS
const LoginController = require('./controllers/login.controller');
const ClienteController = require('./controllers/cliente.controller');
const CategoriaController = require('./controllers/categoria.controller');
const RestauranteController = require('./controllers/restaurante.controller');
const ProdutoController = require('./controllers/produto.controller');
const PedidoController = require('./controllers/pedido.controller');


// Login
router.post('/signup', LoginController.signup);
router.post('/login', LoginController.login);

// Restaurante
router.get('/restaurantes', authentication, RestauranteController.index);
router.put('/restaurantes/:id', authentication, RestauranteController.update);
router.delete('/restaurantes/:id', authentication, RestauranteController.delete);

// Cliente
router.get('/clientes', authentication, ClienteController.index);
router.post('/clientes', authentication, ClienteController.store);
router.put('/clientes/:id', authentication, ClienteController.update);
router.delete('/clientes/:id', authentication, ClienteController.delete);

// Categoria
router.get('/categorias', authentication, CategoriaController.index);
router.post('/categorias', authentication, CategoriaController.store);
router.put('/categorias/:id', authentication, CategoriaController.update);
router.delete('/categorias/:id', authentication, CategoriaController.delete);

// Produto
router.get('/produtos', authentication, ProdutoController.index);
router.post('/produtos', authentication, ProdutoController.store);
router.put('/produtos/:id', authentication, ProdutoController.update);
router.delete('/produtos/:id', authentication, ProdutoController.delete);

// Pedido
router.get('/pedidos', authentication, PedidoController.index);
router.post('/pedidos', authentication, PedidoController.store);
router.put('/pedidos/:id', authentication, PedidoController.update);
router.post('/pedidos/:id/add', authentication, PedidoController.addItem);
router.delete('/pedidos/:id', authentication, PedidoController.delete);

module.exports = router;
