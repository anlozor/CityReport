import { recuperarContraseña } from "../services/loginService";
import { useState } from "react";
import { toast } from "react-toastify";

export default function RecuperarContraseña() {
    const [email, setEmail] = useState("");

    const enviarRecuperacion = async (e) => {
        e.preventDefault();

        try {
            const response = await recuperarContraseña(email);
            toast.success(response.mensaje);

        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f5f5f5"
            }}
        >
            <div
                style={{
                    width: "320px",
                    padding: "20px",
                    background: "white",
                    borderRadius: "10px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                }}
            >
                <h2 style={{marginBottom: "10px"}}> Recuperar contraseña</h2>
                <p>Escribe aquí tu correo:</p>
                <form onSubmit={enviarRecuperacion}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                    }}
                >
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            padding: "10px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            outline: "none",
                            fontSize: "16px"
                        }}
                    />
                    <button type="submit"
                        style={{
                            padding: "10px",
                            borderRadius: "6px",
                            border: "none",
                            background: "orange",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "16px"
                        }}
                    >
                        Enviar recuperación
                    </button>
                </form>
            </div>
        </div>
    );
}