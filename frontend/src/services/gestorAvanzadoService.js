export async function getIncidenciasCreadas(periodo) {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/estadisticas/incidencias-creadas?periodo=${periodo}`, {
        headers: {Authorization: `Bearer ${token}`}
    });

    const data = await response.json();

    console.log("INCIDENCIAS CREADAS:", data);

    return data;
}

export async function getIncidenciasPorCategoria(periodo) {
    const token = localStorage.getItem("token");
    
    const response = await fetch(`http://localhost:3000/estadisticas/incidencias-categoria?periodo=${periodo}`, {
        headers: {Authorization: `Bearer ${token}`}
    });

    const data = await response.json();

    console.log("INCIDENCIAS POR CATEGORIA:", data);

    return data;
}

export async function getUsuariosBloqueados() {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/estadisticas/usuarios-bloqueados`, {
        headers: {Authorization: `Bearer ${token}`}
    });

    const data = await response.json();

    return data;
}

export async function getComentariosEliminados() {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/estadisticas/comentarios-eliminados`, {
        headers: {Authorization: `Bearer ${token}`}
    });

    const data = await response.json();

    return data;
}

export async function getImagenesEliminadas() {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/estadisticas/imagenes-eliminadas`, {
        headers: {Authorization: `Bearer ${token}`}
    });

    const data = await response.json();

    return data;
}

export async function getIncidenciasEliminadas() {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/incidencias/eliminadas`, {
        headers: {Authorization: `Bearer ${token}`}
    });

    const data = await response.json();

    return data;
}

export async function getCambiosEstado() {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/cambiosestados", {
        headers: {Authorization: `Bearer ${token}`}
    });

    const data = await response.json();

    return data;
}