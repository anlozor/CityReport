import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { activarGestor } from "../services/solicitudGestorService";

function ActivarGestor() {
    const [identificador, setIdentificador] = useState("");
    const [codigo, setCodigo] = useState("");
    const navigate = useNavigate();

    const handleActivar = async (e) => {
        e.preventDefault();

        try {
            const { response, data } = await activarGestor({
                identificador_gestor: identificador,
                codigo_activacion: codigo
            });

            if (!response.ok) {
                toast.error(data.mensaje);
                return;
            }

            toast.success(data.mensaje);

            // Guardamos token de activación
            localStorage.setItem("tokenActivacion", data.token);

            navigate("/restablecer-contrasena");

        } catch (error) {
            console.error(error);
            toast.error("Error al activar la cuenta");
        }
    };

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh"
        }}>
            <form
                onSubmit={handleActivar}
                style={{
                    width: "350px",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                }}
            >
                <h2>Activar cuenta de gestor</h2>

                <input
                    placeholder="Identificador de gestor"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    style={{
                        fontSize: "16px"
                    }}
                />

                <input
                    placeholder="Código de activación"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    style={{
                        fontSize: "16px"
                    }}
                />

                <button
                    type="submit"
                    style={{
                        background: "orange",
                        fontWeight: "bold",
                        padding: "10px",
                        fontSize: "16px"
                    }}
                >
                    Activar cuenta
                </button>
            </form>
        </div>
    );
}

export default ActivarGestor;