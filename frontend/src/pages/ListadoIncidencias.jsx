import TarjetaIncidencia from "../components/TarjetaIncidencia";
import { useEffect, useState } from "react";
import { getIncidencias } from "../services/incidenciasService";
import { toast } from "react-toastify";
import PanelFiltros from "../components/PanelFiltros";
import {FiFilter} from "react-icons/fi";

export default function ListadoIncidencias({onVerDetalles, onActualizarVoto}) {
    const [incidencias, setIncidencias] = useState([]);

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

    useEffect(() => {
        cargarIncidencias();
    }, []);

    useEffect(() => {
        if (!ubicacionUsuario) {
            return;
        }
        cargarIncidencias();
    }, [filtros, ubicacionUsuario]);

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                padding: "25px",
                paddingTop: "80px",
                boxSizing: "border-box",
                background: "linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%)"
            }}
        >
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
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "20px"
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        fontSize: "22px",
                        fontWeight: "600",
                        color: "#333"
                    }}
                >
                    Listado de incidencias
                </h2>
                <span
                    style={{
                        fontSize: "14px",
                        color: "#333",
                        background: "orange",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
                    }}
                >
                    {incidencias.length} Incidencias
                </span>
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                }}
            >
                {incidencias.map((inc) => (
                    <div
                        key={inc.id_incidencia}
                        style={{
                            background: "#fff",
                            borderRadius: "12px",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
                            padding: "10px"
                        }}
                    >
                        <TarjetaIncidencia
                            incidencia={inc}
                            vista="lista"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}