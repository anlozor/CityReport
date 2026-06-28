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
import RestableerContraseña from "../pages/RestablecerContraseña";
import ListadoIncidencias from "../pages/ListadoIncidencias";
import NuevaIncidenciaPagina from "../pages/NuevaIncidenciaPagina";
import SolicitarGestor from "../pages/SolicitarGestor";
import EstadoSolicitud from "../pages/EstadoSolicitud";
import HomeGestor from "../pages/HomeGestor";
import InfoSolicitudGestor from "../pages/InfoSolicitudGestor";
import MenuHamburguesaGestor from "../layouts/MenuHamburguesaGestor";

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
                        path="/nueva-incidencia"
                        element={<NuevaIncidenciaPagina/>}
                    />
                    <Route
                        path="/perfil"
                        element={<PerfilUsuario/>}
                    />
                    <Route
                        path="/lista"
                        element={<ListadoIncidencias/>}
                    />
                    <Route
                        path="/solicitar-gestor"
                        element={<SolicitarGestor/>}
                    />
                    <Route
                        path="/estado-solicitud"
                        element={<EstadoSolicitud/>}
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
                <Route
                    path="/restablecer-contrasena"
                    element={<RestableerContraseña/>}
                />

                <Route element={<MenuHamburguesaGestor/>}>
                    <Route
                        path="/home-gestor"
                        element={<HomeGestor/>}
                    />
                    
                </Route>
                
                <Route
                    path="/gestion/incidencias/:id"
                    element={<InfoIncidencia/>}
                />
                <Route
                    path="/gestion/solicitud/:id"
                    element={<InfoSolicitudGestor/>}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;