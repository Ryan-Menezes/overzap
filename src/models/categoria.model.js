const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Restaurante = require('./restaurante.model');

const CategoriaSchema = new Schema({
    nome: {
        type: String,
        required: true,
        unique: true,
    },
    descricao: {
        type: String,
    },
    restauranteId: {
        type: mongoose.Types.ObjectId,
        ref: 'restaurante',
        required: true,
    },
});

// Validação para restaurante
CategoriaSchema.post('validate', (doc, next) => {
    Restaurante.findById(doc.restauranteId, (err, restaurante) => {
        if (err || !restaurante) {
            return next(new Error('Restaurante não existe'));
        }

        next();
    });
});

module.exports = mongoose.model('categoria', CategoriaSchema);
