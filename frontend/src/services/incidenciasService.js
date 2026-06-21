export async function getIncidencias() {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/incidencias", {
        headers: {Authorization: `Bearer ${token}`,},
        }
    );

    if (!response.ok) {
        throw new Error("Error al obtener incidencias");
    }

    //const data = await response.json();

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