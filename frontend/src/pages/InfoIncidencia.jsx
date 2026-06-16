import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getIncidenciaId } from "../services/incidenciasService";

function InfoIncidencia() {

    const { id } = useParams();

    const [incidencia, setIncidencia] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarIncidencia();
    }, []);

    const cargarIncidencia = async () => {
        try {
            const {response, data} = await getIncidenciaId(id);

            if (response.ok) {
                setIncidencia(data);
            }
        } catch (error) {
            console.error(error);
            
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <h1>Cargando...</h1>
    }

    if (!incidencia) {
        return <h1>No se encontró la incidencia</h1>
    }
    
    return (
        <>
            <h1>{incidencia.titulo}</h1>
            <p>{incidencia.descripcion}</p>
        </>
    );

}

export default InfoIncidencia;