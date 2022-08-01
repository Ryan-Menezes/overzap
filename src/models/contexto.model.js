const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContextoSchema = new Schema({
    tipo: {
        type: String,
        required: true,
        enum: ['welcome', 'initial', 'finish', 'address', 'cancel'],
    },
    clienteId: {
        type: mongoose.Types.ObjectId,
        ref: 'cliente',
        required: true,
    },
});

module.exports = mongoose.model('contexto', ContextoSchema);
