import { MapContainer, Popup, TileLayer, Marker } from 'react-leaflet';
import '../utils/iconosLeaflet';

export default function MapaLeaflet({incidencias}) {
    const madrid = [40.4168, -3.7038];

    return (
        <MapContainer
            center={madrid}
            zoom={13}
            style={{height: '100vh', width: '100%'}}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {Array.isArray(incidencias) && incidencias.map((inc) => (
                <Marker
                    key={inc.id_incidencia}
                    position={[inc.latitud, inc.longitud]}
                >
                    <Popup>
                        <strong>{inc.titulo}</strong>
                        <br/>
                        {inc.descripcion}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}