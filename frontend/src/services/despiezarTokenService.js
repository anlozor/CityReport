export function sacarUsuariodelToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        return null;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log(payload);
        return payload.id_usuario;
    } catch (error) {
        return null;
    }
}

export function sacarRoldelToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        return null;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.rol_id;
    } catch (error) {
        return null;
    }
}