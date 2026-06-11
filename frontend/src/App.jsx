// Imports
import { useState } from "react";

function App() {
  // useState se usa para datos que cambian, como un contador que cambia según los botones que pulses
  const [contador, setContador] = useState(0);

  const titulo = "City Report";
  const nombre = "Andrea";

  // Prev es más seguro ya que siempre tiene el valor más actualizado del estado

  return (
    <>
      <h1>{titulo}</h1>
      <p><strong>Contador: {contador}</strong></p>
      <button onClick={() => setContador(prev => prev + 1)}>Sumar</button>
      <button onClick={() => setContador(prev => prev - 1)}>Restar</button>
      <p>Bienvenida {nombre}</p>

    </>
  );
}

export default App
