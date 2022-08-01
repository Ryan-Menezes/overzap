const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClienteSchema = new Schema({
    nome: {
        type: String,
        required: true,
    },
    telefone: {
        type: String,
        required: true,
        validate: [/^[0-9]{10,11}$/, 'Formato inválido! Formato: 9999999999 ou 99999999999'],
    },
    endereco: {
        coordinates: [],
        numero: String,
        observacao: String,
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    },
    restauranteId: {
        type: mongoose.Types.ObjectId,
        ref: 'restaurante',
        required: true,
    },
});

module.exports = mongoose.model('cliente', ClienteSchema);
