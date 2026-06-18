export async function getMiPerfil() {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/usuarios/perfil", {
        headers: {Authorization: `Bearer ${token}`}
    });

    const data = await response.json();

    return {response, data};
}

export async function actualizarMiPerfil(datos) {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/usuarios/perfil", {
        method: "PATCH",
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${token}`},
        body: JSON.stringify(datos)
    });

    const data = await response.json();

    return {response, data};
}