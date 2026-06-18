export const crearComentario = async (texto, incidencia_id, es_anonimo, imagen) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("texto", texto);
    formData.append("incidencia_id", incidencia_id);
    formData.append("es_anonimo", es_anonimo);

    if (imagen) {
        formData.append("imagen", imagen);
    }

    const response = await fetch("http://localhost:3000/comentarios", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`},
        body: formData
    });

    const data = await response.json();

    return {response, data};
};

export const obtenerComentariosIncidencia = async (id_incidencia) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/comentarios/incidencia/${id_incidencia}`,{
        headers: {Authorization: `Bearer ${token}`}
    });
    const data = await response.json();

    return {response, data};
};