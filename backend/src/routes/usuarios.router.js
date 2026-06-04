// 1. Express, pool, bcrypt y middleware
const express = require('express');
const pool = require('../bd/bd');
const bcrypt = require('bcrypt');
const auth = require('../middlewares/auth.middleware');
const {usuarioNoBloqueado} = require('../middlewares/usuarios.middleware');
const {autorizarRol} = require('../middlewares/roles.middleware');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// 2. Router
const router = express.Router();

// 3. Rutas
// GET -> obtener listado de usuarios
router.get('/', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
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
// Gestores pueden buscar a cualquier usuario, los usuarios normales pueden ver su propio perfil
router.get('/:id', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
    try {
        // Leemos el id y el rol
        const id = req.params.id;
        const rol = req.usuario.rol_id;

        // Hacemos la query
        const result = await pool.query(`SELECT usuario.nombre, usuario.email, usuario.fecha_registro, usuario.alias, 
            usuario.esta_bloqueado, usuario.bloqueado_por, usuario.motivo_bloqueo, usuario.fecha_bloqueo, rol.nombre 
            FROM usuario JOIN rol ON usuario.rol_id = rol.id_rol WHERE usuario.id_usuario = $1`, [id]);
        // Comprobamos que nos ha devuelto algo y sino devolvemos error
        if (result.rows.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Error al buscar usuario:', error);
        res.status(500).send('Error al buscar usuario');
    }

});

// GET -> cada usuario puede ver su propio perfil con sus datos
router.get('/perfil', auth, usuarioNoBloqueado, async (req, res) => {
    try {
        const id = req.usuario.id_usuario;
        const result = await pool.query(`SELECT usuario.nombre, usuario.email, usuario.fecha_registro, usuario.alias, rol.nombre AS rol
            FROM usuario JOIN rol ON usuario.rol_id = rol.id_rol WHERE usuario.id_usuario = $1`, [id]);
        res.status(200).json(result.rows[0]);
        
    } catch (error) {
        console.error('Error al obtener los datos del perfil:', error);
        res.status(500).send('Error al obtener los datos del perfil');
        
    }
});

// POST -> añadir un usuario nuevo
router.post('/registro', async (req, res) => {
    try {
        // Primero obtenemos lo que tiene que llevar el body para crear un nuevo usuario
        const {nombre, email, contraseña, alias} = req.body;
    
        // Comprobación por si algo falta
        if (!nombre || !email || !contraseña) {
            return res.status(400).send('Faltan datos obligatorios');
        }
        // Se puede hacer una validación para comprobar que el usuario no existe ya en la BD(por ejemplo con el nombre)
        const existe = await pool.query(`SELECT nombre, email FROM usuario WHERE nombre = $1 OR email = $2`, [nombre, email]);
        if (existe.rows[0].nombre === nombre) {
            return res.status(409).send('Ya existe un usuario con el mismo nombre');
        } else if (existe.rows[0].email === email) {
            return res.status(409).send('Ya existe un usuario con el mismo email');
        }

        // Hacemos el hash de la contraseña
        const contraseñaHashed = await bcrypt.hash(contraseña, 10);
    
        // Hacemos la inserción del nuevo usuario
        const result = await pool.query(`INSERT INTO usuario (nombre, email, contraseña, rol_id, alias, fecha_registro) 
            VALUES ($1, $2, $3, 3, $4, CURRENT_DATE)
            RETURNING *`, [nombre, email, contraseñaHashed, alias]);
        // Devolvemos el estado HTTP y la información
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).send('Error al crear usuario');
    }
});

// POST -> añadir un gestor o gestor avanzado nuevo --> solo gestores avanzados
router.post('/gestores', auth, usuarioNoBloqueado, autorizarRol(1), async (req, res) => {
    try {
        // Leemos del body los campos necesarios para crear el usuario, incluido el rol (1 o 2)
        const {nombre, email, rol_id} = req.body;
        // Comprobamos que no falta ninguno
        if (!nombre || !email || !rol_id) {
            return res.status(400).send('Faltan campos obligatorios');
        } else if (rol_id !== 1 && rol_id !== 2) {
            return res.status(400).send('El rol debe ser gestor o gestor avanzado');
        }

        // Generamos contraseña aleatoria
        const contraseñaTemporal = crypto.randomBytes(8).toString('base64');
        const contraseñaHashed = await bcrypt.hash(contraseñaTemporal, 10);

        // Generamos un id de gestor del estilo GestorXXXX (que va a ser el alias y siempre va a aparecer en vez del nombre)
        // Una manera fácil es obtener el último id de gestor y sumarle 1
        const gestor = await pool.query(`SELECT identificador_gestor FROM usuario 
            WHERE identificador_gestor IS NOT NULL ORDER BY identificador_gestor DESC LIMIT 1`);
        let idGestor = gestor.rows[0].identificador_gestor.replace('Gestor', ''); // Como simeore van a tener la misma forma, nos quitamos la parte de 'Gestor' y ons quedamos con el número
        idGestor = parseInt(idGestor); // Lo pasamos a número desde string
        idGestor += 1; // Le sumamos 1
        idGestor = String(idGestor).padStart(4, '0'); // Lo volvemos a transformar a string y le añadimos ceros a la izquierda hasta alcanzar una longitud de 4 caracteres
        idGestor = 'Gestor' + idGestor; // Volvemos a añadir 'Gestor' y ya lo tenemos
        const alias = idGestor;

        // Generamos el código de activación
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz'; // Lista de caracteres para generar el código de activación
        let codigo_activacion = '';
        // Como lo queremos de longitud 8, hacemos 8 iteraciones
        for (let i = 0; i < 8; i++) {
            // Generamos un número aleatorio desde 0 hasta la longitud de los caracteres
            const indice = crypto.randomInt(0, caracteres.length);
            // Lo seleccionamos
            codigo_activacion += caracteres[indice];
            
        }

        //fecha_registro = CURRENT_DATE;
        //es_gestor = true;

        // Si el usuario ya existe y se le da de alta como gestor por aprobación de solicitud de gestor,
        // solo hace falta modificar campos, no crear un usuario nuevo
        const existe = await pool.query(`SELECT * FROM usuario WHERE email = $1`, [email]);

        if (existe.rows.length > 0) {
            const resultUsuario = await pool.query(`UPDATE usuario 
                SET es_gestor = true, identificador_gestor = $1, alias = $2, rol_id = $3, codigo_activacion = $4 
                WHERE email = $5`, [idGestor, alias, rol_id, codigo_activacion, email]);

            res.status(200).json({
                "mensaje": "Actualizado perfil a gestor correctamente",
                "identificador_gestor": idGestor,
                "codigo_activacion": codigo_activacion
            });
            
        } else {

            // Insertamos el nuevo usuario
            const result = await pool.query(`INSERT INTO usuario 
                (nombre, email, rol_id, fecha_registro, es_gestor, contraseña, identificador_gestor, alias, codigo_activacion)
                VALUES ($1, $2, $3, CURRENT_DATE, true, $4, $5, $6, $7) RETURNING *`, 
                [nombre, email, rol_id, contraseñaHashed, idGestor, alias, codigo_activacion]);
        
            res.status(201).json({
                "mensaje": "Gestor creado correctamente",
                "identificador_gestor": idGestor,
                "codigo_activacion": codigo_activacion
            });
        }

    } catch (error) {
        console.error('Error al crear gestor:', error);
        res.status(500).send('Error al crear el gestor');
        
    }
});

// PATCH -> verificar activación de cuenta de gestor nueva --> solo gestores
// Para comprobar el Id de gestor y el código de activación
router.patch('/verificar-activacion', usuarioNoBloqueado, async (req, res) => {
    try {
        // Leemos del body el id y el codigo de activación
        // Comprobamos que el id existe
        // Comprobamos que no está usado el código
        // Comprobamos que el código del body corresponde con el que aparece en la solicitud de gestor (donde se le han mostrado las credenciales para la activación de la cuenta)
        // Marcamos el código como usado y lo borramos 
        // Generamos un JWT temporal, por ejemplo de 10 minutos
        
    } catch (error) {
        
    }
});

// PATCH -> activar cuenta de gestor nueva --> solo gestores
// Para establecer la contraseña del nuevo gestor
router.patch('/establecer-contraseña', usuarioNoBloqueado, (req, res) => {
    try {
        // Leemos del token temporal el id_usuario
        // Comprobamos que activacion = true o resetContraseña = true
        // Leemos del body la contraseña de los dos campos
        // Comprobamos que coinciden
        // Hacemos el hash de la contraseña
        // Actualizamos la contraseña
        // Generamos el JWT normal
        
    } catch (error) {
        
    }
});

// PATCH -> contraseña olvidada
// Para enviar un mail al usuario con un link para cambiar la contraseña
router.patch('/contraseña-olvidada', async (req, res) => {
    try {
        // Leemos del body el email
        // Comprobamos que no está vacío
        // Comprobamos que existe en la bd
        // Generamos un JWT temporal, por ejemplo de 15 minutos
        // Enviamos mail con link y generamos mensaje del estilo "si existe una cuenta asociada al correo, se le mandará un enlace"

    } catch (error) {
        
    }
});

// POST -> login de usuario
router.post('/login', async (req, res) => {
    try {
        // Primero necesitamos los datos con los que el usuario hace login
        const {email, contraseña} = req.body;
        // Comprobamos que están todos los datos
        if (!email || !contraseña) {
            return res.status(400).send('Faltan datos para login');
        }

        // Buscamos al usuario en la BD y comprobaos que está en la BD
        const existe = await pool.query(`SELECT * FROM usuario WHERE email = $1`, [email]);
        if (existe.rows.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }
        // Comprobamos que no está bloqueado

        // Comprobamos qu la contraseña introducida coincide con la de la BD
        const usuario = existe.rows[0];
        const contraseñaCoincide = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!contraseñaCoincide) {
            return res.status(400).send('Contraseña incorrecta');
        }

        // Creamos el JWT
        const token = jwt.sign({
            id_usuario: usuario.id_usuario,
            rol_id: usuario.rol_id
        }, process.env.JWT_SECRET, {expiresIn: '30m'});

        // Mandamos la respuesta
        res.json({
            mensaje: 'Login correcto',
            token
        });
    } catch (error) {
        console.error('Error al hacer login:', error);
        res.status(500).send('Error en login');
    }
});

// PATCH -> actualizar datos de usuario
router.patch('/:id', auth, usuarioNoBloqueado, async (req, res) => {
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

// PATCH -> desbloquear un usuario --> solo gestores
router.patch('/:id/desbloquear', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
    try {
        // Primero leemos el id del usuario a desbloquear
        const id = req.params.id;
        // Comprobamos que el usuario existe
        const usuarioExiste = await pool.query(`SELECT * FROM usuario WHERE id_usuario = $1`, [id]);
        if (usuarioExiste.rows.length === 0) {
            return res.status(404).send('El usuario no existe');
        }
        // Comprobamos que no esté ya desbloqueado/sin bloquear
        if (!usuarioExiste.rows[0].esta_bloqueado) {
            return res.status(400).send('El usuario no está bloqueado');
        }
        // Modificamos los campos y lo desbloqueamos
        const result = await pool.query(`UPDATE usuario SET esta_bloqueado = false, bloqueado_por = NULL, motivo_bloqueo = NULL, fecha_bloqueo = NULL WHERE id_usuario = $1`, [id]);
        // Devolvemos HTTP y confirmación
        res.status(200).json({mensaje: 'Usuario desbloqueado'});
        
    } catch (error) {
        console.error('Error al desbloquear el usuario:', error);
        res.status(500).send('Error al desbloquear el usuario');
        
    }
});

// PATCH -> bloquear un usuario --> solo gestores
router.patch('/:id/bloquear', auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
    try {
        // Primero leemos el id del usuario a bloquear y el id del gestor
        const id = req.params.id;
        const idGestor = req.usuario.id_usuario;
        // Obtenemos el motivo del bloqueo y comprobamos que no está vacío y que no se pasa del límite de 250 caracteres
        const {motivo_bloqueo} = req.body;
        if (motivo_bloqueo === undefined || motivo_bloqueo.length > 250) {
            return res.status(400).send('El motivo del bloqueo es obligatorio y no debe superar los 250 caracteres');
        }
        // Comprobamos que el usuario existe
        const usuarioExiste = await pool.query(`SELECT * FROM usuario WHERE id_usuario = $1`, [id]);
        if (usuarioExiste.rows.length === 0) {
            return res.status(404).send('El usuario no existe');
        }
        // Comprobamos que no esté ya bloqueado
        if (usuarioExiste.rows[0].esta_bloqueado === true) {
            return res.status(400).send('El usuario ya está bloqueado');
        }
        // Marcamos el usuario como bloqueado rellenando esta_bloqueado, bloqueado_por, motivo_bloqueo y fecha_bloqueo
        const result = await pool.query('UPDATE usuario SET esta_bloqueado = true, bloqueado_por = $1, motivo_bloqueo = $2, fecha_bloqueo = CURRENT_DATE WHERE id_usuario = $3 RETURNING *', [idGestor, motivo_bloqueo, id]);
        // Devolvemos HTTP y confirmación
        res.status(200).json({mensaje: 'Usuario bloqueado'});
        
    } catch (error) {
        console.error('Error al bloquear el usuario:', error);
        res.status(500).send('Error al bloquear el usuario');
        
    }
});

// 4. Exportar
module.exports = router;