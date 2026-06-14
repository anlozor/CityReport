// Imports
import { useState } from "react";

function App() {
  // useState se usa para datos que cambian, como un contador que cambia según los botones que pulses
  // Los input o cuadros de texto se guardan en estado
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  // Vamos a usar otro useState para mostrar mensajes de texto
  const [mensaje, setMensajeLogin] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Para probarlo ponemos esto para verlo en la consola del navegador
    console.log("Email:", email);
    console.log("Contraseña:", contraseña);

    // Vamos a llamar al backend
    try {
      const response = await fetch("http://localhost:3000/usuarios/login", {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({
          email, contraseña,
        }),
      });
      const data = await response.json(); // Nos devuelve mensaje y token

      /*******************/
      console.log("Código:", response.status);
      console.log("Datos:", data);

      // Una vez dado a login y recibida la respuesta
      setMensajeLogin(data.mensaje);
      // Si la respuesta del backend es que todo ok (códigos 200-299), guardamos el token
      if (response.ok) {
        localStorage.setItem("token", data.token);
      }



      console.log("Respuesta backend:", data);
    } catch (error) {
      console.error("Error de login:", error);
      
    }
  };

  // Prev es más seguro ya que siempre tiene el valor más actualizado del estado

  return (
    <>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}/>

          <br/><br/>

        <input
        type="password"
        placeholder="Contraseña"
        value={contraseña}
        onChange={(e) => setContraseña(e.target.value)}/>

          <br/><br/>

        <button type="Submit">Entrar</button>
        <br/>
        <p>{mensaje}</p>
      </form>

    </>
  );
}

export default App
