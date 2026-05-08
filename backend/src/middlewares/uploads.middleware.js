// Middleware para configuración de multer para guardar imagenes de una incidencia
const multer = require('multer');
const path = require('path');

const tipoImagenPermitido = ['image/jpeg', 'image/png'];

const multerUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null,path.join(__dirname, '../../uploads/')); // Guardamos las imágenes en la carpeta uploads dentro de backend
        },
        filename: (req, file, cb) => {
            const extension = path.extname(file.originalname); // Obtenemos la extensión del archivo
            const nombre = file.originalname.split(extension)[0].replace(/\s+/g, '_'); // Reemplazamos espacios por _
            cb(null, `${nombre}-${Date.now()}${extension}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        // Comprobamos que el tipo de imagen está en los tipos permitidos
        if (tipoImagenPermitido.includes(file.mimetype)) {
            cb(null,true);
        } else {
            cb(new Error(`Tipo de imagen no permitido: ${tipoImagenPermitido.join(', ')}`), false);
        }
    },
    limits:{
        // Limitamos el tamaño de la imagen a 10MB
        fileSize: 10 * 1024 * 1024
    }
});

module.exports = multerUpload;