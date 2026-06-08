// 1. Express, pool, middleware y controladores
const express = require('express');
const pool = require('../bd/bd');
const auth = require('../middlewares/auth.middleware');
const {usuarioNoBloqueado} = require('../middlewares/usuarios.middleware');
const {autorizarRol} = require('../middlewares/roles.middleware');
const {getIncidencias, getIncidenciasUsuario, getIncidenciaId, 
    postNuevaIncidencia, patchEditarIncidencia, patchValidarIncidencia} = require('../controladores/incidencias.controlador');
const upload = require('../middlewares/uploads.middleware');

// 2. Router
const router = express.Router();

// 3. Rutas
// GET -> obtener listado de incidencias --> Todos los usuarios pueden ver todas las incidencias
// where esta_eliminada = false and (fecha_resolucion is null or fecha_resolucion > current_date - interval '30 days') --> para obtener las que no estén archivadas
// Podemos ejecutar antes del select, por ejemplo, un update para marcar históricas las que tengan fecha_resolucion con más de 30 días hasta el día actual
// where esta_eliminada = false and fecha_archivado is null and fecha_resolucion is not null and fecha_resolucion <= current_date - interval '30 days'
// GET -> obtener una incidencia concreta --> Todos los usuarios pueden ver cualquier incidencia
// GET -> obtener listado de incidencias de un usuario concreto --> Solo gestores y el propio usuario

router.get('/', auth, usuarioNoBloqueado, getIncidencias);
router.get('/usuario/:id', auth, usuarioNoBloqueado, autorizarRol(1, 2), getIncidenciasUsuario);
router.get('/:id', auth, usuarioNoBloqueado, getIncidenciaId);

// POST -> añadir una incidencia nueva --> Todos los usuarios pueden crear una incidencia
router.post('/', auth, usuarioNoBloqueado, upload.array('imagenes', 2), postNuevaIncidencia);

// PATCH -> editar una incidencia --> Solo gestores
// Si se archiva como histórica, se rellenan los campos correspondientes
// Si se resuelve, se rellenan los campos correspondientes
// Si se cambia el estado, se rellenan los campos correspondientes y se tendría que hacer el post de cambio de estado
router.patch('/:id', auth, usuarioNoBloqueado, autorizarRol(1, 2), patchEditarIncidencia); // Solo para campos editables como título, categoría, estado, etc.

// PATCH -> recuperar una incidencia eliminada --> Solo gestores
// Habría que modificar los campos correspondientes y marcarla como no eliminada para que vuelva a aparecer

// DELETE -> eliminar una incidencia --> Solo gestores

// 4. Exportar router
module.exports = router;