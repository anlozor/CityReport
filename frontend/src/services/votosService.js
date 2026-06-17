export async function votarIncidencia(usuario_id, incidencia_id) {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3000/votos", {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({usuario_id, incidencia_id})
    });

    const data = await response.json();

    return {response, data};
}