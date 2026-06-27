// Archivo para hacer funciones auxiliares de comprobado de estados

// esCambioEstadoValido: función para comprobar si se puede pasar de un estado a otro
// Por ejemplo: No se puede pasar de Nueva a En proceso ni al revés. Pero sí se puede de Nueva a Validada, o de Validada a En proceso
// Vamos a tener en cuenta dos posibles casos en los que se pueda dar marcha atrás: de Resuelta a En proceso, y de En proceso a Validada
const esCambioEstadoValido = (estadoActual, estadoNuevo) => {
    // Vamos a permitir que estadoActual === estadoNuevo
    if (estadoActual === estadoNuevo) {
        return true;
    }
    // Vamos a crear un objeto donde guardar los estados con sus cambios permitidos como colección de pares clave: valor
    const cambiosEstados = {
        Nueva: ['Validada'],
        Validada: ['En proceso'],
        'En proceso': ['Validada', 'Resuelta'],
        Resuelta: ['En proceso']
    };
    // Comprobamos que en cambiosEstados se permite el cambio de estadoActual a EstadoNuevo
    if (cambiosEstados[estadoActual].includes(estadoNuevo)) {
        return true;
    } else {
        return false;
    }
    
};

// obtenerCamposCambioEstado: función para obtener los campos que se deben actualizar con el cambio de estado
const obtenerCamposCambioEstado = (estadoNuevo, idUsuarioGestor, body = {}) => {
    // Aquí vamso a añadir los campos que correspondan según el estado
    const campos = {};

    switch (estadoNuevo) {
        case 'Validada':
            campos.fecha_validacion = 'CURRENT_DATE';
            campos.fecha_actualizacion = 'CURRENT_DATE';
            campos.validada_por = idUsuarioGestor;
            break;
    
        case 'En proceso':
            campos.fecha_actualizacion = 'CURRENT_DATE';
            break;
        
        case 'Resuelta':
            campos.fecha_actualizacion = 'CURRENT_DATE';
            campos.fecha_resolucion = 'CURRENT_DATE';
            if (body.descripcion_resolucion) {
                campos.descripcion_resolucion = body.descripcion_resolucion;
            }
            break;
    }
    return campos;
};

module.exports = {
    esCambioEstadoValido,
    obtenerCamposCambioEstado
};