// 1. Express, pool, middleware y controladores
const express = require('express');
const pool = require('../bd/bd');
const auth = require('../middlewares/auth.middleware');
const {usuarioNoBloqueado} = require('../middlewares/usuarios.middleware');
const {autorizarRol} = require('../middlewares/roles.middleware');
const {getIncidencias, getIncidenciasUsuario, getIncidenciaId} = require('../controladores/incidencias.controlador');

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
// PATCH -> editar una incidencia --> Solo gestores
// Si se valida, hay que rellenar los campos correspondientes
// Si se archiva como histórica, se rellenan los campos correspondientes
// PATCH -> cambiar estado de una incidencia --> Solo gestores
// PATCH -> validar una incidencia --> Solo gestores
// DELETE -> eliminar una incidencia --> Solo gestores

// 4. Exportar router
module.exports = router;