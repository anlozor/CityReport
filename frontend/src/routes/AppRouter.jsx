// Imports
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import MapaIncidencias from "../pages/MapaIncidencias";
import InfoIncidencia from "../pages/InfoIncidencia";
import NuevaIncidencia from "../pages/NuevaIncidencia";
import RegistroNuevoUsuario from "../pages/RegistroNuevoUsuario";

function AppRouter(){
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Login />}
                />
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
                    path="/registro"
                    element={<RegistroNuevoUsuario/>}
                />
                
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;