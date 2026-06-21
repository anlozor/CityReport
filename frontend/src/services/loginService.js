export async function login(email, contraseña) {
    const response = await fetch("http://localhost:3000/usuarios/login", {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({
            email, contraseña,
        }),
    });

    const data = await response.json(); // Nos devuelve mensaje y token

    return {response, data};
    
}

export async function recuperarContraseña(email) {
    const response = await fetch("http://localhost:3000/usuarios/contrasena-olvidada", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email})
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.mensaje);
    }

    return data;
}