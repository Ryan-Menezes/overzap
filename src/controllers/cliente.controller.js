const Cliente = require('../models/cliente.model');

module.exports = {
    index: async (req, res) => {
        const { id: restauranteId } = req.headers;

        Cliente.find(
            {
                restauranteId,
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
                    clientes: doc,
                });
            },
        );
    },

    store: async (req, res) => {
        const { id: restauranteId } = req.headers;
        const doc = { ...req.body, restauranteId };

        Cliente.create(doc, err => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: err,
                });
            }

            res.status(200).json({
                error: false,
                message: 'Cliente cadastrado com sucesso!',
            });
        });
    },

    update: async (req, res) => {
        const { id: restauranteId } = req.headers;
        const { id: clienteId } = req.params;
        const doc = { ...req.body };

        Cliente.findOneAndUpdate(
            {
                _id: clienteId,
                restauranteId,
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
                    cliente: doc,
                });
            },
        );
    },

    delete: async (req, res) => {
        const { id: restauranteId } = req.headers;
        const { id: clienteId } = req.params;

        Cliente.findOneAndDelete(
            {
                _id: clienteId,
                restauranteId,
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
                    message: 'Cliente deletado com sucesso!',
                });
            },
        );
    },
};
