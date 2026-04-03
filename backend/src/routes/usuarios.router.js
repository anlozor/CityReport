// 1. Express
const express = require('express');

// 2. Router
const router = express.Router();

// 3. Rutas
// GET -> obtener listado de usuarios
router.get('/', (req, res) => {
    return res.send('Listado de usuarios');
});

// GET -> obtener un usuario concreto
router.get('/:id', (req, res) => {
    const id = req.params.id;

    return res.send(`Usuario con id ${id}`);
});

// POST -> añadir un usuario nuevo
router.post('/', (req, res) => {
    const {nombre} = req.body;

    if (!nombre) {
        return res.status(400).send();
    }
    // Se puede hacer una validación para comprobar que el usuario no existe ya en la BD(por ejemplo con el nombre)

    const nuevo_usuario = {nombre};
    return res.status(201).send(nuevo_usuario);
});

// PATCH -> actualizar datos de usuario
//router.patch('/:id', (req, res) => {
//    const {nombre} = req.body;
//    if (!nombre) {
//        return res.status(400).send();
//    }
    // Ahora tendríamos que buscar al usuario en la bd
    // Comprobar que hay usuario y sino mandar un 404
    // Y luego actualizar los campos
    // Y termiar con un res.send();
//});

// 4. Exportar
module.exports = router;