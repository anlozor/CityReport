// Middleware para las funciones auxiliares de mandar correo
const transporter = require('./email.helper');

// Para enviar la recuperación de contraseña y cambiarla
async function enviarRecuperacion(destinatario, enlace) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: destinatario,
        subject: 'Recuperación de contraseña',
        html: `<h1>Contraseña olvidada</h1>
                <p>Para cambiar tu contraseña accede al siguiente enlace:</p>
                <a href=${enlace}>Cambiar contraseña</a>`
    });
}

async function enviarCredencialesGestor(destinatario, enlace, idGestor, codigo_activacion) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: destinatario,
        subject:'Activación de cuenta de gestor',
        html: `<h2>Cuenta de gestor creada</h2>
                <p>Tu cuenta de gestor ha sido creada correctamente.</p>
                <p>A continuación tienes tus credenciales. A partir de ahora para iniciar sesión deberás hacerlo con el identificador de gestor:</p>
                <p><strong>Identificador de gestor:</strong>${idGestor}</p>
                <p><strong>Código de activación:</strong>${codigo_activacion}</p>
                <p>Para activar tu cuenta accede al siguiente enlace:</p>
                <a href="${enlace}">Activar cuenta</a>`
    });
}

module.exports = {
    enviarRecuperacion,
    enviarCredencialesGestor
};