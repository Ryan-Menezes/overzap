const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Pedido = require('./pedido.model');
const Produto = require('./produto.model');

const PedidoProdutoSchema = new Schema({
    pedidoId: {
        type: mongoose.Types.ObjectId,
        ref: 'pedido',
        required: true,
    },
    produtoId: {
        type: mongoose.Types.ObjectId,
        ref: 'produto',
        required: true,
    },
    valorUnitario: {
        type: Number,
        required: true,
    },
    quantidade: {
        type: Number,
        default: 1,
    },
    observacao: {
        type: String,
    },
});

// Validação para restaurante
PedidoProdutoSchema.post('validate', (doc, next) => {
    const pedido = await Pedido.findById(doc.pedidoId);
    const produto = await Produto.findById(doc.produtoId);

    if (!pedido || !produto || !pedido.restauranteId.toString() == produto.restauranteId.toString()) {
        return next(new Error('Pedido ou produto não existem!'));
    }

    next();
});

module.exports = mongoose.model('pedido_produto', PedidoProdutoSchema);
