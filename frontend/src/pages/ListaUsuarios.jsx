import { useState, useRef, useEffect } from "react";
import { buscarUsuarios, bloquearUsuario, desbloquearUsuario } from "../services/usuariosService";
import { toast } from "react-toastify";

function ListaUsuarios() {
    const [textoBusqueda, setTextoBusqueda] = useState("");

    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);

    const timeoutRef = useRef(null);
    const controllerRef = useRef(null);

    const cargarUsuarios = async (texto, signal = undefined) => {
        if (!texto) {
            setUsuarios([]);
            return;
        }

        const data = await buscarUsuarios(texto, signal);
        setUsuarios(data);
    };

    useEffect(() => {
        if (!textoBusqueda) {
            setUsuarios([]);
            return;
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
            setLoading(true);
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
            const controller = new AbortController();
            controllerRef.current = controller;

            try {
                await cargarUsuarios(textoBusqueda, controller.signal);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }, 300);
    }, [textoBusqueda]);

    const bloquear = async (usuario) => {
        const motivo = prompt("Introduce el motivo del bloqueo:");

        if (motivo === null || motivo.trim() === "") {
            return;
        }

        try {
            await bloquearUsuario(usuario.id_usuario, motivo);
            toast.success("Usuario bloqueado correctamente");
            
            setTextoBusqueda("");
            setUsuarios([]);

        } catch (error) {
            alert(error.message);
        }
    };

    const desbloquear = async (usuario) => {
        try {
            await desbloquearUsuario(usuario.id_usuario);
            toast.success("Usuario desbloqueado correctamente");
            
            setTextoBusqueda("");
            setUsuarios([]);

        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div
            style={{
                padding: "90px 20px 20px 20px",
                maxWidth: "900px",
                margin: "0 auto"
            }}
        >
            <h2>Bloquear y desbloquear usuarios</h2>

            <p>
                Busca un usuario por su alias o por su nombre.
            </p>

            <input
                type="text"
                placeholder="Buscar usuario..."
                value={textoBusqueda}
                onChange={(e) => setTextoBusqueda(e.target.value)}
                style={{
                    width: "100%",
                    padding: "14px 18px",
                    marginTop: "20px",
                    marginBottom: "25px",
                    fontSize: "16px",
                    borderRadius: "12px",
                    border: "1px solid #d0d0d0",
                    outline: "none",
                    boxSizing: "border-box"
                }}
            />

            <>
                {loading && <p>Cargando...</p>}

                {!loading && usuarios.length === 0 && textoBusqueda && (
                    <p>No hay resultados.</p>
                )}

                {usuarios.map(usuario => (
                    <div
                        key={usuario.id_usuario}
                        style={{
                            background: "white",
                            borderRadius: "14px",
                            padding: "18px",
                            marginBottom: "18px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                        }}
                    >
                        <h4>{usuario.alias}</h4>

                        <p>{usuario.nombre}</p>

                        <div
                            style={{
                                display: "inline-block",
                                padding: "6px 12px",
                                borderRadius: "20px",
                                background: usuario.esta_bloqueado ? "#ffebeb" : "#eaf8ea",
                                color: usuario.esta_bloqueado ? "#c62828" : "#2e7d32",
                                fontWeight: "bold",
                                marginBottom: "12px"
                            }}
                        >
                            {usuario.esta_bloqueado ? "Bloqueado" : "Activo"}
                        </div>

                        {usuario.esta_bloqueado && (
                            <>
                                <p>
                                    <b>Motivo:</b> {usuario.motivo_bloqueo}
                                </p>

                                <p>
                                    <b>Fecha:</b> {usuario.fecha_bloqueo}
                                </p>

                                <p>
                                    <b>Gestor:</b> {usuario.gestor}
                                </p>
                            </>
                        )}
                        <div style={{ marginTop: "15px" }}>
                            {usuario.esta_bloqueado ? (
                                <button
                                    onClick={() => desbloquear(usuario)}
                                    style={{
                                        padding: "10px 18px",
                                        background: "#2e7d32",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        fontSize: "16px"
                                    }}
                                >
                                    Desbloquear
                                </button>
                            ) : (
                                <button
                                    onClick={() => bloquear(usuario)}
                                    style={{
                                        padding: "10px 18px",
                                        background: "#d32f2f",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                        fontSize: "16px"
                                    }}
                                >
                                    Bloquear
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </>
        </div>
    );
}

export default ListaUsuarios;