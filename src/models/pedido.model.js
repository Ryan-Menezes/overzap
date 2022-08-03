const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Restaurante = require('./restaurante.model');
const Cliente = require('./cliente.model');

const PedidoSchema = new Schema({
    restauranteId: {
        type: mongoose.Types.ObjectId,
        ref: 'restaurante',
        required: true,
    },
    clienteId: {
        type: mongoose.Types.ObjectId,
        ref: 'cliente',
        required: true,
    },
    situacao: {
        type: String,
        enum: ['A', 'F', 'P', 'S', 'E', 'C'], // Aberto, Fila, Preparando, Saída, Entrega, Concluído
        default: 'A',
    },
    data: {
        type: Date,
        default: Date.now(),
    },
});

// Validação para restaurante
PedidoSchema.post('validate', (doc, next) => {
    Restaurante.findById(doc.restauranteId, (err, restaurante) => {
        if (err || !restaurante) {
            return next(new Error('Restaurante não existe'));
        }

        next();
    })
});

// Validação para cliente
PedidoSchema.post('validate', (doc, next) => {
    Cliente.findById(doc.clienteId, (err, cliente) => {
        if (err || !cliente) {
            return next(new Error('Cliente não existe'));
        }

        if (doc.restauranteId.toString() != cliente.restauranteId.toString()) {
            return next(new Error('Cliente não existe'));
        }

        next();
    })
});

module.exports = mongoose.model('pedido', PedidoSchema);
