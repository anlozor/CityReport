// Imports
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/loginService";
import { Link } from "react-router-dom";

function Login() {
    // useState se usa para datos que cambian, como un contador que cambia según los botones que pulses
    // Los input o cuadros de texto se guardan en estado
    const [email, setEmail] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [mensaje, setMensajeLogin] = useState("");
    const navigate = useNavigate();

    // Función para enviar el formulario
    const handleSubmit = async (e) => { // e de Evento, en este caso el submit del formulario
        e.preventDefault(); // Para que no haga comportamiento normal de formulario y mandarle yo lo que quiero que haga

        try {
            const {response, data} = await login(email, contraseña);

            /*******************/
            console.log("Código:", response.status);
            console.log("Datos:", data);
            /*******************/

            // Una vez dado a login y recibida la respuesta
            setMensajeLogin(data.mensaje);

            // Si la respuesta del backend es que todo ok (códigos 200-299), guardamos el token
            if (response.ok) {
                localStorage.setItem("token", data.token);
                console.log("Token guardado");
                navigate("/mapa");
            } else {
                localStorage.removeItem("token"); // Así si estoy haciendo pruebas no se me queda guardado el token innecesariamente
            }
            console.log("Respuesta backend:", data);
            
        } catch (error) {
            console.error("Error de login:", error);
            setMensajeLogin("Error al conectar con el servidor");
            
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                width: "100vw"
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
                <h1>Login</h1>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <br/><br/>

                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={contraseña}
                        onChange={(e) => setContraseña(e.target.value)}
                    />

                    <br/><br/>

                    <button type="Submit" style={{background: "orange"}}>Iniciar sesión</button>
                </form>
                <br/>
                <button
                    type="button"
                    onClick={() => navigate("/recuperar-contrasena")}
                    style={{
                        marginTop: "10px",
                        background: "transparent",
                        border: "none",
                        color: "#3b82f6",
                        cursor: "pointer",
                        textDecoration: "underline"
                    }}
                >
                    ¿Has olvidado tu contraseña?
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/registro")}
                    style={{
                        marginTop: "10px",
                        background: "transparent",
                        border: "none",
                        color: "#3b82f6",
                        cursor: "pointer",
                        textDecoration: "underline"
                    }}
                >
                    ¿No tienes cuenta? Pincha aquí y regístrate
                </button>
                <br/>

                <p>{mensaje}</p>
            </div>
    </div>
    );
    
}

// Exports
export default Login;