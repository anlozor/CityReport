// Función para comprobar rol de usuario
const autorizarRol = (...rolesPermitidos) => { // Con los ... agrupamos los argumentos en un array, de manera que podemos llamar a la función con la cantidad de valores que queramos
    return (req, res, next) => {
        const rolUsuario = Number(req.usuario.rol_id); // Tenemos que convertirlo a número ya que no es lo mismo "1" (lo que obtenemso de usuario) que 1 en número
        if (!rolesPermitidos.includes(rolUsuario)) {
            return res.status(403).json({
                mensaje: 'El usuario no está autorizado'});
        }
        next();
    };
};

module.exports = {autorizarRol};