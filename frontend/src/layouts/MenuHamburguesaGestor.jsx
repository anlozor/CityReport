import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import BusquedaGestores from "../components/BusquedaGestores";
import { buscarGestores } from "../services/usuariosService";
import { sacarRoldelToken } from "../services/despiezarTokenService";

function MenuHamburguesaGestor() {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef(null);

    const esHome = location.pathname === "/home-gestor";
    const esMapa = location.pathname === "/mapa-gestor";
    const esPanelAvanzado = location.pathname === "/home-gestor-avanzado";

    const [buscarGestorAbierto, setBuscarGestorAbierto] = useState(false);
    const [gestores, setGestores] = useState([]);

    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [loading, setLoading] = useState(false);

    const timeoutRef = useRef(null);
    const controllerRef = useRef(null);

    const rol = sacarRoldelToken();

    const toggleMenu = () => {
        setMenuAbierto(prev => !prev);
    };

    const ir = (ruta) => {
        navigate(ruta);
        setMenuAbierto(false); // cerrar al navegar
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)){
                setMenuAbierto(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!buscarGestorAbierto) {
            return;
        }
        if (!textoBusqueda) {
            setGestores([]);
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
                const data = await buscarGestores(textoBusqueda, controller.signal);
                setGestores(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }, 300);
    }, [textoBusqueda, buscarGestorAbierto]);

    const menuItemStyle = {
        width: "100%",
        padding: "10px",
        border: "none",
        background: "white",
        textAlign: "left",
        cursor: "pointer"
    };

    return (
        <div
            style={{
                position: "relative",
                minHeight: "100vh"
            }}
        >
            <div
                ref={menuRef}
                className="menu-hamburguesa-gestor"
                style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    zIndex: 4000
                }}
            >
                <button
                    onClick={toggleMenu}
                    style={{
                        width: "45px",
                        height: "45px",
                        background: "white",
                        borderRadius: "10px",
                        border: "none",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                        cursor: "pointer",
                        fontSize: "24px",
                        fontWeight: "bold"
                    }}
                >
                    ☰
                </button>

                {menuAbierto && (
                    <div
                        style={{
                            position: "absolute",
                            top: "55px",
                            left: 0,
                            width: "180px",
                            background: "white",
                            borderRadius: "10px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            overflow: "hidden"
                        }}
                    >
                        {!esHome && (
                            <button
                                onClick={() => ir("/home-gestor")}
                                style={menuItemStyle}
                            >
                                Notificaciones
                            </button>
                        )}
                        
                        {!esMapa && (
                            <button
                                onClick={() => ir("/mapa-gestor")}
                                style={menuItemStyle}
                            >
                                Ir al mapa
                            </button>
                        )}
                        
                        <button
                            onClick={() => ir("/mapa-gestor?modo=documento")}
                            style={menuItemStyle}
                        >
                            Generar documento
                        </button>

                        <button
                            onClick={() => setBuscarGestorAbierto(true)}
                            style={menuItemStyle}
                        >
                            Buscar gestor
                        </button>

                        {rol === 1 && (
                            <button
                                onClick={() => ir("/lista-usuarios")}
                                style={menuItemStyle}
                            >
                                Lista de usuarios
                            </button>
                        )}
                        {rol === 1 && !esPanelAvanzado && (
                            <button
                                onClick={() => ir("/home-gestor-avanzado")}
                                style={menuItemStyle}
                            >
                                Panel avanzado
                            </button>
                        )}

                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                ir("/");
                            }}
                            style={menuItemStyle}
                        >
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>
            <Outlet />
            <BusquedaGestores
                open={buscarGestorAbierto}
                onClose={() => setBuscarGestorAbierto(false)}
            >
                <h3>Buscar gestor</h3>

                <p>A continuación puedes escribir parte del identificador.</p>
                <p>Por ejemplo, si escribes 00, te mostrará todos los gestores que tengan como identificador "Gestor00XX", siendo X cualquier número</p>
                <input
                    placeholder="Escribe el identificador"
                    value={textoBusqueda}
                    onChange={(e) => setTextoBusqueda(e.target.value)}
                    style={{
                        width: "95%",
                        padding: "8px",
                        marginBottom: "10px"
                    }}
                />

                {loading && <p>Cargando...</p>}

                {!loading && gestores.length === 0 && textoBusqueda && (
                    <p>No hay resultados</p>
                )}

                {gestores.map(g => (
                        <div
                            key={g.identificador_gestor}
                            onClick={() => {
                                console.log("Seleccionado:", g);
                                setBuscarGestorAbierto(false);
                                setTextoBusqueda("");
                            }}
                            style={{
                                padding: "8px",
                                borderBottom: "1px solid #eee",
                                cursor: "pointer"
                            }}
                        >
                            <b>{g.identificador_gestor}</b>
                            <div>{g.nombre}</div>
                            <small>{g.email}</small>
                        </div>
                ))}
            </BusquedaGestores>
        </div>
    );
}

export default MenuHamburguesaGestor;