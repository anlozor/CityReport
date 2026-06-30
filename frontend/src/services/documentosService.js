export async function generarDocumento(ids) {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/documentos/incidencias", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({incidencias: ids})
        
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.mensaje);
    }

    return response.blob();
}