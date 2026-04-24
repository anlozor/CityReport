// 1. Express y pool
const express = require('express');
const pool = require('../bd/bd');

// 2. Router
const router = express.Router();

// 3. Rutas
// GET -> Listado de roles
// POST -> Crear rol

// 4. Exportar
module.exports = router;