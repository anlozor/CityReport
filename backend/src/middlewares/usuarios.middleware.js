// Función para no permitir que usuarios bloqueados puedan realizar acciones
const usuarioNoBloqueado = (req, res, next) => {
    // 1. Comprobación
    // Primero cogemos el usuario y luego comprobamos si existe y si está bloqueado
    const usuario = req.usuario;
    if (!usuario) {
        return res.status(401).send('El usuario no se ha autenticado');
    }
    if (usuario.esta_bloqueado) { // 2. Si no se cumple, res.status y se devuelve
        return res.status(403).send('El usuario está bloqueado');
    }
    // 3. Si se cumple hacemos next() para que pase a la ejecución del siguiente middleware o controlador o ruta
    next();
};

module.exports = {usuarioNoBloqueado};