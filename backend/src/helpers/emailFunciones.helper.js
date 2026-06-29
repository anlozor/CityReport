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
                <p style={{fontSize: "13px"}}>Tu cuenta de gestor ha sido creada correctamente.</p>
                <p style={{fontSize: "13px"}}>A continuación tienes tu identificador de gestor, que se te ha asignado automáticamente, y el código de activación:</p>
                <p style={{fontSize: "13px"}}><strong>Identificador de gestor:</strong> ${idGestor}</p>
                <p style={{fontSize: "13px"}}><strong>Código de activación:</strong> ${codigo_activacion}</p>
                <p style={{fontSize: "13px"}}>Para activar tu cuenta accede al siguiente enlace e introduce tu identificador de gestor y el código de activación:</p>
                <a href="${enlace}" style={{fontSize: "13px"}}>Activar cuenta</a>
                <p style={{fontSize: "13px"}}>Para iniciar sesión las siguientes veces, continúa haciéndolo con tu correo y la contraseña nueva que establezcas.</p>`
    });
}

module.exports = {
    enviarRecuperacion,
    enviarCredencialesGestor
};