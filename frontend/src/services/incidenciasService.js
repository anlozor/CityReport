export async function getIncidencias(filtros = {}) {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();

    if (filtros.votos === "true") {
        params.append("votos", "true");
    }
    if (filtros.historicas === "true") {
        params.append("historicas", "true");
    }
    if (filtros.fecha) {
        params.append("fecha", filtros.fecha);
    }
    if (filtros.propias === "true") {
        params.append("propias", "true");
    }
    if (filtros.estado?.length > 0) {
        filtros.estado.forEach(e => params.append("estado", e));
    }
    if (filtros.proximidadActivada && filtros.proximidad) {
        params.append("proximidad", filtros.proximidad);
        if (filtros.lat && filtros.lon) {
            params.append("lat", filtros.lat);
            params.append("lon", filtros.lon);
        }
    }

    const response = await fetch(`http://localhost:3000/incidencias?${params.toString()}`, {
        headers: {Authorization: `Bearer ${token}`,},
        }
    );

    if (!response.ok) {
        throw new Error("Error al obtener incidencias");
    }

    return await response.json();
    
}

export async function getIncidenciaId(id) {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/incidencias/${id}`, {
        headers: {Authorization: `Bearer ${token}`,},
        }
    );
    
    const data = await response.json();

    return {response, data};
}

export async function postNuevaIncidencia(datos) {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/incidencias", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`},
        body: datos
    });

    const data = await response.json();

    return {response, data};
}