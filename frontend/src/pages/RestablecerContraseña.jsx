import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { restablecerContraseña } from "../services/loginService";

export default function RestableerContraseña() {
    const [contraseña1, setContraseña1] = useState("");
    const [contraseña2, setContraseña2] = useState("");

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = await restablecerContraseña(token, contraseña1, contraseña2);
            toast.success(data.mensaje);
            localStorage.setItem("token", data.token);
            setTimeout(() => {
                navigate("/mapa");
            }, 1000);
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
                    textAlign: "center"
                }}
            >
                <h2>Restablecer contraseña</h2>
                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                    }}
                >
                    <input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={contraseña1}
                        onChange={(e) => setContraseña1(e.target.value)}
                        required
                        style={{
                            fontSize: "16px"
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Repite la contraseña"
                        value={contraseña2}
                        onChange={(e) => setContraseña2(e.target.value)}
                        required
                        style={{
                            fontSize: "16px"
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            padding: "10px",
                            border: "none",
                            borderRadius: "6px",
                            background: "orange",
                            fontWeight: "bold",
                            cursor: "pointer",
                            fontSize: "16px"
                        }}
                    >
                        Cambiar contraseña
                    </button>
                </form>
            </div>
        </div>
    );
}