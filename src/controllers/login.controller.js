const Restaurante = require('../models/restaurante.model');
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');

module.exports = {
    signup: async (req, res) => {
        const { senha } = req.body;

        const hashePassword = await passwordHash.generate(senha);
        req.body.senha = hashePassword;
        
        Restaurante.create({ ...req.body }, err => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: err,
                });
            }
            
            res.status(200).json({
                error: false,
                message: 'Restaurante cadastrado com sucesso',
            });
        });
    },

    login: async (req, res) => {
        const { email, senha } = req.body;

        Restaurante.findOne({ email }, (err, doc) => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: err,
                });
            }

            if (!passwordHash.verify(senha, doc.senha)) {
                return res.status(400).json({
                    error: true,
                    message: 'Email ou senha inválidos',
                });
            }

            const token = jwt.sign(
                {
                    restauranteId: doc._id,
                }, 
                process.env.SECRET, 
                {
                    expiresIn: '1d',
                },
            );

            return res.status(200).json({
                error: false,
                message: 'Login efetuado com sucesso!',
                token,
            });
        });
    },
};
