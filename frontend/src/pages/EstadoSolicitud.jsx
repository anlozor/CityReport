import { useState, useEffect } from "react";
import { obtenerMiSolicitud, reenviarCorreoSolicitud } from "../services/solicitudGestorService";
import { toast } from "react-toastify";

function EstadoSolicitud() {
    const [solicitud, setSolicitud] = useState(null);

    useEffect(() => {
        cargarSolicitud();
    }, []);

    const cargarSolicitud = async () => {
        try {
            const {response, data} = await obtenerMiSolicitud();

            if (!response.ok) {
                toast.error(data.mensaje);
                return;
            }

            setSolicitud(data.solicitud);

        } catch (error) {
            console.error(error);
        }
    };

    const handleReenviarCorreo = async () => {
        try {
            const {response, data} = await reenviarCorreoSolicitud(solicitud.id_solicitud);

            if (!response.ok) {
                toast.error(data.mensaje);
                return;
            }
            toast.success(data.mensaje);
        } catch (error) {
            console.error(error);
            
        }
    };

    if (!solicitud) {
        return <h2>Cargando solicitud...</h2>;
    }

    return (
        <div
            style={{
                maxWidth: "800px",
                margin: "40px auto",
                padding: "30px"
            }}
        >
            <h1
                style={{
                    textAlign: "center",
                    marginBottom: "30px"
                }}
            >
                Estado de la solicitud
            </h1>
            <div
                style={{
                    borderRadius: "12px",
                    border: "1px solid #ddd",
                    padding: "25px",
                    background: "#fafafa"
                }}
            >
                <p>
                    <b>Fecha de la solicitud:</b>{" "}
                    {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                </p>
                <p>
                    <b>Estado:</b> {solicitud.estado}
                </p>
            </div>

            {solicitud.estado === "Enviada" && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "20px",
                        borderRadius: "10px",
                        background: "#fff3cd"
                    }}
                >
                    <h3
                        style={{
                            textDecoration: "underline"
                        }}
                    >
                        Solicitud en revisión
                    </h3>
                    <p>
                        Tu solicitud ha sido recibida correctamente y está siendo revisada por un administrador.
                    </p>
                </div>
            )}

            {solicitud.estado === "Rechazada" && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "20px",
                        borderRadius: "10px",
                        background: "#f8d7da"
                    }}
                >
                    <h3
                        style={{
                            textDecoration: "underline"
                        }}
                    >
                        Solicitud rechazada
                    </h3>
                    <p>Tu solicitud de gestor ha sido rechazada.</p>
                    <p>
                        Debes esperar 30 días antes de volver a enviar una nueva solicitud.
                    </p>
                </div>
            )}

            {solicitud.estado === "Aceptada" && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "20px",
                        borderRadius: "10px",
                        background: "#d4edda"
                    }}
                >
                    <h3
                        style={{
                            textDecoration: "underline"
                        }}
                    >
                        Solicitud aceptada
                    </h3>
                    <p>Tu solicitud ha sido aceptada.</p>
                    <p>
                        Se ha enviado un correo electrónico con las credenciales y las instrucciones necesarias para activar la cuenta.
                    </p>
                    <p>
                        Si no has recibido el correo, pulsa 
                        <button
                            onClick={handleReenviarCorreo}
                            style={{
                                background: "none",
                                border: "none",
                                color: "#007bff",
                                textDecoration: "underline",
                                cursor: "pointer",
                                padding: 0,
                                fontSize: "13px"
                            }}
                        >
                            aquí 
                        </button>
                        para reenviar el correo
                    </p>
                </div>
            )}
        </div>
    );
}

export default EstadoSolicitud;