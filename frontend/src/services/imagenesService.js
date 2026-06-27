export async function getImagenes() {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/imagenes`,{
        headers: {Authorization: `Bearer ${token}`}
    });
    const data = await response.json();

    return data.imagenes;
}

export async function eliminarImagen(idImagen) {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/imagenes/${idImagen}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "aaplication/json",
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    return {response, data};
}