export async function getCategorias() {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/categorias", {
        headers: {Authorization: `Bearer ${token}`}
    });

    if (!response.ok) {
        throw new Error("Error al obtener categorías");
    }

    const data = await response.json();

    return data;
}

export async function crearCategoria(nombre) {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/categorias", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`},
        body: JSON.stringify({nombre})
    });

    if (!response.ok) {
        throw new Error("Error al crear categoría");
    }

    const data = await response.json();

    return data;
}