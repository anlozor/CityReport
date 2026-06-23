import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getIncidenciaId } from "../services/incidenciasService";
import { votarIncidencia } from "../services/votosService";
import { sacarUsuariodelToken } from "../services/despiezarTokenService";
import { toast } from "react-toastify";
import { crearComentario } from "../services/comentariosService";

function InfoIncidencia() {

    const { id } = useParams();

    const [incidencia, setIncidencia] = useState(null);

    const [votosUsuario, setVotosUsuario] = useState([]);
    const id_usuario = sacarUsuariodelToken();

    const [imagenComentario, setImagenComentario] = useState(null);
    const [imagenFile, setImagenFile] = useState(null);
    const [textoComentario, setTextoComentario] = useState("");
    const [esAnonimo, setEsAnonimo] = useState(false);

    const actualizarVoto = (id_incidencia) => {
        setIncidencia(prev => prev.map(inc => inc.id_incidencia === id_incidencia ? {...inc, num_votos: Number(inc.num_votos) + 1} : inc));
    };

    const handleVotar = async () => {
        try {
            const {response, data} = await votarIncidencia(id_usuario, incidencia.id_incidencia);

            if (response.status === 409) {
                toast.info("Ya has votado esta incidencia");
                setVotosUsuario(prev => [...prev, incidencia.id_incidencia]);
                return;
            }

            if (!response.ok) {
                toast.error(data?.mensaje);
                return;
            }
            toast.success("Voto registrado");
            setVotosUsuario(prev => [...prev, incidencia.id_incidencia]);
            setIncidencia(prev => ({
                ...prev,
                num_votos: Number(prev.num_votos) + 1
            }));

        } catch (error) {
            console.error(error);
        }
    };

    const handleCrearComentario = async () => {
        try {
            const {response, data} = await crearComentario(textoComentario, incidencia.id_incidencia, esAnonimo, imagenFile);

            if (!response.ok) {
                toast.error(data.mensaje);
                return;
            }

            toast.success(data.mensaje);

            // Recargamos la incidencia
            const incidenciaActualizada = await getIncidenciaId(incidencia.id_incidencia);
            setIncidencia(incidenciaActualizada.data);

            // Limpiamos el formulario
            setTextoComentario("");
            setEsAnonimo(false);
            setImagenComentario(null);
            setImagenFile(null);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const cargarIncidencia = async () => {
            try {
                const {data} = await getIncidenciaId(id);
                setIncidencia(data);
            } catch (error) {
                console.error("ERROR:", error);
            }
        };
        cargarIncidencia();
    }, [id]);

    if (!incidencia) {
        return <h1>No se encontró la incidencia</h1>
    }
    
    return (
        <div
            style={{
                display: "flex",
                padding: "20px",
                gap: "12px"
            }}
        >
            <div
                style={{
                    flex: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <h1
                        style={{
                            margin: 0,
                            paddingLeft: "60px"
                        }}
                    >
                        {incidencia.titulo}
                    </h1>
                    <span
                        style={{
                            background: "#f2f2f2",
                            padding: "10px 18px",
                            borderRadius: "10px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            border: "1px solid #ddd",
                            whiteSpace: "nowrap"
                        }}
                    >
                        <b>Categoría:</b> {incidencia.categoria_nombre}
                    </span>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap"
                    }}
                >
                    {incidencia.imagenes?.slice(0, 2).map(img => (
                        <img
                            key={img.id_imagen}
                            src={`http://localhost:3000/uploads/${img.ruta.split("/").pop()}`}
                            style={{
                                width: "100%",
                                maxWidth: "400px",
                                height: "300px",
                                objectFit: "cover",
                                borderRadius: "8px",
                                border: "1px solid #ddd"
                            }}
                        />
                    ))}
                </div>
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "10px",
                        maxWidth: "750px",
                        background: "#fafafa"
                    }}
                >
                    <p><b>Descripción:</b> {incidencia.descripcion}</p>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        maxWidth: "800px"
                    }}
                >
                    <div
                        style={{
                            padding: "10px 15px",
                            border: "1px solid #ddd",
                            borderRadius: "8px"
                        }}
                    >
                        <b>Estado:</b> {incidencia.estado_nombre}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}
                    >
                        <span>
                            <b>Votos:</b> {incidencia.num_votos}
                        </span>

                        <button
                            onClick={handleVotar}
                            disabled={votosUsuario.includes(incidencia.id_incidencia)}
                            style={{
                                background: "orange",
                                padding: "8px 12px",
                                fontSize: "16px"
                            }}
                        >
                            {votosUsuario.includes(incidencia.id_incidencia) ? "Votado" : "Votar"}
                        </button>
                    </div>
                </div>
                
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        maxWidth: "800px"
                    }}
                >
                    <p
                    style={{
                        margin: 0
                    }}
                    >
                        <b>Dirección:</b> {incidencia.direccion_texto}
                    </p>
                    <p
                        style={{
                            margin: 0
                        }}
                    >
                        <b>Fecha:</b> {new Date(incidencia.fecha_creacion).toLocaleDateString()}
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            width: "100%"
                        }}
                    >
                        <textarea
                            placeholder="Escribe un comentario..."
                            value={textoComentario}
                            onChange={(e) => setTextoComentario(e.target.value)}
                            style={{
                                width: "100%",
                                maxWidth: "500px",
                                height: "90px",
                                fontSize: "16px",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #ddd",
                                resize: "none",
                                boxSizing: "border-box"
                            }}
                        />
                        <label>
                            <input
                                type="checkbox"
                                checked={esAnonimo}
                                onChange={(e) => setEsAnonimo(e.target.checked)}
                            />Anónimo
                        </label>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center"
                        }}
                    >
                        <label
                            style={{
                                width: "200px",
                                height: "200px",
                                borderRadius: "10px",
                                border: "2px dashed #bbb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                overflow: "hidden",
                                position: "relative",
                                flexShrink: 0
                            }}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                style={{
                                    display: "none"
                                }}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setImagenFile(file); // Para el backend
                                        setImagenComentario(URL.createObjectURL(file)); // Para el preview
                                    }
                                }}
                            />
                            {imagenComentario ? (
                                <img
                                    src={imagenComentario}
                                    alt="preview"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover"
                                    }}
                                />
                            ) : (
                                <span
                                    style={{
                                        fontSize: "12px",
                                        textAlign: "center"
                                    }}
                                >
                                    + Imagen
                                </span>
                            )}
                        </label>
                        <button
                            onClick={handleCrearComentario}
                            disabled={!textoComentario.trim()}
                            style={{padding: "10px 15px", background: "orange"}}
                        >
                            <b>Publicar comentario</b>
                        </button>
                    </div>
                </div>
            </div>
            <div
                style={{
                    width: "450px",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "15px"
                }}
            >
                <h3
                    style={{
                        marginLeft: "100px"
                    }}
                >
                    Comentarios:
                </h3>
                {incidencia.comentarios?.map(c => (
                    <div
                        key={c.id_comentario}
                    >
                        <b>{c.autor}</b>
                        <p>{c.texto}</p>
                        {c.imagenesComentarios?.map(img => (
                            <img
                                key={img.id_imagen}
                                src={`http://localhost:3000/uploads/${img.ruta.split("/").pop()}`}
                                style={{
                                    width: "100%",
                                    maxWidth: "320px",
                                    marginTop: "10px",
                                    borderRadius: "10px",
                                    objectFit: "cover",
                                    border: "1px solid #ddd"
                                }}
                            />
                        ))}
                        <hr
                            style={{
                                border: "none",
                                borderTop: "1px solid #eee",
                                margin: "10px 0"
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

}

export default InfoIncidencia;