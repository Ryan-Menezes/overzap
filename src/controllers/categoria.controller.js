const Categoria = require('../models/categoria.model');

module.exports = {
    index: async (req, res) => {
        const { id: restauranteId } = req.headers;

        Categoria.find(
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
                    categorias: doc,
                });
            },
        );
    },

    store: async (req, res) => {
        const { id: restauranteId } = req.headers;
        const doc = { ...req.body, restauranteId };

        Categoria.create(doc, err => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: err,
                });
            }

            res.status(200).json({
                error: false,
                message: 'Categoria cadastrada com sucesso!',
            });
        });
    },

    update: async (req, res) => {
        const { id: restauranteId } = req.headers;
        const { id: categoriaId } = req.params;
        const doc = { ...req.body };

        Categoria.findOneAndUpdate(
            {
                _id: categoriaId,
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
                    categoria: doc,
                });
            },
        );
    },

    delete: async (req, res) => {
        const { id: restauranteId } = req.headers;
        const { id: categoriaId } = req.params;

        Categoria.findOneAndDelete(
            {
                _id: categoriaId,
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
                    categoria: 'Categoria deletada com sucesso!',
                });
            },
        );
    },
};
