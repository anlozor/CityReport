export async function getImagenes() {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/imagenes`,{
        headers: {Authorization: `Bearer ${token}`}
    });
    const data = await response.json();

    return data.imagenes;
}