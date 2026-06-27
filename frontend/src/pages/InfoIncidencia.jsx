import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIncidenciaId, patchEditarIncidencia, eliminarIncidencia } from "../services/incidenciasService";
import { votarIncidencia } from "../services/votosService";
import { sacarUsuariodelToken, sacarRoldelToken } from "../services/despiezarTokenService";
import { toast } from "react-toastify";
import { crearComentario, eliminarComentario } from "../services/comentariosService";
import { getCategorias, crearCategoria } from "../services/categoriasService";
import { eliminarImagen } from "../services/imagenesService";

function InfoIncidencia() {

    // Rutas para funciones:
    // - Actualizar incidencia
    // - Eliminar comentario
    // - Eliminar imagen
    // - Cambiar estado
    // - Cambiar categoría

    const { id } = useParams();

    const [incidenciaOriginal, setIncidenciaOriginal] = useState(null);
    const [incidenciaNueva, setIncidenciaNueva] = useState(null);

    const [votosUsuario, setVotosUsuario] = useState([]);
    const id_usuario = sacarUsuariodelToken();

    const [imagenComentario, setImagenComentario] = useState(null);
    const [imagenFile, setImagenFile] = useState(null);
    const [textoComentario, setTextoComentario] = useState("");
    const [esAnonimo, setEsAnonimo] = useState(false);

    const rol_id = Number(sacarRoldelToken());
    const esGestor = rol_id == 2 || rol_id === 1;

    const [categorias, setCategorias] = useState([]);
    const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
    const [nuevaCategoria, setNuevaCategoria] = useState("");

    const navigate = useNavigate();

    const actualizarVoto = (id_incidencia) => {
        setIncidenciaNueva(prev => prev.map(inc => inc.id_incidencia === id_incidencia ? {...inc, num_votos: Number(inc.num_votos) + 1} : inc));
    };

    const handleVotar = async () => {
        try {
            const {response, data} = await votarIncidencia(id_usuario, incidenciaNueva.id_incidencia);

            if (response.status === 409) {
                toast.info("Ya has votado esta incidencia");
                setVotosUsuario(prev => [...prev, incidenciaNueva.id_incidencia]);
                return;
            }

            if (!response.ok) {
                toast.error(data?.mensaje);
                return;
            }
            toast.success("Voto registrado");
            setVotosUsuario(prev => [...prev, incidenciaNueva.id_incidencia]);
            setIncidenciaNueva(prev => ({
                ...prev,
                num_votos: Number(prev.num_votos) + 1
            }));

        } catch (error) {
            console.error(error);
        }
    };

    const handleCrearComentario = async () => {
        try {
            const {response, data} = await crearComentario(textoComentario, incidenciaNueva.id_incidencia, esAnonimo, imagenFile);

            if (!response.ok) {
                toast.error(data.mensaje);
                return;
            }

            toast.success(data.mensaje);

            // Recargamos la incidencia
            const incidenciaActualizada = await getIncidenciaId(incidenciaNueva.id_incidencia);
            setIncidenciaOriginal(incidenciaActualizada.data);

            // Limpiamos el formulario
            setTextoComentario("");
            setEsAnonimo(false);
            setImagenComentario(null);
            setImagenFile(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleGuardarCambios = async () => {
      try {
        //const categoriaData = await crearCategoria(incidenciaNueva.categoria_nombre)
        const {response, data} = await patchEditarIncidencia(incidenciaOriginal.id_incidencia, incidenciaNueva);

        if (!response.ok) {
            toast.error(data.mensaje);
            return;
        }

        toast.success(data.mensaje);
        //toast.success(categoriaData.mensaje);

        const incidenciaActualizada = await getIncidenciaId(incidenciaOriginal.id_incidencia);

        setIncidenciaOriginal(incidenciaActualizada.data);
        setIncidenciaNueva(null);
      } catch (error) {
        console.error(error);
      }  
    };

    const handleDescartarCambios = () => {
        setIncidenciaNueva(null);
    };

    const handleCambiarCategoria = (e) => {
        const nuevaCategoria = e.target.value;

        if (nuevaCategoria === "__new__") {
            //Se abre ventana para crear nueva categoría
            setMostrarModalCategoria(true);
            return;
        }

        setIncidenciaNueva(prev => ({
            ...prev,
            categoria: nuevaCategoria
        }))
    };

    const handleCrearCategoria = async () => {
        try {
            const nueva = await crearCategoria(nuevaCategoria);

            setCategorias(prev => [
                ...prev,
                nueva
            ]);

            setIncidenciaNueva(prev => ({
                ...prev,
                categoria: nueva.nombre
            }));

            setNuevaCategoria("");
            setMostrarModalCategoria(false);
        } catch (error) {
            console.error(error);
        }
    };
    const handleEliminarImagen = async (idImagen) => {
        const confirmar = window.confirm("¿Seguro que quieres eliminar esta imagen?");

        if (!confirmar) {
            return;
        }

        try {
            const {response, data} = await eliminarImagen(idImagen);

            if (!response.ok) {
                toast.error(data.mensaje);
                return;
            }

            toast.success(data.mensaje);

            // Recargamos la incidencia
            const actualizada = await getIncidenciaId(incidenciaOriginal.id_incidencia);

            setIncidenciaOriginal(actualizada.data);
            setIncidenciaNueva(null);
        } catch (error) {
            console.error(error);
        }  
    };

    const handlerEliminarComentario = async (idComentario) => {
        const confirmar = window.confirm("¿Seguro que quieres eliminar este comentario?");

        if (!confirmar) {
            return;
        }

        try {
            const {response, data} = await eliminarComentario(idComentario);

            if (!response.ok) {
                toast.error(data.mensaje);
                return;
            }

            toast.success(data.mensaje);

            // Recargamos la incidencia
            const actualizada = await getIncidenciaId(incidenciaOriginal.id_incidencia);

            setIncidenciaOriginal(actualizada.data);
            setIncidenciaNueva(null);
        } catch (error) {
            console.error(error);
        }  
    };

    const handleEliminarIncidencia = async (idIncidencia) => {
        const confirmar = window.confirm("¿Seguro que quieres eliminar esta incidencia?");

        if (!confirmar) {
            return;
        }

        try {
            const {response, data} = await eliminarIncidencia(idIncidencia);

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

    useEffect(() => {
        const cargarIncidencia = async () => {
            try {
                const {data} = await getIncidenciaId(id);
                setIncidenciaOriginal(data);
                setIncidenciaNueva(null);

                const categoriasData = await getCategorias();
                console.log("categoriasdata:",categoriasData.data);
                setCategorias(categoriasData);
                
            } catch (error) {
                console.error("ERROR:", error);
            }
        };
        cargarIncidencia();
    }, [id]);

    if (!incidenciaOriginal) {
        return <h1>No se encontró la incidencia</h1>
    }

    const get = (campo) => {
        if (incidenciaNueva?.[campo] !== undefined) {
            return incidenciaNueva[campo];
        }
        return incidenciaOriginal?.[campo];
    };

    console.log(incidenciaOriginal);
    
    return (
        <div
            style={{
                display: "flex",
                padding: "40px",
                gap: "20px",
                alignItems: "flex-start",
                flexWrap: "nowrap"
            }}
        >
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    minWidth: "0"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                     
                    {esGestor ? (
                        <input
                            value={get("titulo")}
                            onChange={(e) => 
                                setIncidenciaNueva(prev => ({
                                    ...prev,
                                    titulo: e.target.value
                                }))
                            }
                            style={{
                                fontSize: "32px",
                                fontWeight: "bold",
                                borderBottom: "2px solid orange",
                                border: "none",
                                outline: "none",
                                width: "100%",
                                background: "transparent"
                            }}
                        />
                    ) : (
                        <h1>
                            {get("titulo")}
                        </h1>
                    )}
                    
                    {esGestor ? (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px"
                            }}
                        >
                            <b>Categoría:</b>
                            <select
                                value={get("categoria_nombre")}
                                onChange={handleCambiarCategoria}  
                                style={{
                                    fontSize: "16px"
                                }}  
                            >
                                {categorias.map(c => (
                                    <option
                                        key={c.id_categoria}
                                        value={c.nombre}
                                    >
                                        {c.nombre}
                                    </option>
                                ))}
                                <option
                                    value="__new__"
                                >
                                    + Nueva categoría
                                </option>
                            </select>
                        </div>
                    ) : (
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
                            <b>Categoría:</b> {get("categoria_nombre")}
                        </span>
                    )}
                    
                    {esGestor && mostrarModalCategoria && (
                        <div
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: "rgba(0, 0, 0, 0.05)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 9999
                            }}
                        >
                            <div
                                style={{
                                    background: "white",
                                    padding: "20px",
                                    borderRadius: "12px",
                                    width: "300px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px"
                                }}
                            >
                                <h3>Nueva categoría</h3>
                                <input
                                    type="text"
                                    value={nuevaCategoria}
                                    onChange={(e) => setNuevaCategoria(e.target.value)}
                                    placeholder="Nombre de la categoría"
                                />
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <button
                                        onClick={() => setMostrarModalCategoria(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleCambiarCategoria}
                                    >
                                        Crear
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap"
                    }}
                >
                    {get("imagenes")?.slice(0, 2).map(img => (
                        <div
                            key={img.id_imagen}
                            style={{
                                position: "relative",
                                display: "inline-block",
                                padding: "8px",
                                background: "#f5f5f5",
                                borderRadius: "10px"
                            }}
                        >
                            <div
                                style={{
                                    display: "inline-flex",
                                    flexDirection: "column",
                                    background: "#f5f5f5",
                                    borderRadius: "10px",
                                    padding: "8px",
                                    width: "fit-content"
                                }}
                            >
                                {esGestor && (
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            marginBottom: "6px"
                                        }}
                                    >
                                        <button
                                            onClick={() => handleEliminarImagen(img.id_imagen)}
                                            style={{
                                                background: "red",
                                                color: "white",
                                                borderRadius: "6px",
                                                border: "none",
                                                cursor: "pointer",
                                                padding: "4px 8px",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            X
                                        </button>
                                    </div>
                                )}
                            </div>
                            <img
                                key={img.id_imagen}
                                src={`http://localhost:3000/uploads/${img.ruta.split("/").pop()}`}
                                style={{
                                    width: "100%",
                                    maxWidth: "400px",
                                    height: "300px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd",
                                    display: "block"
                                }}
                            />
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "10px",
                        width: "70%",
                        minHeight: "100px",
                        fontSize: "18px",
                        background: "#fafafa"
                    }}
                >
                    {esGestor ? (
                        <textarea
                            value={get("descripcion")}
                            onChange={(e) => setIncidenciaNueva(prev => ({
                                ...prev,
                                descripcion: e.target.value
                            }))}
                            style={{
                                width: "97%",
                                minHeight: "120px",
                                fontSize: "18px"
                            }}
                        />
                    ) : (
                        <p>
                            <b>Descripción: </b>
                            {get("descripcion")}
                        </p>
                    )}
                    
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        maxWidth: "800px"
                    }}
                >
                    {esGestor ? (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px"
                            }}
                        >
                            <b>Estado:</b>
                            <select
                                value={get("estado_nombre")}
                                onChange={(e) => setIncidenciaNueva( prev => ({
                                    ...prev,
                                    estado: e.target.value
                                    }))
                                }
                                style={{
                                    fontSize: "16px"
                                }}
                            >
                                <option
                                    value="Nueva"
                                >
                                    Nueva
                                </option>
                                <option
                                    value="Validada"
                                >
                                    Validada
                                </option>
                                <option
                                    value="En proceso"
                                >
                                    En proceso
                                </option>
                                <option
                                    value="Resuelta"
                                >
                                    Resuelta
                                </option>
                            </select>
                        </div>
                    ) : (
                        <div
                            style={{
                                padding: "10px 15px",
                                border: "1px solid #ddd",
                                borderRadius: "8px"
                            }}
                        >
                            <b>Estado:</b> {get("estado_nombre")}
                        </div>
                    )}

                    {get("estado") === "Resuleta" && (
                        <div>
                            <label>
                                <b>Descripción de la resolución:</b>
                            </label>

                            <textarea
                                value={get("descripcion_resolucion") || ""}
                                onChange={(e) => setIncidenciaNueva(prev => ({
                                    ...prev,
                                    descripcion_resolucion: e.target.value
                                }))}
                                style={{
                                    width: "100%",
                                    minHeight: "100px"
                                }}
                            />
                        </div>
                    )}
                    

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}
                    >
                        <span>
                            <b>Votos:</b> {get("num_votos")}
                        </span>

                        <button
                            onClick={handleVotar}
                            disabled={votosUsuario.includes(incidenciaOriginal.id_incidencia)}
                            style={{
                                background: "orange",
                                padding: "8px 12px",
                                fontSize: "16px",
                                fontWeight: "bold"
                            }}
                        >
                            {votosUsuario.includes(incidenciaOriginal.id_incidencia) ? "Votado" : "Votar"}
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
                        <b>Dirección:</b> {get("direccion_texto")}
                    </p>
                    <div
                        style={{
                            margin: 0,
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px"
                        }}
                    >
                        <p
                            style={{ margin: 0 }}
                        >
                            <b>Fecha de creación:</b> {new Date(get("fecha_creacion")).toLocaleDateString()}
                        </p>
                        
                        {get("fecha_resolucion") ? (
                            <p
                                style={{ margin: 0 }}
                            >
                                <b>Fecha de resolución:</b> {new Date(get("fecha_resolucion")).toLocaleDateString()}
                            </p>
                        ) : get("fecha_actualizacion") ? (
                            <p
                                style={{margin:0}}
                            >
                                <b>Última actualización:</b> {new Date(get("fecha_actualizacion")).toLocaleDateString()}
                            </p>
                        ) : null}
                        
                    </div>
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
                        {!esGestor && (
                            <label>
                                <input
                                    type="checkbox"
                                    checked={esAnonimo}
                                    onChange={(e) => setEsAnonimo(e.target.checked)}
                                /> Anónimo
                            </label>
                        )}
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
                        {esGestor && (
                        <div
                            style={{
                                display: "flex",
                                gap: "12px"
                            }}
                        >
                            <button
                                onClick={handleGuardarCambios}
                                style={{
                                    background: "#28a745",
                                    color: "white",
                                    borderRadius: "8px",
                                    border: "none",
                                    padding: "10px 14px",
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    cursor: "pointer"
                                }}
                            >
                                Guardar cambios
                            </button>
                            <button
                                onClick={handleDescartarCambios}
                                style={{
                                    background: "#6c757d",
                                    color: "white",
                                    borderRadius: "8px",
                                    border: "none",
                                    padding: "10px 14px",
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    cursor: "pointer"
                                }}
                            >
                                Deshacer cambios
                            </button>
                            <button
                                onClick={() => handleEliminarIncidencia(incidenciaOriginal.id_incidencia)}
                                style={{
                                    background: "#dc3545",
                                    color: "white",
                                    borderRadius: "8px",
                                    border: "none",
                                    padding: "10px 14px",
                                    fontWeight: "bold",
                                    fontSize: "16px",
                                    cursor: "pointer"
                                }}
                            >
                                Eliminar incidencia
                            </button>
                        </div>
                    )}
                    </div>
                </div>
            </div>
            <div
                style={{
                    width: "380px",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    position: "static",
                    top: "20px",
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
                {get("comentarios")?.map(c => (
                    <div
                        key={c.id_comentario}
                        style={{
                            background: c.es_gestor ? "#fff3e0" : "white",
                            borderLeft: c.es_gestor ? "4px solid orange" : "4px solid #ddd",
                            padding: "10px",
                            borderRadius: "8px",
                            marginBottom: "10px",
                            position: "relative"
                        }}
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
                        {esGestor && (
                            <button
                                onClick={() => handlerEliminarComentario(c.id_comentario)}
                                style={{
                                    position: "absolute",
                                    top: "8px",
                                    right: "8px",
                                    background: "red",
                                    color: "white",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer"
                                }}
                            >
                                X
                            </button>
                        )}
                        <hr
                            style={{
                                border: "none",
                                borderTop: c.es_gestor ? "1px solid orange" : "1px solid #eee",
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