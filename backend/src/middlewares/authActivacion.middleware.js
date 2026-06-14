// Parecido a auth.middleware
// Middleware para la activación de la cuenta
// Comprobamos que payload.activacion === true o resetContraseña === true

const jwt = require('jsonwebtoken');

const authActivacion = (req, res, next) => {
    // 1. Leemos el header
    const authHeader = req.headers.authorization;
    // Comprobamos que no está vacío
    if (!authHeader) {
        return res.status(401).json({
            mensaje: 'Token requerido'});
    }
    // 2. Sacamos el token
    const token = authHeader.split(' ')[1];
    try {
        // 3. Verificamos con JWT
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // 4. Comprobamos activacion y resetContraseña
        if (!payload.activacion && !payload.resetContraseña) {
            return res.status(401).json({
                mensaje: 'Token inválido'});
        }
        // 5. Guardamos los datos en req,usuario
        req.usuario = payload;
        next();
    } catch (error) {
        console.error('Error de token temporal:', error);
        res.status(401).json({
            mensaje: 'Error de token temporal'});
    }
};

module.exports = authActivacion;