// Imports
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import MapaIncidencias from "../pages/MapaIncidencias";

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
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;