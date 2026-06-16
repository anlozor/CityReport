import { Link } from "react-router-dom";

function TarjetaIncidencia({incidencia}) {

    return (
        <Link to={`/incidencias/${incidencia.id_incidencia}`}>
            <div>
                <h3>{incidencia.titulo}</h3>
                <p>{incidencia.descripcion}</p>
            </div>
        </Link>
    );
    
}

export default TarjetaIncidencia;