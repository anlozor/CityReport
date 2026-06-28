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

    return data.result || [];
}

export async function getSolicitud(idSolicitud) {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/solicitudes-gestor/${idSolicitud}`, {
        headers: {Authorization: `Bearer ${token}`}
    });

    const data = await response.json();

    return {response, data};
}

export async function aceptarSolicitud(idSolicitud) {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/solicitudes-gestor/${idSolicitud}/aceptar`, {
        method: "PATCH",
        headers: {Authorization: `Bearer ${token}`}
    });

    const data = await response.json();

    return {response, data};
}

export async function rechazarSolicitud(idSolicitud) {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/solicitudes-gestor/${idSolicitud}/rechazar`, {
        method: "PATCH",
        headers: {Authorization: `Bearer ${token}`}
    });

    const data = await response.json();

    return {response, data};
}

export async function crearGestor(formGestor) {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/usuarios/gestores", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`},
        body: JSON.stringify(formGestor)
    });

    const data = await response.json();

    return {response, data};
}