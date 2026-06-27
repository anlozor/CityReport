import { useState, useEffect } from "react";
import { sacarRoldelToken } from "../services/despiezarTokenService";
import { getIncidencias } from "../services/incidenciasService";
import { getComentarios } from "../services/comentariosService";
import { getImagenes } from "../services/imagenesService";
import { getSolicitudes } from "../services/solicitudGestorService";
import { useNavigate } from 'react-router-dom';


function HomeGestor() {
    const [incidencias, setIncidencias] = useState([]);
    const [comentarios, setComentarios] = useState([]);
    const [imagenes, setImagenes] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);

    const rold_id = Number(sacarRoldelToken());

    const navigate = useNavigate();

    useEffect(() => {
        const cargar = async () => {
            const incidenciasData = await getIncidencias();
            const comentariosData = await getComentarios();
            const imagenesData = await getImagenes();
            const solicitudesData = await getSolicitudes();

            setIncidencias(incidenciasData);
            setComentarios(comentariosData);
            setImagenes(imagenesData);
            setSolicitudes(solicitudesData);
        };
        cargar();
    }, []);

    const filtrarUltimas72h = (lista, campoFecha) => {
        const limite = Date.now() - 500 * 60 * 60 * 1000;

        return lista.filter(item => {
            return new Date(item[campoFecha]).getTime() >= limite;
        });
    };

    const incidenciasNuevas = filtrarUltimas72h(incidencias, "fecha_creacion");
    const comentariosNuevos = filtrarUltimas72h(comentarios, "fecha_creacion");
    const imagenesNuevas = filtrarUltimas72h(imagenes, "fecha_subida");
    const solicitudesNuevas = filtrarUltimas72h(solicitudes, "fecha_solicitud");

    const [abierto, setAbierto] = useState({
        incidencias: false,
        comentarios: false,
        imagenes: false,
        solicitudes: false
    });

    const toggle = (seccion) => {
        setAbierto(prev => ({
            ...prev,
            [seccion]: !prev[seccion]
        }));
    };

    const hayNovedades = incidenciasNuevas.length > 0 || comentariosNuevos.length > 0 || imagenesNuevas.length > 0 || (rold_id === 1 && solicitudesNuevas.length > 0);
    const totalNovedades = incidenciasNuevas.length + comentariosNuevos.length + imagenesNuevas.length + solicitudesNuevas.length;

    const abrirImagen = (img) => {
        if (img.incidencia_id) {
            navigate(`/gestion/incidencias/${img.incidencia_id}`);
            return;
        }

        if (img.incidencia_comentario) {
            navigate(`/gestion/incidencias/${img.incidencia_comentario}`);
        }
    };

    return (
        <div
            style={{
                padding: "30px",
                maxWidth: "1000px",
                margin: "0 auto"
            }}
        >
            <div
                style={{
                    marginBottom: "30px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <div>
                    <h1 style={{marginBottom: "5px"}}>
                        Centro de notificaciones
                        <span
                            style={{
                                marginLeft: "10px",
                                background: "orange",
                                color: "white",
                                borderRadius: "20px",
                                padding: "2px 10px",
                                fontSize: "30px"
                            }}
                        >
                            {totalNovedades}
                        </span>
                    </h1>
                    <br />
                    <p
                        style={{
                            color: "#666",
                            fontSize: "25px",
                            margin: 0
                        }}
                    >
                        Actividad de las últimas 72 horas
                    </p>
                </div>
                <button
                    onClick={() => {
                        if (rold_id === 2) {
                            navigate("/mapa");
                        } else if (rold_id === 1) {
                            navigate("/home-gestor-avanzado");
                        }
                    }}
                    style={{
                        background: "orange",
                        border: "none",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "14px"
                    }}
                >
                    {rold_id === 2 ? "Ir al mapa" : "Panel avanzado"}
                </button>
            </div>

            

            {incidenciasNuevas.length > 0 && (
                <section
                    style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "20px",
                        marginBottom: "20px",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                        borderTop: "4px solid #ff0000"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <h2 style={{margin: 0}}>
                            Nuevas incidencias ({incidenciasNuevas.length})   
                        </h2>
                        <button
                                onClick={() => toggle("incidencias")}
                                style={{
                                    border: "none",
                                    borderBlockStart: "50%",
                                    width: "35px",
                                    height: "35px",
                                    cursor: "pointer",
                                    background: "orange",
                                    fontSize: "20px",
                                    fontWeight: "bold"
                                }}
                            >
                                {abierto.incidencias ? "-" : "+"}
                            </button>
                    </div>
                    {abierto.incidencias &&
                        incidenciasNuevas.map((i) => (
                            <div
                                key={i.id_incidencia}
                                onClick={() => navigate(`/gestion/incidencias/${i.id_incidencia}`)}
                                style={{
                                    cursor: "pointer",
                                    padding: "10px",
                                    gap: "10px",
                                    borderBottom: "1px solid #ddd"
                                }}
                            >
                                <strong>{i.titulo}</strong>
                                <br />
                                Autor: {i.nombre}
                                <br />
                                Fecha: {new Date(i.fecha_creacion).toLocaleDateString()}
                            </div>
                        ))
                    }
                </section>
            )}

            {comentariosNuevos.length > 0 && (
                <section
                    style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "20px",
                        marginBottom: "20px",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                        borderTop: "4px solid #3b82f6"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <h2 style={{margin: 0}}>
                            Nuevos comentarios ({comentariosNuevos.length})
                        </h2>
                        <button
                                onClick={() => toggle("comentarios")}
                                style={{
                                    border: "none",
                                    borderBlockStart: "50%",
                                    width: "35px",
                                    height: "35px",
                                    cursor: "pointer",
                                    background: "orange",
                                    fontSize: "20px",
                                    fontWeight: "bold"
                                }}
                            >
                                {abierto.comentarios ? "-" : "+"}
                            </button>
                    </div>
                    {abierto.comentarios &&
                        comentariosNuevos.map((c) => (
                            <div
                                key={c.id_comentario}
                                onClick={() => navigate(`/gestion/incidencias/${c.incidencia_id}`)}
                                style={{
                                    cursor: "pointer",
                                    padding: "10px",
                                    gap: "10px",
                                    borderBottom: "1px solid #ddd"
                                }}
                            >
                                <strong>{c.nombre}</strong>
                                <br />
                                Fecha: {new Date(c.fecha_creacion).toLocaleDateString()}
                                <br />
                                {c.texto}
                            </div>
                        ))
                    }
                </section>
            )}            

            {imagenesNuevas.length > 0 && (
                <section
                    style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "20px",
                        marginBottom: "20px",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                        borderTop: "4px solid #8b5cf6"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <h2 style={{margin: 0}}>
                            Nuevas imágenes ({imagenesNuevas.length}){" "}
                        </h2>
                        <button
                                onClick={() => toggle("imagenes")}
                                style={{
                                    border: "none",
                                    borderBlockStart: "50%",
                                    width: "35px",
                                    height: "35px",
                                    cursor: "pointer",
                                    background: "orange",
                                    fontSize: "20px",
                                    fontWeight: "bold"
                                }}
                            >
                                {abierto.imagenes ? "-" : "+"}
                            </button>
                    </div>
                    {abierto.imagenes &&
                        imagenesNuevas.map((img) => (
                            <div
                                key={img.id_imagen}
                                onClick={() => abrirImagen(img)}
                                style={{
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    gap: "10px",
                                    padding: "10px",
                                    borderBottom: "1px solid #ddd"
                                }}
                            >
                                <div style={{padding: "10px"}}>
                                    <strong>{img.nombre}</strong>
                                    <br />
                                    <small>Fecha: {new Date(img.fecha_subida).toLocaleDateString()}</small>
                                </div>
                                <img
                                    src={`http://localhost:3000/uploads/${img.ruta}`}
                                    alt="preview"
                                    style={{
                                        width: "100%",
                                        height: "50%",
                                        objectFit: "cover"
                                    }}
                                />
                            </div>
                        ))
                    }
                </section>
            )}

            {rold_id === 1 && solicitudesNuevas.length > 0 && (
                <section
                    style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "20px",
                        marginBottom: "20px",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                        borderTop: "4px solid #22c55e"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        <h2 style={{margin: 0}}>
                            Nuevas solicitudes ({solicitudesNuevas.length}){" "}
                        </h2>
                        <button
                                onClick={() => toggle("solicitudes")}
                                style={{
                                    border: "none",
                                    borderBlockStart: "50%",
                                    width: "35px",
                                    height: "35px",
                                    cursor: "pointer",
                                    background: "orange",
                                    fontSize: "20px",
                                    fontWeight: "bold"
                                }}
                            >
                                {abierto.solicitudes ? "-" : "+"}
                            </button>
                    </div>
                    {abierto.solicitudes &&
                        solicitudesNuevas.map((s) => (
                            <div
                                key={s.id_solicitud}
                                onClick={() => navigate(`/gestion/solicitud/${s.id_solicitud}`)}
                                style={{
                                    cursor: "pointer",
                                    padding: "10px",
                                    gap: "10px",
                                    borderBottom: "1px solid #ddd"
                                }}
                            >
                                <strong>{s.nombre}</strong>
                                <br />
                                Fecha: {new Date(s.fecha_solicitud).toLocaleDateString()}
                            </div>
                        ))
                    }
                </section>
            )}

            {!hayNovedades && (
                    <p>No hay novedades</p>
                )
            }
        </div>
    );
}

export default HomeGestor;