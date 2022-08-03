const Produto = require('../models/produto.model');

module.exports = {
    index: async (req, res) => {
        const { id: restauranteId } = req.headers;

        Produto.find({
            restauranteId,
        })
        .populate('categoriaId', '_id nome')
        .exec(
            (err, doc) => {
                if (err) {
                    return res.status(400).json({
                        error: true,
                        message: err,
                    });
                }

                res.status(200).json({
                    error: false,
                    produtos: doc,
                });
            },
        );
    },

    store: async (req, res) => {
        const { id: restauranteId } = req.headers;
        const doc = { ...req.body, restauranteId };

        Produto.create(doc, err => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: err,
                });
            }

            res.status(200).json({
                error: false,
                message: 'Produto cadastrado com sucesso!',
            });
        });
    },

    update: async (req, res) => {
        const { id: restauranteId } = req.headers;
        const { id: produtoId } = req.params;
        const doc = { ...req.body };

        Produto.findOneAndUpdate(
            {
                _id: produtoId,
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
                    produto: doc,
                });
            },
        );
    },

    delete: async (req, res) => {
        const { id: restauranteId } = req.headers;
        const { id: produtoId } = req.params;

        Produto.findOneAndDelete(
            {
                _id: produtoId,
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
                    message: 'Produto deletado com sucesso!',
                });
            },
        );
    },
};
