import { useState, useEffect } from "react";

function NuevaIncidencia({latitud, longitud, direccion}) {
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");

    const [direccion_texto, setDireccionTexto] = useState(direccion || "");
    const lat = latitud;
    const lon = longitud;

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

    const inputStyle = {
        width: "100%",
        padding: "8px 10px",
        marginBottom: "10px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        outline: "none",
        fontSize: "13px"
    };

    return (
        <div
            style={{
                width: "260px",
                margin: "0 auto",
                textAlign: "center"
            }}
        >
            <h2
                style={{
                    margin: "0 0 8px 0",
                    fontSize: "18px",
                    textAlign: "center"
                }}
            >
                Nueva incidencia
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="campo">
                    <input
                        type="text"
                        placeholder="Título"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div className="campo">
                    <textarea
                        placeholder="Descripción"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div className="campo">
                    <select
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        style={inputStyle}
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
                </div>
                <div
                    style={{
                        fontSize: "12px",
                        padding: "8px",
                        marginBottom: "10px",
                        background: "#f5f5f5",
                        borderRadius: "8px",
                        color: "#444"
                    }}
                >
                    {direccion_texto}
                </div>
                <div className="campo">
                    <h3>Imagen 1</h3>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImagen1(e.target.files[0])}
                        style={inputStyle}
                    />
                    {imagen1 && (
                        <img
                            src={URL.createObjectURL(imagen1)}
                            alt="preview1"
                            style={{
                                width: "100%",
                                maxHeight: "100px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                marginTop: "6px"
                            }}
                        />
                    )}
                </div>
                <div className="campo">
                    <h3>Imagen 2</h3>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImagen2(e.target.files[0])}
                        style={inputStyle}
                    />
                    {imagen2 && (
                        <img
                            src={URL.createObjectURL(imagen2)}
                            alt="preview2"
                            style={{
                                width: "100%",
                                maxHeight: "100px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                marginTop: "6px"
                            }}
                        />
                    )}
                </div>
                <button 
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "10px",
                        background: "#ff9800",
                        color: "black",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    {loading ? "Creando incidencia" : "Crear incidencia"}
                </button>
            </form>

            {error && (
                <p style={{color: "red"}}>{error}</p>
            )}
            {exito && (
                <p style={{color: "green"}}>{exito}</p>
            )}
        </div>
    );
}

export default NuevaIncidencia;