const jwt = require('jsonwebtoken'); // Cargamos la librería para los JWT
const auth = (req, res, next) => { // Aquí va la función
    // 1. Leemos el header
    const authHeader = req.headers.authorization;
    // Comprobamos que no está vacío
    if (!authHeader) {
        return res.status(401).send('Token requerido');
    }
    // 2. Sacamos el token
    const token = authHeader.split(' ')[1]; // con split separamos el string por espacios, un ejemplo de token descifrado es "Bearer abc123"
    // como solo queremos lo que hay después del bearer, nos quedamos con lo que esté en posición 1, que es el token
    
    try {
        // 3. Lo verificamos con JWT
        // Las partes de un JWT son 3: header, payload y signature. El payload es la parte útil con toda la información del token
        const payload = jwt.verify(token,process.env.JWT_SECRET);
        // 4. Guardamos los datos en req.usuario (id, si está bloqueado, etc.)
        req.usuario = payload;
        next();
    } catch (error) {
        // 5. Si algo falla, paramos y res.status()
        res.status(401).json('Error de token');
    }


};

// Exportamos la función
module.exports = auth;