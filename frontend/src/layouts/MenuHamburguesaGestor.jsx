import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

function MenuHamburguesaGestor() {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const menuRef = useRef(null);

    const esHome = location.pathname === "/home-gestor";
    const esMapa = location.pathname === "/mapa-gestor";

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
                            onClick={() => ir("/gestor/buscar")}
                            style={menuItemStyle}
                        >
                            Buscar gestor
                        </button>

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
        </div>
    );
}

export default MenuHamburguesaGestor;