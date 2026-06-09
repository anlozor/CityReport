// 1. Express, pool y middlewares
const express = require('express');
const pool = require('../bd/bd');
const auth = require('../middlewares/auth.middleware');
const {autorizarRol} = require('../middlewares/roles.middleware');
const {usuarioNoBloqueado} = require('../middlewares/usuarios.middleware');

// 2. Router
const router = express.Router();

// 3. Rutas
// GET -> obtener listado de solicitudes --> solo gestores
router.get('/', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (res, req) => {
    try {
        
    } catch (error) {
        
    }
});

// GET -> obtener datos de una solicitud específica --> solo gestores o propio usuario
router.get('/:id', auth, usuarioNoBloqueado, autorizarRol (1, 2), async (res, req) => {
    try {
        
    } catch (error) {
        
    }
});

// POST -> crear una nueva solicitud de gestor --> solo usuarios
// El estado se pone automáticamente en Enviada
router.post('/', auth, usuarioNoBloqueado, autorizarRol(3), async (res, req) => {
    try {
        
    } catch (error) {
        
    }
});

// PATCH -> rechazar una solicitud --> solo gestores
// El estado pasa a rechazada, y se rellena el id del gestor y la fecha de la resolución
router.patch('/:id/rechazar', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (res, req) => {
    try {
        
    } catch (error) {
        
    }
});

// PATCH -> acepta una solicitud --> solo gestores
// El estado pasa a aceptada y se rellenen el id del gestor y al fecha de la resolución
// Esto conecta con el post /usuarios/gestores
router.patch('/:id/aceptar', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (res, req) => {
   try {
    
   } catch (error) {
    
   } 
});

// 4. Exportar router
module.exports = router;