// Función para comprobar rol de usuario
const autorizarRol = (...rolesPermitidos) => {
    return (req, res, next) => {
        const rolUsuario = req.usuario.rol_id;
        if (!rolesPermitidos.includes(rolUsuario)) {
            return res.status(403).send('El usuario no está autorizado');
        }
        next();
    };
};

module.exports = {comprobarRol};