const jwt = require('jsonwebtoken');

module.exports = {
    authentication: (req, res, next) => {
        try {
            const [, token] = req.headers.authorization.split(' ');
        
            const { restauranteId } = jwt.verify(token, process.env.SECRET);
            req.headers.id = restauranteId;
            next();
        } catch (err){
            res.status(401).json({
                error: true,
                message: "Token inválido",
            });
        }
    },
};
