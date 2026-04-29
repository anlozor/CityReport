// 1. Express, pool y bcrypt
const express = require('express');
const pool = require('../bd/bd');
const bcrypt = require('bcryptjs');

// 2. Router
const router = express.Router();

// 3. Rutas
// GET -> obtener listado de usuarios
router.get('/', async (req, res) => {
    try {
        // Primero la query
        const result = await pool.query(`SELECT * FROM usuario`);
        // Estado de petición HTTP y resultado
        res.status(200).json(result.rows);
    } catch (error) {
        // Emitimos error
        console.error('Error al obtener los usuarios');
        // Estado error petición HTTP junto a mensaje
        res.status(500).send('Error al obtener el listado de usuarios');
    }
});

// GET -> obtener un usuario concreto
router.get('/:id', async (req, res) => {
    try {
        // Leemos el id
        const id = req.params.id;
        // Hacemos la query
        const result = await pool.query(`SELECT * FROM usuario WHERE id_usuario = $1`, [id]);
        // Comprobamos que nos ha devuelto algo y sino devolvemos error
        if (result.rows.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }
        // En caso contrario devolvemos la información encontrada
        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Error al buscar usuario:', error);
        res.status(500).send('Error al buscar usuario');
    }

});

// POST -> añadir un usuario nuevo
router.post('/', async (req, res) => {
    try {
        // Primero obtenemos lo que tiene que llevar el body para crear un nuevo usuario
        const {nombre, email, contraseña, rol_id, alias} = req.body;
    
        // Comprobación por si algo falta
        if (!nombre || !email || !contraseña || !rol_id || !alias) {
            return res.status(400).send('Faltan datos obligatorios');
        }
        // Se puede hacer una validación para comprobar que el usuario no existe ya en la BD(por ejemplo con el nombre)
        const existeNombre = await pool.query(`SELECT 1 FROM usuario WHERE nombre = $1`, [nombre]);
        if (existeNombre.rows.length > 0) {
            return res.status(409).send('Ya existe un usuario con el mismo nombre');
        }

        // Hacemos el hash de la contraseña
        const contraseñaHashed = await bcrypt.hash(contraseña, 10);
    
        // Hacemos la inserción del nuevo usuario
        const result = await pool.query(`INSERT INTO usuario (nombre, email, contraseña, rol_id, alias, fecha_registro) 
            VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
            RETURNING *`, [nombre, email, contraseñaHashed, rol_id, alias]);
        // Devolvemos el estado HTTP y la información
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).send('Error al crear usuario');
    }
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