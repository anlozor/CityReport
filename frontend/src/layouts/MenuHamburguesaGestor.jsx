import { Outlet, useNavigate } from "react-router-dom";

function MenuHamburguesaGestor() {
    const navigate = useNavigate();

    return (
        <div>
            {/* HEADER / HAMBURGUESA */}
            <nav>
                <button onClick={() => navigate("/home-gestor")}>
                    🏠 Notificaciones
                </button>

                <button onClick={() => navigate("/mapa")}>
                    🗺️ Ir al mapa
                </button>

                <button onClick={() => navigate("/gestor/documento")}>
                    📄 Generar documento
                </button>

                <button onClick={() => navigate("/gestor/buscar")}>
                    🔎 Buscar gestor
                </button>
            </nav>

            <Outlet />
        </div>
    );
}

export default MenuHamburguesaGestor;