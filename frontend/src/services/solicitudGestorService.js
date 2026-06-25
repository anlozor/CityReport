export async function crearSolicitudGestor(formData) {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/solicitudes-gestor", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`},
        body: formData
    });

    const data = await response.json();

    return {response, data};
}

export async function obtenerMiSolicitud(params) {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/solicitudes-gestor/mi-solicitud", {
        method: "GET",
        headers: {Authorization: `Bearer ${token}`}
    });

    const data = await response.json();

    return {response, data};
}

export async function reenviarCorreoSolicitud(id) {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/solicitudes-gestor/${id}/reenviar-correo`, {
        method: "POST",
        headers: {Authorization: `Bearer ${token}`}
    });

    const data = await response.json();

    return {response, data};
}

export async function getSolicitudes(params) {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/solicitudes-gestor", {
        headers: {Authorization: `Bearer ${token}`}
    });

    const data = await response.json();

    return data.result;
}