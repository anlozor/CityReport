export async function buscarGestores(identificador, signal) {
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:3000/usuarios/gestores?identificador=${encodeURIComponent(identificador)}`, {
        method: "GET",
        headers: {Authorization: `Bearer ${token}`},
        signal
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.mensaje);
    }

    return Array.isArray(data) ? data : [];
}