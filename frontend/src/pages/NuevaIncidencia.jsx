import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function NuevaIncidencia() {
    const location = useLocation();

    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [direccion_texto, setDireccionTexto] = useState(location.state?.direccion_texto || "");
    const [lat, setLat] = useState(location.state?.lat || null);
    const [lon, setLon] = useState(location.state?.lon || null);
    const [categoria, setCategoria] = useState("");
    const [categorias, setCategorias] = useState([]);

    const [imagen1, setImagen1] = useState(null);
    const [imagen2, setImagen2] = useState(null);

    const [error, setError] = useState("");
    const [exito, setExito] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {cargarCategorias();}, []);

    const cargarCategorias = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:3000/categorias", {
                headers: {Authorization: `Bearer ${token}`}
            });

            const data = await response.json();

            if (response.ok) {
                setCategorias(data);
            }

        } catch (error) {
            console.error(error);
            
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setExito("");

        console.log({
    titulo,
    descripcion,
    direccion_texto,
    categoria,
    lat,
    lon
});

        if (!titulo || !descripcion || !direccion_texto || !categoria || lat === null || lon === null) {
            setError("Debes rellenar todos los campos");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const formData = new FormData(); // Para subir archivos, imágenes en este caso

            formData.append("titulo", titulo);
            formData.append("descripcion", descripcion);
            formData.append("direccion_texto", direccion_texto);
            formData.append("categoria", categoria);
            formData.append("lat", lat);
            formData.append("lon", lon);

            if (imagen1) {
                formData.append("imagenes", imagen1);
            }
            if (imagen2) {
                formData.append("imagenes", imagen2);
            }

            const response = await fetch("http://localhost:3000/incidencias", {
                method: "POST",
                headers: {Authorization: `Bearer ${token}`,},
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setExito(data.mensaje);

                setTitulo("");
                setDescripcion("");
                setDireccionTexto("");
                setCategoria("");
                setLat(null);
                setLon(null);
                setImagen1(null);
                setImagen2(null);
            } else {
                setError(data.mensaje);

            }

            console.log(data);
    
        } catch (error) {
            console.error(error);
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h1>Nueva incidencia</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Título"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                />
                <br/>
                <textarea
                    placeholder="Descripción"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                />
                <br/>

                <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                >
                    <option value="">Selecciona una categoría</option>
                    {categorias.map((categoria) => (
                        <option
                            key={categoria.id_categoria}
                            value={categoria.nombre}
                        >
                            {categoria.nombre}
                        </option>
                    ))}
                </select>

                <br/>

                <input
                    type="text"
                    placeholder="Dirección"
                    value={direccion_texto}
                    onChange={(e) => setDireccionTexto(e.target.value)}
                />

                <br/>

                <h3>Imagen 1</h3>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImagen1(e.target.files[0])}
                />
                {imagen1 && (
                    <img
                        src={URL.createObjectURL(imagen1)}
                        alt="preview1"
                        width="200"
                    />
                )}
                <br/>
                <h3>Imagen 2</h3>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImagen2(e.target.files[0])}
                />
                {imagen2 && (
                    <img
                        src={URL.createObjectURL(imagen2)}
                        alt="preview2"
                        width="200"
                    />
                )}
                <br/>
                <button type="submit" disabled={loading}>
                    {loading ? "Creando incidencia" : "Crear incidencia"}
                </button>
            </form>

            {error && (
                <p style={{color: "red"}}>{error}</p>
            )}
            {exito && (
                <p style={{color: "green"}}>{exito}</p>
            )}
        </>
    );
}

export default NuevaIncidencia;