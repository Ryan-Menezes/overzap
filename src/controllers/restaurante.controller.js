const Restaurante = require('../models/restaurante.model');
const passwordHash = require('password-hash');

module.exports = {
    index: async (req, res) => {
        Restaurante.find(
            {},
            (err, doc) => {
                if (err) {
                    return res.status(400).json({
                        error: true,
                        message: err,
                    });
                }

                res.status(200).json({
                    error: false,
                    restaurantes: doc,
                });
            },
        );
    },

    update: async (req, res) => {
        const { senha } = req.body;
        const { id: restauranteId } = req.params;

        if (req.body.senha) {
            const hashePassword = await passwordHash.generate(senha);
            req.body.senha = hashePassword;
        }

        const doc = { ...req.body };

        Restaurante.findOneAndUpdate(
            {
                _id: restauranteId,
            },
            doc,
            {
                new: true,
                runValidators: true,
            },
            (err, doc) => {
                if (err) {
                    return res.status(400).json({
                        error: true,
                        message: err,
                    });
                }

                res.status(200).json({
                    error: false,
                    restaurante: doc,
                });
            },
        );
    },

    delete: async (req, res) => {
        const { id: restauranteId } = req.params;

        Restaurante.findOneAndDelete(
            {
                _id: restauranteId,
            },
            (err, doc) => {
                if (err) {
                    return res.status(400).json({
                        error: true,
                        message: err,
                    });
                }

                res.status(200).json({
                    error: false,
                    message: 'Restaurante deletado com sucesso!',
                });
            },
        );
    },
};
