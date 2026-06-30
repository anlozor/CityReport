import { useEffect, useState } from "react";
import { getIncidencias } from "../services/incidenciasService";
import MapaLeaflet from "../components/MapaLeaflet";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiFilter } from "react-icons/fi";
import PanelFiltros from "../components/PanelFiltros";
import L from "leaflet";
import { generarDocumento } from "../services/documentosService";

function MapaGestor() {
    const [incidencias, setIncidencias] = useState([]);
    const navigate = useNavigate();

    const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
    const [filtros, setFiltros] = useState({
        votos: false,
        historicas: false,
        fecha: "0",
        estado: [],
        proximidad: 500,
        proximidadIndice: 0,
        proximidadActivada: false,
        propias: false
    });
    const [ubicacionUsuario, setUbicacionUsuario] = useState(null);

    const [searchParams] = useSearchParams();
    const modoDocumento = searchParams.get("modo") === "documento";
    
    const [incidenciasSeleccionadas, setIncidenciasSeleccionadas] = useState([]);

    const pedirUbicacion = () => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUbicacionUsuario({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude
                });
            },
            () => {
                toast.error("Sin permisos de usuario, usando Madrid como centro.");
                setUbicacionUsuario({
                    lat: 40.4168,
                    lon: -3.7038
                });
            }
        );
    };

    // Si la incidencia no estaba seleccionada se añade, y si lo estaba, la quita
    const toggleSeleccionIncidencia = (incidencia) => {
        setIncidenciasSeleccionadas((prev) => {
            const existe = prev.some((i) => i.id_incidencia === incidencia.id_incidencia);

            if (existe) {
                return prev.filter((i) => i.id_incidencia !== incidencia.id_incidencia);
            }

            return [...prev, incidencia];
        });

    };

    const handleClickIncidencia = (incidencia) => {
        if (modoDocumento) {
            toggleSeleccionIncidencia(incidencia);
        } else {
            navigate(`/gestion/incidencias/${incidencia.id_incidencia}`);
        }
    };

    const cargarIncidencias = async () => {
        try {
            const data = await getIncidencias({
                ...filtros,
                lat: ubicacionUsuario?.lat,
                lon: ubicacionUsuario?.lon
            });
            setIncidencias(data);
        } catch (error) {
            console.error(error);
        }
    };

    const totalSeleccionadas = incidenciasSeleccionadas.length;

    const generarPDF = async () => {
        try {
            const ids = incidenciasSeleccionadas.map(i => i.id_incidencia);

            if (ids.length === 0) {
                toast.info("No hay incidencias seleccionadas");
                return;
            }

            const blob = await generarDocumento(ids);

            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "incidencias.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }  
    };

    useEffect(() => {
        cargarIncidencias();
    }, [filtros, ubicacionUsuario]);

    useEffect(() => {
        if (!modoDocumento) {
            setIncidenciasSeleccionadas([]);
        }
    }, [modoDocumento]);

    return (
        <div
            style={{
                height: "100vh",
                width: "100vw"
            }}
        >
            <MapaLeaflet
                incidencias={incidencias}
                modo="gestor"
                ubicacionUsuario={ubicacionUsuario}
                onVerDetalles={handleClickIncidencia}
                incidenciasSeleccionadas={incidenciasSeleccionadas}
                modoDocumento={modoDocumento}
            />

            {modoDocumento && (
                <div
                    style={{
                        position: "absolute",
                        top: "20px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 3000,
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                        background: "white",
                        padding: "12px 20px",
                        borderRadius: "14px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column"
                        }}
                    >
                        <span
                            style={{
                                fontWeight: "bold",
                                color: "#ff8c00"
                            }}
                        >
                            Modo selección de incidencias para generar documento
                        </span>
                        <span
                            style={{
                                fontSize: "16px",
                                color: "#555"
                            }}
                        >
                            Seleccionadas: {totalSeleccionadas}
                        </span>
                    </div>

                    <button
                        onClick={() => navigate("/mapa-gestor")}
                        style={{
                            border: "none",
                            background: "#ff8c00",
                            color: "white",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "16px"
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={generarPDF}
                        style={{
                            border: "none",
                            background: "orange",
                            color: "white",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "16px"
                        }}
                    >
                        Generar documento
                    </button>
                </div>
            )}
            {modoDocumento && (
                <div
                    style={{
                        position: "absolute",
                        top: "90px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 3000,
                        display: "flex",
                        gap: "20px",
                        background: "white",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        fontSize: "14px",
                        alignItems: "center",
                        whiteSpace: "nowrap"
                    }}
                >
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                            style={{
                                width: "12px",
                                height: "12px",
                                background: "#ff3b3b",
                                borderRadius: "50%",
                                border: "2px solid white",
                                flexShrink: 0
                            }}
                        />
                        <span>No seleccionada</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div
                            style={{
                                width: "14px",
                                height: "14px",
                                background: "#00c835",
                                borderRadius: "4px",
                                transform: "rotate(45deg)",
                                border: "2px solid white",
                                flexShrink: 0
                            }}
                        />
                        <span>Seleccionada</span>
                    </div>
                </div>
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
                mostrarVotos={false}
                setAbierto={setFiltrosAbiertos}
            />
        </div>
    );
}

export default MapaGestor;