// Imports
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import MapaIncidencias from "../pages/MapaIncidencias";
import InfoIncidencia from "../pages/InfoIncidencia";
import NuevaIncidencia from "../pages/NuevaIncidencia";
import RegistroNuevoUsuario from "../pages/RegistroNuevoUsuario";
import MenuHamburguesa from "../layouts/MenuHamburguesa";
import PerfilUsuario from "../pages/PerfilUsuario";
import RecuperarContraseña from "../pages/RecuperarContraseña";

function AppRouter(){
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MenuHamburguesa/>}>
                    <Route
                        path="/mapa"
                        element={<MapaIncidencias />}
                    />
                    <Route
                        path="/incidencias/:id"
                        element={<InfoIncidencia />}
                    />
                    <Route
                        path="/incidencias/nueva"
                        element={<NuevaIncidencia/>}
                    />
                    <Route
                        path="/perfil"
                        element={<PerfilUsuario/>}
                    />
                </Route>
                <Route
                    path="/"
                    element={<Login />}
                />
                <Route
                    path="/registro"
                    element={<RegistroNuevoUsuario/>}
                />
                <Route
                    path="/recuperar-contrasena"
                    element={<RecuperarContraseña/>}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;