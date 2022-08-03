const Pedido = require('../models/pedido.model');
const Produto = require('../models/produto.model');
const PedidoProduto = require('../models/pedidoProduto.model');

module.exports = {
    index: async (req, res) => {
        const { id: restauranteId } = req.headers;

        Pedido.find(
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
                    pedidos: doc,
                });
            },
        );
    },

    store: async (req, res) => {
        const { id: restauranteId } = req.headers;
        const doc = { ...req.body, restauranteId };

        Pedido.create(doc, err => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: err,
                });
            }

            res.status(200).json({
                error: false,
                message: 'Pedido cadastrado com sucesso!',
            });
        });
    },

    update: async (req, res) => {
        const { id: restauranteId } = req.headers;
        const { id: pedidoId } = req.params;
        const doc = { ...req.body };

        Pedido.findOneAndUpdate(
            {
                _id: pedidoId,
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
                    pedido: doc,
                });
            },
        );
    },

    delete: async (req, res) => {
        const { id: restauranteId } = req.headers;
        const { id: pedidoId } = req.params;

        Pedido.findOneAndDelete(
            {
                _id: pedidoId,
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
                    message: 'Pedido deletado com sucesso!',
                });
            },
        );
    },

    addItem: async (req, res) => {
        const { id: restauranteId } = req.headers;
        const { id: pedidoId } = req.params;
        const { produtoId, quantidade = 1, observacao = null } = req.body;

        const produto = await Produto.findById(produtoId);

        if (!produto) {
            return res.status(400).json({
                error: true,
                message: 'Este produto não existe!',
            });
        }

        PedidoProduto.create(
            {
                pedidoId,
                produtoId,
                valorUnitario: produto.valor,
                quantidade,
                observacao,
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
                    message: 'Produto adicionado ao pedido com sucesso!',
                });
            },
        );
    },
};
