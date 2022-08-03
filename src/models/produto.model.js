const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Categoria = require('./categoria.model');
const Restaurante = require('./restaurante.model');

const ProdutoSchema = new Schema({
    nome: {
        type: String,
        required: true,
    },
    descricao: {
        type: String,
    },
    valor: {
        type: Number,
        required: true,
    },
    situacao: {
        type: String,
        enum: ['A', 'I', 'E'], // Ativo, Inativo, Excluído
        default: 'A',
    },
    categoriaId: {
        type: mongoose.Types.ObjectId,
        ref: 'categoria',
    },
    restauranteId: {
        type: mongoose.Types.ObjectId,
        ref: 'restaurante',
        required: true,
    },
});

// Validação para restaurante
ProdutoSchema.post('validate', (doc, next) => {
    Restaurante.findById(doc.restauranteId, (err, restaurante) => {
        if (err || !restaurante) {
            return next(new Error('Restaurante não existe'));
        }

        next();
    });
});

// Validação para categoria
ProdutoSchema.post('validate', (doc, next) => {
    Categoria.findById(doc.categoriaId, (err, categoria) => {
        if (doc.categoriaId && (err || !categoria)) {
            return next(new Error('Categoria não existe'));
        }

        next();
    });
});

module.exports = mongoose.model('produto', ProdutoSchema);
