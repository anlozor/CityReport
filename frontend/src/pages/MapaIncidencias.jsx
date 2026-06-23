import { useEffect, useState, useRef } from "react";
import { getIncidenciaId, getIncidencias } from "../services/incidenciasService";
import TarjetaIncidencia from "../components/TarjetaIncidencia";
import MapaLeaflet from "../components/MapaLeaflet";
import { toast } from "react-toastify";
import { sacarRoldelToken } from "../services/despiezarTokenService";
import { crearComentario } from "../services/comentariosService";
import PerfilUsuario from "./PerfilUsuario";
import { data } from "react-router-dom";
import PanelFiltros from "../components/PanelFiltros";
import {FiFilter} from "react-icons/fi";
import ListadoIncidencias from "./ListadoIncidencias";

function MapaIncidencias() {
    const [incidencias, setIncidencias] = useState([]);
    const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState(null);
    const [nuevaIncidencia, setNuevaIncidencia] = useState(null);

    const [textoComentario, setTextoComentario] = useState("");
    const [esAnonimo, setEsAnonimo] = useState(false);
    const [imagenComentario, setImagenComentario] = useState(null);

    const rol_id = sacarRoldelToken();

    const fileInputRef = useRef(null);

    const [menuAbierto, setMenuAbierto] = useState(false);

    const [vista, setVista] = useState("mapa");

    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
    const [filtros, setFiltros] = useState({
        votos: "false",
        historicas: "false",
        fecha: "0",
        estado: [],
        proximidad: 500,
        proximidadIndice: 0,
        proximidadActivada: false,
        propias: "false"
    });
    const [ubicacionUsuario, setUbicacionUsuario] = useState(null);

    const actualizarVoto = (id_incidencia) => {
        setIncidencias(prev => prev.map(inc => inc.id_incidencia === id_incidencia ? {...inc, num_votos: Number(inc.num_votos) + 1} : inc));
    };

    const handleNuevaIncidencia = (datos) => {
        setIncidenciaSeleccionada(null);
        setNuevaIncidencia(datos);
    };

    const handleVerDetalles = (incidencia) => {
        setFiltrosAbiertos(false);
        setNuevaIncidencia(null);
        setIncidenciaSeleccionada(incidencia);
    };

    const handleIncidenciaCreada = () => {
        cargarIncidencias();
        setNuevaIncidencia(null);
        setIncidenciaSeleccionada(null);
    };

    const pedirUbicacion = () => {
        navigator.geolocation.getCurrentPosition((pos) => {
            setUbicacionUsuario({
                lat: pos.coords.latitude,
                lon: pos.coords.longitude
            });
        }, (error) => {
            console.error("ERROR GEOLOCALIZACIÓN:", error);
            toast.error("Sin permisos de usuario, usando como centro de ubicación Madrid");
            setUbicacionUsuario({
                lat: 40.4168,
                lon: -3.7038
            });
        });
    };

    // Cada vez que se carga, se cargan las incidencias y se resetean los campos
    useEffect(() => { cargarIncidencias();}, []);
    useEffect(() => {
        setTextoComentario("");
        setImagenComentario(null);
        setEsAnonimo(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    }, [incidenciaSeleccionada]);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".menu-hamburguesa")) {
                setMenuAbierto(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);
    useEffect(() => {
        if (!ubicacionUsuario) {
            return;
        }
        cargarIncidencias();
    }, [filtros, ubicacionUsuario]);

    const cargarIncidencias = async () => {
        try {
            const data = await getIncidencias({
                ...filtros,
                lat: ubicacionUsuario?.lat,
                lon: ubicacionUsuario?.lon
            });
            setIncidencias(data);
        } catch (error) {
            console.error("ERROR", error);
        }
    };

    const menuItemStyle = {
        width: "100%",
        padding: "10px",
        border: "none",
        background: "white",
        textAlign: "left",
        cursor: "pointer"
    };

    const handleCrearComentario = async () => {
        try {
            const {response, data} = await crearComentario(textoComentario, incidenciaSeleccionada.id_incidencia, esAnonimo, imagenComentario);

            if (!response.ok) {
                toast.error(data.mensaje);
                return;
            }

            toast.success("Comentario publicado");

            const incidenciaActualizada = await getIncidenciaId(incidenciaSeleccionada.id_incidencia);

            setIncidenciaSeleccionada(incidenciaActualizada.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div
            style={{height: "100vh", width: "100vw", position: "relative"}}
        >
            {vista === "mapa" && (
                <MapaLeaflet 
                    incidencias={incidencias}
                    onVerDetalles={handleVerDetalles}
                    onActualizarVoto={actualizarVoto}
                    onNuevaIncidencia={handleNuevaIncidencia}
                    nuevaIncidencia={nuevaIncidencia}
                    setNuevaIncidencia={setNuevaIncidencia}
                    onIncidenciaCreada={handleIncidenciaCreada}
                    ubicacionUsuario={ubicacionUsuario}
                />
            )}
            {vista === "perfil" && (
                <PerfilUsuario/>
            )}
            {vista === "listado" && (
                <ListadoIncidencias
                    onVerDetalles={handleVerDetalles}
                    onActualizarVoto={actualizarVoto}
                />
            )}

            <button
                onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                style={{
                    position: "absolute",
                    top: "20px",
                    right: "20px",
                    zIndex: 2500,
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "20px",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                    background: "white"
                }}
            >
                <FiFilter size={22}/>
            </button>
            <PanelFiltros
                abierto={filtrosAbiertos}
                filtros={filtros}
                setFiltros={setFiltros}
                pedirUbicacion={pedirUbicacion}
            />
            
            {incidenciaSeleccionada && (
                
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "400px",
                        height: "100vh",
                        background: "white",
                        zIndex: 3000,
                        overflowY: "auto",
                        boxShadow: "-4px 0 12px rgba(0,0,0,0.2)",
                        transition: "transform 0.3s ease",
                        padding: "20px",
                        boxSizing: "border-box"
                    }}
                >
                    <button
                        onClick={() => setIncidenciaSeleccionada(null)}
                        style={{
                            float: "right",
                            marginBottom: "15px"
                        }}
                    >X</button>
                    <h2 style={{marginBottom: "15px"}}>{incidenciaSeleccionada.titulo}</h2>
                    <p style={{marginBottom: "10px"}}>
                        <strong>Categoría:</strong>{" "}
                        {incidenciaSeleccionada.categoria_nombre}
                    </p>
                    <p style={{lineHeight: "1.5"}}>{incidenciaSeleccionada.descripcion}</p>
                    {console.log("IMAGEN:", incidenciaSeleccionada.imagenes[0])}
                    {incidenciaSeleccionada.imagenes?.length > 0 && (
                        <div style={{marginTop: "15px"}}>
                            {incidenciaSeleccionada.imagenes.map((img) => (
                                <img
                                    key={img.id_imagen}
                                    src={`http://localhost:3000/uploads/${img.ruta.split("/").pop()}`}
                                    style={{
                                        width: "100%",
                                        marginBottom: "10px",
                                        borderRadius: "8px"
                                    }}/>
                            ))}
                        </div>
                    )}
                    <textarea
                        value={textoComentario}
                        onChange={(e) => setTextoComentario(e.target.value)}
                        rows={4}
                        placeholder="Escribe aquí tu comentario..."
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            resize: "vertical"
                        }}
                    />
                    {rol_id === 3 && (
                        <label
                            style={{
                                display: "flex",
                                gap: "8px",
                                marginTop: "10px"
                            }}
                        >
                        <input
                            type="checkbox"
                            checked={esAnonimo}
                            onChange={(e) => setEsAnonimo(e.target.checked)}
                        /> Anónimo
                        </label>
                    )}
                    <div
                        style={{marginTop: "15px"}}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImagenComentario(e.target.files[0] || null)}
                        />
                    </div>
                    {imagenComentario && (
                        <img
                            src={URL.createObjectURL(imagenComentario)}
                            alt="Vista previa"
                            style={{
                                width: "100%",
                                marginTop: "10px",
                                borderRadius: "8px"
                            }}
                        />
                    )}
                    <button
                        onClick={handleCrearComentario}
                        style={{
                            marginTop: "15px",
                            width: "100%"
                        }}
                    >
                        Publicar comentario
                    </button>
                    <div
                        style={{
                            marginTop: "20px",
                            maxHeight: "250px",
                            overflowY: "auto",
                            borderTop: "1px solid #ddd",
                            paddingTop: "10px"
                        }}
                    >
                        <h4>Comentarios</h4>
                        {incidenciaSeleccionada.comentarios?.length > 0 ? (
                            incidenciaSeleccionada.comentarios.map((c, i) => (
                                <div
                                    key={i}
                                    style={{
                                        marginBottom: "12px",
                                        padding: "10px",
                                        borderRadius: "10px",

                                        backgroundColor: c.es_gestor ? "#ffe082" : "#fafafa",
                                        border: c.es_gestor ? "2px solid #ff9800" : "1px solid #e0e0e0",

                                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
                                    }}
                                >
                                    <strong>{c.autor}</strong>
                                    <p style={{margin: 0}}>{c.texto}</p>
                                    {c.imagenesComentarios.map((img) => (
                                        <img
                                            key={img.id_imagen}
                                            src={`http://localhost:3000/uploads/${img.ruta}`}
                                            style={{
                                                width: "100%",
                                                marginTop: "10px",
                                                borderRadius: "8px"
                                            }}
                                        />
                                    ))}
                                    <small>{new Date(c.fecha_creacion).toLocaleString()}</small>
                                </div>
                            ))
                        ) : (
                            <p>Aún no hay comentarios en esta incidencia</p>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}

export default MapaIncidencias;