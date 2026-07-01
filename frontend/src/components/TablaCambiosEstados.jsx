import { Link } from "react-router-dom";

function TablaCambiosEstados({cambios}) {
    return (
        <div
            style={{ marginTop: "30px" }}
        >
            <h3>Historial de cambios de estado</h3>
            <div
                style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    border: "1px solid #ddd",
                    borderRadius: "10px"
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse"
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                background: "#f5f5f5",
                                position: "sticky",
                                top: 0
                            }}
                        >
                            <th
                                style={{
                                    padding: "10px",
                                    textAlign: "left"
                                }}
                            >
                                Incidencia
                            </th>
                            <th
                                style={{
                                    padding: "10px",
                                    textAlign: "left"
                                }}
                            >
                                Estado nuevo
                            </th>
                            <th
                                style={{
                                    padding: "10px",
                                    textAlign: "left"
                                }}
                            >
                                Usuario
                            </th>
                            <th
                                style={{
                                    padding: "10px",
                                    textAlign: "left"
                                }}
                            >
                                Fecha
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {console.log("Cambios recibidos:", cambios)}
                        {cambios.map(c => (
                            <tr
                                key={c.id_cambio_estado}
                                style={{
                                    borderTop: "1px solid #eee"
                                }}
                            >
                                <td
                                    style={{
                                        padding: "10px"
                                    }}
                                >
                                    <Link
                                        to={`/gestion/incidencias/${c.incidencia_id}`}
                                        style={{
                                            color: "#d53400",
                                            fontWeight: "bold",
                                            textDecoration: "underline"
                                        }}
                                    >
                                        {c.titulo}
                                    </Link>
                                </td>
                                <td
                                    style={{
                                        padding: "10px"
                                    }}
                                >
                                    {c.estado}
                                </td>
                                <td
                                    style={{
                                        padding: "10px"
                                    }}
                                >
                                    {c.usuario}
                                </td>
                                <td
                                    style={{
                                        padding: "10px"
                                    }}
                                >
                                    {new Date(c.fecha_cambio).toLocaleDateString("es-ES")}
                                </td>
                            </tr>
                        ))}
                        {cambios.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    style={{
                                        padding: "10px",
                                        textAlign: "center",
                                        color: "#888"
                                    }}
                                >
                                    No hay cambios de estado registrados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TablaCambiosEstados;