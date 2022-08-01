const Restaurante = require('../models/restaurante.model');
const passwordHash = require('password-hash');3

module.exports = {
    signup: async (req, res) => {
        const { senha } = req.body;

        const hashePassword = await passwordHash.generate(senha);
        req.body.senha = hashePassword;
        
        Restaurante.create({ ...req.body }, err => {
            if (err) {
                return res.status(400).json({
                    error: true,
                    message: 'Erro ao cadastrar o restaurante',
                });
            }
            
            res.status(200).json({
                error: false,
                message: 'Restaurante cadastrado com sucesso',
            });
        });
    }
};
