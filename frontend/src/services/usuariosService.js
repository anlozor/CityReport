export async function buscarGestores(identificador, signal) {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/usuarios/gestores?identificador=${encodeURIComponent(identificador)}`, {
        method: "GET",
        headers: {Authorization: `Bearer ${token}`},
        signal
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.mensaje);
    }

    return Array.isArray(data) ? data : [];
}

export async function buscarUsuarios(texto, signal) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `http://localhost:3000/usuarios?buscar=${encodeURIComponent(texto)}`,
        {
            method: "GET",
            headers: {Authorization: `Bearer ${token}`},
            signal
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.mensaje);
    }

    return Array.isArray(data) ? data : [];
}

export async function bloquearUsuario(idUsuario, motivo) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `http://localhost:3000/usuarios/${idUsuario}/bloquear`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                motivo_bloqueo: motivo
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.mensaje);
    }

    return data;
}

export async function desbloquearUsuario(idUsuario) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `http://localhost:3000/usuarios/${idUsuario}/desbloquear`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.mensaje);
    }

    return data;
}