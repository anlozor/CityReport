import { Link } from "react-router-dom";

function TarjetaIncidencia({incidencia, vista}) {

    return (
        <Link
            to={`/incidencias/${incidencia.id_incidencia}`}
            style={{
                textDecoration: "none",
                color: "inherit"
            }}
        >
            <div>
                <h3>{incidencia.titulo}</h3>
                <p>{incidencia.descripcion}</p>

                {vista === "lista" && (
                    <div
                        style={{
                            marginTop: "8px",
                            fontSize: "13px",
                            color: "#666"
                        }}
                    >
                        <p style={{margin: 0}}>Ubicación: {incidencia.direccion_texto}</p>
                        <p style={{margin: 0}}>Fecha: {new Date(incidencia.fecha_creacion).toLocaleDateString()}</p>
                    </div>
                )}
            </div>
        </Link>
    );
    
}

export default TarjetaIncidencia;