// Middleware para las funciones auxiliares de mandar correo
const transporter = require('./email.helper');

async function enviarRecuperacion(destinatario, enlace) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: destinatario,
        subject: 'Recuperación de contraseña',
        text: `Pulsa en el siguiente enlace para reestablecer la contraseña: ${enlace}`
    })
}

module.exports = {
    enviarRecuperacion
};