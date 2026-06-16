export async function getIncidencias() {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/incidencias", {
        headers: {Authorization: `Bearer ${token}`,},
        }
    );

    const data = await response.json();

    return {response, data};
    
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