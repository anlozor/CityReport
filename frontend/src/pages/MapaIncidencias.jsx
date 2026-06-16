import { useEffect, useState } from "react";
import { getIncidencias } from "../services/incidenciasService";
import TarjetaIncidencia from "../components/TarjetaIncidencia";
import MapaLeaflet from "../components/MapaLeaflet";


function MapaIncidencias() {
    const [incidencias, setIncidencias] = useState([]);
    const [abrirLista, setAbrirLista] = useState(false);

    useEffect(() => {cargarIncidencias()}, []); // useEffect significa "ejecuta est cuando el componente se cargue"

    const cargarIncidencias = async () => {
        try {
            const data = await getIncidencias();
            console.log("INCIDENCIAS:", data);

            //if (response.ok) {
                setIncidencias(data);
            //}
        } catch (error) {
            console.error("ERROR", error);
            
        }

    };

    return (
        <div
            style={{height: "100vh", width: "100vw", position: "relative"}}
        >
            <MapaLeaflet incidencias={incidencias}/>
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