// 1. Express, pool y bcrypt
const express = require('express');
const pool = require('../bd/bd');
const bcrypt = require('bcrypt');

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
        console.error('Error al obtener los usuarios:', error);
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
router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id; // Leemos el id
        // Buscamos al usuario en la bd para comprobar que existe
        const existe = await pool.query(`SELECT * FROM usuario WHERE id_usuario = $1`, [id]);
        // Comprobamos que existe el usuario
        if (existe.rows.length === 0) {
            return res.status(404).send('El usuario no existe');
        }

        /*************PATCH FIJO ORIGINAL*************/
        // Leemos los datos del body
        //const {nombre, email, contraseña, rol_id, alias} = req.body;
        // Hasheamos contraseña
        //const contraseñaHashed = await bcrypt.hash(contraseña, 10);
        // Actualizamos los campos
        //const result = await pool.query(`UPDATE usuario SET contraseña = $1, alias = $3 WHERE id_usuario = $2 RETURNING *`,
        //    [contraseñaHashed, id, alias]);
        // Devolvemos estado de HTTP y resultado
        //res.status(200).json(result.rows[0]);

        /*************PATCH DINÁMICO*************/
        // Con esta versión no es necesario mandar todos los campos de usuario, sólo los que queremos actualizar
        // Datos es un objeto para leer los objetos que vengan en el body
        const datos = req.body;
        // Campos es un array donde se va a guardar los campos del body para la query
        const campos = [];
        // Valores es un array donde se va a guardar los valores de los campos para la query
        const valores = [];
        // La idea es construirlo de manera que los campos queden como [nombre = $1, email = $2] 
        // y los valores queden como [Andrea, andrea@ejemplo.com]
        let contador = 1;
        for (let campo in datos) {
            // Comprobamos si el campo que estamos leyendo de datos es contraseña para hashearla
            if (campo === 'contraseña') {
                datos[campo] = await bcrypt.hash(datos[campo], 10);
            }

            campos.push(`${campo} = $${contador}`);
            valores.push(datos[campo]);
            contador++; // Utilizamos el contador para indicar el $1, $2, etc. Ya que cada vuelta del for es un valor de datos, es decir, un campo
            // Además, nos viene bien para dejar el array valores ya colocado en orden
        }
        // Añadimos el id del usuario
        valores.push(id);
        // Montamos la query
        const query = `UPDATE usuario SET ${campos.join(', ')} WHERE id_usuario = $${contador} RETURNING *`;
        // Hacemos la consulta
        const result = await pool.query(query, valores);
        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).send('Error al actualizar usuario');
    }
});

// 4. Exportar
module.exports = router;