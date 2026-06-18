import { useState } from "react";
import { registro } from "../services/registroService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function RegistroNuevoUsuario() {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [alias, setAlias] = useState("");

    const [errores, setErrores] = useState({});

    const navigate  = useNavigate();

    const handleSubmit = async () => {
        if (!validar()) {
            return;
        }

        try {
            const {response, data} = await registro(nombre, email, contraseña, alias);

            if (!response.ok) {
                toast.error(data.mensaje);
                return;
            }
            localStorage.setItem("token", data.token);
            toast.success("Usuario creado correctamente");

            navigate("/mapa");
            
        } catch (error) {
            console.error(error);
        }
    };

    const validar = () => {
        const nuevosErrores = {};

        if (!nombre.trim()) {
            nuevosErrores.nombre = true;
        }
        if (!email.trim()) {
            nuevosErrores.email = true;
        }
        if (!contraseña.trim()) {
            nuevosErrores.contraseña = true;
        }

        setErrores(nuevosErrores);

        return Object.keys(nuevosErrores).length === 0;
    };

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <div
                style={{
                    width: "320px",
                    padding: "20px",
                    background: "white",
                    borderRadius: "10px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}
            >
                <form
                    onSubmit={(e) => {e.preventDefault(); handleSubmit;}}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        width: "100%",
                        alignItems: "stretch"
                    }}
                >
                    <h2>Registro de nuevo usuario</h2>
                    <p
                        style={{
                            color: "#b91c1c",
                            fontSize: "13px",
                            marginBottom: "10px"
                        }}
                    >
                        * Campos obligatorios
                    </p>
                    <label>Nombre<span style={{color: "red"}}>*</span></label>
                    <input
                        className={errores.nombre ? "shake" : ""}
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        style={{
                            border: errores.nombre ? "2px solid red" : "1px solid #ccc",
                            outline: "none",
                            padding: "8px",
                            borderRadius: "6px"
                        }}
                    />
                    <label>Email<span style={{color: "red"}}>*</span></label>
                    <input
                        className={errores.email ? "shake" : ""}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            border: errores.email ? "2px solid red" : "1px solid #ccc",
                            outline: "none",
                            padding: "8px",
                            borderRadius: "6px"
                        }}
                    />
                    <label>Contraseña<span style={{color: "red"}}>*</span></label>
                    <input
                        className={errores.contraseña ? "shake" : ""}
                        type="password"
                        value={contraseña}
                        onChange={(e) => setContraseña(e.target.value)}
                        style={{
                            border: errores.contraseña ? "2px solid red" : "1px solid #ccc",
                            outline: "none",
                            padding: "8px",
                            borderRadius: "6px"
                        }}
                    />
                    <label>Alias</label>
                    <input
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                        style={{
                            border: "1px solid #ccc",
                            outline: "none",
                            padding: "8px",
                            borderRadius: "6px"
                        }}
                    />
                    <button onClick={handleSubmit}>Registrarse</button>
                </form>
            </div>
        </div>
    );
}

export default RegistroNuevoUsuario;