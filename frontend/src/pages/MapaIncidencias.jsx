import { useEffect, useState } from "react";
import { getIncidencias } from "../services/incidenciasService";
import TarjetaIncidencia from "../components/TarjetaIncidencia";
import MapaLeaflet from "../components/MapaLeaflet";
import { toast } from "react-toastify";


function MapaIncidencias() {
    const [incidencias, setIncidencias] = useState([]);
    const [abrirLista, setAbrirLista] = useState(false);
    const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState(null);

    const actualizarVoto = (id_incidencia) => {
        setIncidencias(prev => prev.map(inc => inc.id_incidencia === id_incidencia ? {...inc, num_votos: Number(inc.num_votos) + 1} : inc));
    };

    useEffect(() => { cargarIncidencias();}, []);

    const cargarIncidencias = async () => {
        try {
            const data = await getIncidencias();
            setIncidencias(data);
        } catch (error) {
            console.error("ERROR", error);
        }
    };

    return (
        <div
            style={{height: "100vh", width: "100vw", position: "relative"}}
        >
            <MapaLeaflet 
                incidencias={incidencias}
                onVerDetalles={setIncidenciaSeleccionada}
                onActualizarVoto ={actualizarVoto}
            />
            
            {incidenciaSeleccionada && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "400px",
                        height: "100%",
                        background: "white",
                        zIndex: 2000,
                        overflowY: "auto",
                        boxShadow: "-2px 0 8px rgba(0,0,0,0.2)"
                    }}
                >
                    <button onClick={() => setIncidenciaSeleccionada(null)}>X</button>
                    <h2>{incidenciaSeleccionada.titulo}</h2>
                    <p>
                        <strong>Categoría:</strong>{" "}
                        {incidenciaSeleccionada.categoria}
                    </p>
                    <p>{incidenciaSeleccionada.descripcion}</p>
                </div>
            )}
            {abrirLista && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "350px",
                        height: "100%",
                        background: "white",
                        overflowY: "auto",
                        zIndex: 100
                    }}
                >
                    <h3>Incidencias</h3>

                    <ul>
                        {incidencias.map((inc) => (
                            <TarjetaIncidencia
                                key={inc.id_incidencia}
                                incidencia={inc}
                            />
                        ))}
                    </ul>

                </div>
            )}

            <button
                onClick={() => setAbrirLista(!abrirLista)}
                style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    zIndex: 1000
                }}
            >
                Lista
            </button>
        </div>
    );
}

export default MapaIncidencias;