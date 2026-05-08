const pool = require("../bd/bd");

// Función para no permitir que usuarios bloqueados puedan realizar acciones
const usuarioNoBloqueado = async (req, res, next) => {
    // 1. Comprobación
    // Primero cogemos el usuario y luego comprobamos si existe y si está bloqueado
    const usuario = req.usuario;
    //console.log('req.usuario:', req.usuario);
    if (!usuario) {
        return res.status(401).send('El usuario no se ha autenticado');
    }

    const estaBloqueado = await pool.query(`SELECT esta_bloqueado FROM usuario WHERE id_usuario = $1`, [usuario.id_usuario]);
    if (estaBloqueado.rows.length === 0) {
        return res.status(404).send('Usuario no encontrado');
    }
    //console.log('estaBloqueado:', estaBloqueado);
    const result = estaBloqueado.rows[0].esta_bloqueado;
    if (result === true) {
        return res.status(403).send('El usuario está bloqueado');
    }
    // 3. Si se cumple hacemos next() para que pase a la ejecución del siguiente middleware o controlador o ruta
    next();
};

module.exports = {usuarioNoBloqueado};