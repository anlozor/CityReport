import { useEffect, useState } from "react";
import { getIncidencias } from "../services/incidenciasService";
import TarjetaIncidencia from "../components/TarjetaIncidencia";

function MapaIncidencias() {
    const [incidencias, setIncidencias] = useState([]);

    useEffect(() => {cargarIncidencias()}, []); // useEffect significa "ejecuta est cuando el componente se cargue"

    const cargarIncidencias = async () => {
        try {
            const {response, data} = await getIncidencias();
            console.log(data);

            if (response.ok) {
                setIncidencias(data);
            }
        } catch (error) {
            console.error(error);
            
        }

    };

    return (
        <>
            <h1>Mapa de incidencias</h1>
            <h2>
                Número de incidencias:
                {" "}
                {incidencias.length}
            </h2>

            <ul>
                {incidencias.map((incidencia) => (
                    <TarjetaIncidencia
                        key={incidencia.id_incidencia}
                        incidencia={incidencia}
                    />
                ))}
            </ul>
            <p>Aquí irá el mapa</p>
        </>
    );
}

export default MapaIncidencias;