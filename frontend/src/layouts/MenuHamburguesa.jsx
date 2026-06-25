import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";

function MenuHamburguesa({children}) {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const navigate = useNavigate();

    const location = useLocation();
    const esMapa = location.pathname === "/mapa";
    const esLista = location.pathname === "/lista";
    const esPerfil = location.pathname === "/perfil";
    const esNuevaIncidencia = location.pathname === "/nueva-incidencia";
    const esSolicitudGestor = location.pathname === "/solicitar-gestor";
    const esEstadoSolicitud = location.pathname === "/estado-solicitud";

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
                className="menu-hamburguesa"
                style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    zIndex: 4000
                }}
            >
                <button
                    onClick={() => setMenuAbierto(prev => !prev)}
                    style={{
                        width: "45px",
                        height: "45px",
                        background: "white",
                        border: "none",
                        borderRadius: "10px",
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
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                            overflow: "hidden"
                        }}
                    >
                        {!esPerfil && (
                            <button
                                style={menuItemStyle}
                                onClick={() => navigate("/perfil")}
                            >
                                Mi perfil
                            </button>
                        )}

                        {!esMapa && (
                            <button
                                style={menuItemStyle}
                                onClick={() => navigate("/mapa")}
                            >
                                Ver mapa
                            </button>
                        )}
                        {!esNuevaIncidencia && (
                            <button
                                style={menuItemStyle}
                                onClick={() => navigate("/nueva-incidencia")}
                            >
                                Crear nueva incidencia
                            </button>
                        )}
                        {!esLista && (
                            <button
                                style={menuItemStyle}
                                onClick={() => navigate("/lista")}
                            >
                                Ver lista de incidencias
                            </button>
                        )}

                        {!esSolicitudGestor && (
                            <button
                                style={menuItemStyle}
                                onClick={() => navigate("/solicitar-gestor")}
                            >
                                ¿Quieres ser gestor? Envía tu solicitud
                            </button>
                        )}
                        {!esEstadoSolicitud && (
                            <button
                                style={menuItemStyle}
                                onClick={() => navigate("/estado-solicitud")}
                            >
                                Estado de mi solicitud
                            </button>
                        )}

                        <button
                            style={menuItemStyle}
                            onClick={() => {
                                localStorage.removeItem("token");
                                navigate("/");
                            }}
                        >
                            Cerrar sesión
                        </button>
                        
                    </div>
                )}
            </div>
            <div>
                <Outlet/>
            </div>
        </div>
    );
}

export default MenuHamburguesa;