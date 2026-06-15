export async function getIncidencias() {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/incidencias", {
        headers: {Authorization: `Bearer ${token}`,},
        }
    );

    const data = await response.json();

    return {response, data};
    
}