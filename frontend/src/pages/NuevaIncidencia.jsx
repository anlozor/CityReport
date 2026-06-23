import { useState, useEffect } from "react";
import { postNuevaIncidencia } from "../services/incidenciasService";
import { toast } from "react-toastify";

function NuevaIncidencia({latitud, longitud, direccion, onIncidenciaCreada, modo = "popup"}) {
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");

    const [direccion_texto, setDireccionTexto] = useState(direccion || "");
    const esModoMapa = latitud != null && longitud != null && direccion;
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

        if (!titulo || !descripcion || !direccion_texto || !categoria || (!esModoMapa && !direccion_texto.trim())) {
            setError("Debes rellenar todos los campos");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData(); // Para subir archivos, imágenes en este caso

            let finalLat = lat;
            let finalLon = lon;

            if (!esModoMapa) {
                const res = await fetch(`https://nominatim.openstreetmaporg/search?format=json&q=${direccion_texto}`);

                const dat = await res.json();

                if (!dat.length) {
                    setError("No se ha encontrado la dirección");
                    return;
                }

                finalLat = data[0].lat;
                finalLon = data[0].lon;
            }
            formData.append("titulo", titulo);
            formData.append("descripcion", descripcion);
            formData.append("direccion_texto", direccion_texto);
            formData.append("categoria", categoria);
            formData.append("lat", finalLat);
            formData.append("lon", finalLon);

            if (imagen1) {
                formData.append("imagenes", imagen1);
            }
            if (imagen2) {
                formData.append("imagenes", imagen2);
            }

            const {response, data} = await postNuevaIncidencia(formData);

            if (response.ok) {
                toast.success("Incidencia creada correctamente");

                if (onIncidenciaCreada) {
                    onIncidenciaCreada();
                }

                setTitulo("");
                setDescripcion("");
                setDireccionTexto("");
                setCategoria("");
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

    const esPagina = modo === "pagina";

    const inputStyle = {
        width: "100%",
        padding: esPagina ? "12px 14px" : "8px 10px",
        marginBottom: "10px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        outline: "none",
        fontSize: esPagina ? "15px" : "13px"
    };

    return (
        <div
            style={{
                width: esPagina ? "100%" : "260px",
                maxWidth: esPagina ? "600px" : "260px",
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
                        style={{
                            ...inputStyle,
                            minHeight: esPagina ? "120px" : "80px",
                            resize: "none"
                        }}
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
                {esModoMapa ? (
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
                ) : (
                    <input
                        type="text"
                        placeholder="Introduce una dirección"
                        value={direccion_texto}
                        onChange={(e) => setDireccionTexto(e.target.value)}
                        style={inputStyle}
                    />
                )}
                
                <div className="campo">
                    <label
                        style={{
                            width: "100%",
                            height: "160px",
                            borderRadius: "10px",
                            border: "2px dashed #bbb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            overflow: "hidden",
                            marginBottom: "10px"
                        }}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setImagen1(file);
                                }
                            }}
                            style={{
                                display: "none"
                            }}
                        />
                        {imagen1 ? (
                            <img
                                src={URL.createObjectURL(imagen1)}
                                style={{
                                    width: "100%",
                                    mHeight: "100%",
                                    objectFit: "cover"
                                }}
                            />
                        ) : (
                            <span
                                style={{
                                    fontSize: "13px"
                                }}
                            >
                                + Imagen
                            </span>
                        )}
                    </label>
                </div>
                <div className="campo">
                    <label
                        style={{
                            width: "100%",
                            height: "160px",
                            borderRadius: "10px",
                            border: "2px dashed #bbb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            overflow: "hidden",
                            marginBottom: "10px"
                        }}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setImagen2(file);
                                }
                            }}
                            style={{
                                display: "none"
                            }}
                        />
                        {imagen2 ? (
                            <img
                                src={URL.createObjectURL(imagen2)}
                                style={{
                                    width: "100%",
                                    mHeight: "100%",
                                    objectFit: "cover"
                                }}
                            />
                        ) : (
                            <span
                                style={{
                                    fontSize: "13px"
                                }}
                            >
                                + Imagen
                            </span>
                        )}
                    </label>
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