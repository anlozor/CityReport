// Imports
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import MapaIncidencias from "../pages/MapaIncidencias";
import InfoIncidencia from "../pages/InfoIncidencia";
import NuevaIncidencia from "../pages/NuevaIncidencia";

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
                
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;