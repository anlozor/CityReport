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