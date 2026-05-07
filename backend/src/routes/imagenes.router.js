// 1. Express, pool
const express = require('express');
const pool = require('../bd/bd');

// 2. Router
const router = express.Router();

// 3. Rutas
// POST -> subir imágenes de una incidencia --> cualquier usuario
router.post('/', async (req, res) => {

});
// DELETE -> eliminar imágenes de una incidencia --> solo gestores
router.delete('/:id', async (req, res) => {
    
});

// 4. Exportar
module.exports = router;