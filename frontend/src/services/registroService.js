export async function registro(nombre, email, contraseña, alias) {
    const response = await fetch("http://localhost:3000/usuarios/registro", {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({
            nombre, email, contraseña, alias
        }),
    });

    const data = await response.json();

    return {response, data};
}