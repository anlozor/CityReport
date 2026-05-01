// Función para no permitir que usuarios bloqueados puedan realizar acciones
const usuarioBloqueado = (req, res, next) => {
    // 1. Comprobación
    
    // 2. Si no se cumple, res.status y se devuelve
    // 3. Si se cumple hacemos next() para que pase a la ejecución del siguiente middleware o controlador o ruta
};

module.exports = {usuarioBloqueado};