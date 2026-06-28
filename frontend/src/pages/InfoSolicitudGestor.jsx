import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getSolicitud, aceptarSolicitud, rechazarSolicitud, crearGestor } from "../services/solicitudGestorService";

function InfoSolicitudGestor() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [solicitud, setSolicitud] = useState(null);

    const [mostrarFormularioGestor, setMostrarFormularioGestor] = useState(false);
    const [formGestor, setFormGestor] = useState({nombre: "", email: "", rol_id: 2});

    const handlerAceptar = async () => {
        try {
            const {response, data} = await aceptarSolicitud(id);

            if (!response.ok) {
                toast.error(data.mensaje);
                return;
            }
            toast.success(data.mensaje);

            setFormGestor({
                nombre: solicitud.nombre,
                email: solicitud.email,
                rol_id: 2
            });

            // Primero aceptamos al solicitud y luego mostramos el formulario para los datos del gestor nuevo
            setMostrarFormularioGestor(true);
            
        } catch (error) {
            console.error(error);
        }  
    };

    const handleRechazar = async () => {
        try {
            const {response, data} = await rechazarSolicitud(id);

            if (!response.ok) {
                toast.error(data.mensaje);
                return;
            }
            toast.success(data.mensaje);

            navigate("/home-gestor");
            
        } catch (error) {
            console.error(error);
        }
    };

    const handleCrearGestor = async (formGestor) => {
        try {
            const {response, data} = await crearGestor(formGestor);

            if (!response.ok) {
                toast.error(data.mensaje);
                return;
            }
            toast.success(data.mensaje);
            navigate("/home-gestor");
        } catch (error) {
            console.error(error);
        }  
    };
    const resetForm = () => {
        setFormGestor(prev => ({
            ...prev,
            nombre: "",
            email: "",
            rol_id: 2
        }));
    };

    useEffect(() => {
        const cargarSolicitud = async () => {
            try {
                const {response, data} = await getSolicitud(id);

                if (!response.ok) {
                    toast.error(data.mensaje);
                    return;
                }

                toast.success(data.mensaje);
                setSolicitud(data.datos_solicitud);
            } catch (error) {
                console.error(error);
                
            }
        };
        cargarSolicitud();
    }, [id]);

    if (!solicitud) {
        return <h2>Cargando...</h2>
    }


    return(
        <div
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "30px"
            }}
        >
            <h1
                style={{
                    textAlign: "center",
                    marginBottom: "30px"
                }}
            >
                Información de la solicitud
            </h1>
            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "20px"
                }}
            >
                <input
                    value={solicitud.email}
                    readOnly
                    style={{
                        flex: 1,
                        padding: "10px",
                        fontSize: "16px"
                    }}
                />
                <input
                    value={solicitud.nombre}
                    readOnly
                    style={{
                        flex: 1,
                        padding: "10px",
                        fontSize: "16px"
                    }}
                />
                <input
                    value={solicitud.dni}
                    readOnly
                    style={{
                        flex: 1,
                        padding: "10px",
                        fontSize: "16px"
                    }}
                />
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                    marginBottom: "25px"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "20px",
                        marginBottom: "30px"
                    }}
                >
                    {solicitud.imagenes.map((img, indice) => (
                        <img
                            key={img.id_imagen}
                            src={`http://localhost:3000/uploads/${img.ruta.split("/").pop()}`}
                            alt={`Imagen ${indice + 1}`}
                            style={{
                                width: "220px",
                                height: "220px",
                                objectFit: indice === 2 ? "cover" : "contain",
                                borderRadius: indice === 2 ? "50%" : "10px",
                                border: "2px solid #ddd",
                                background: "#fafafa"
                            }}
                        />
                    ))}
                </div>
            </div>
            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "20px"
                }}
            >
                <textarea
                    value={solicitud.motivo_solicitud}
                    readOnly
                    style={{
                        flex: 2,
                        minHeight: "200px",
                        padding: "10px",
                        fontSize: "16px"
                    }}
                />
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                    }}
                >
                    <input
                        value={solicitud.direccion}
                        readOnly
                        style={{
                            fontSize: "16px"
                        }}
                    />
                    <input
                        value={solicitud.cp}
                        readOnly
                        style={{
                            fontSize: "16px"
                        }}
                    />
                    <input
                        value={solicitud.localidad}
                        readOnly
                        style={{
                            fontSize: "16px"
                        }}
                    />
                    <input
                        value={solicitud.provincia}
                        readOnly
                        style={{
                            fontSize: "16px"
                        }}
                    />
                </div>
            </div>
            {mostrarFormularioGestor && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            padding: "20px",
                            borderRadius: "10px",
                            width: "400px"
                        }}
                    >
                        <h2>Crear gestor</h2>
                        <input
                            placeholder="Nombre"
                            value={formGestor.nombre}
                            onChange={(e) => setFormGestor({
                                ...formGestor,
                                nombre: e.target.value
                            })}
                            style={{
                                width: "90%",
                                marginBottom: "10px",
                                fontSize: "16px"
                            }}
                        />
                        <input
                            placeholder="Email"
                            value={formGestor.email}
                            onChange={(e) => setFormGestor({
                                ...formGestor,
                                email: e.target.value
                            })}
                            style={{
                                width: "90%",
                                marginBottom: "10px",
                                fontSize: "16px"
                            }}
                        />
                        <select
                            value={formGestor.rol_id}
                            onChange={(e) => setFormGestor({
                                ...formGestor,
                                rol_id: Number(e.target.value)
                            })}
                            style={{
                                width: "95%",
                                marginBottom: "10px",
                                fontSize: "16px"
                            }}
                        >
                            <option value={1}>Gestor</option>
                            <option value={2}>Gestor avanzado</option>
                        </select>
                        
                        <div
                            style={{
                                display: "flex",
                                gap: "15px",
                                marginTop: "15px",
                                justifyContent: "flex-start"
                            }}
                        >
                            <button
                                onClick={() => handleCrearGestor(formGestor)}
                                style={{
                                    padding: "10px 20px",
                                    background: "green",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "16px"
                                }}
                            >
                                Crear gestor
                            </button>
                            <button
                                onClick={() => {
                                    setMostrarFormularioGestor(false);
                                    resetForm();
                                }}
                                style={{
                                    padding: "10px 20px",
                                    background: "red",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "16px"
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                    marginTop: "30px"
                }}
            >
                <button
                    onClick={handlerAceptar}
                    style={{
                        padding: "10px 20px",
                        background: "green",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "16px"
                    }}
                >
                    Aceptar solicitud
                </button>
                <button
                    onClick={handleRechazar}
                    style={{
                        padding: "10px 20px",
                        background: "red",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "16px"
                    }}
                >
                    Rechazar solicitud
                </button>
            </div>
        </div>
    );
}

export default InfoSolicitudGestor;