import { MapContainer, Popup, TileLayer, Marker, useMap } from 'react-leaflet';
import '../utils/iconosLeaflet';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { votarIncidencia } from '../services/votosService';
import { useSVGOverlay } from 'react-leaflet/SVGOverlay';
import { useAsyncError } from 'react-router-dom';
import { sacarUsuariodelToken } from '../services/despiezarTokenService';
import { getIncidenciaId } from '../services/incidenciasService';

function FixMapSize({incidencias}) {
    const map = useMap();

    useEffect(() => {
        map.invalidateSize();
    }, [map, incidencias]);
    return null;
}

export default function MapaLeaflet({incidencias, onVerDetalles, onActualizarVoto}) {
    const madrid = [40.4168, -3.7038];
    const id_usuario = sacarUsuariodelToken();

    const [votosUsuario, setVotosUsuario] = useState([]);

    const handleVotar = async (id_incidencia) => {
        try {
            const {response, data} = await votarIncidencia(id_usuario, id_incidencia);

            if (response.status === 409) {
                toast.info("Ya has votado esta incidencia");
                setVotosUsuario(prev => [...prev, id_incidencia]);
                return;
            }

            if (!response.ok) {
                toast.error(data?.mensaje);
                return;
            }
            toast.success("Voto registrado");
            setVotosUsuario(prev => [...prev, id_incidencia]);
            onActualizarVoto(id_incidencia);

        } catch (error) {
            console.error(error);
        }
    };

    const handleVerDetalles = async (id_incidencia) => {
        try {
            const {response, data} = await getIncidenciaId(id_incidencia);

            if (!response.ok) {
                toast.error(data?.mensaje);
                return;
            }
            onVerDetalles(data); // Aquí mandamos la info completa de la incidencia
        } catch (error) {
            console.error(error);
        }
    };

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
            <FixMapSize incidencias={incidencias}/>

            {Array.isArray(incidencias) && incidencias.map((inc) => (
                <Marker
                    key={inc.id_incidencia}
                    position={[inc.latitud, inc.longitud]}
                >
                    <Popup>
                        <div>
                            <h3>{inc.titulo}</h3>
                            <p>Categoría: {inc.categoria_nombre}</p>
                            <p>{inc.num_votos}</p>
                            <button
                                onClick={() => handleVotar(inc.id_incidencia)}
                                disabled={votosUsuario.includes(inc.id_incidencia)}
                            >
                                {votosUsuario.includes(inc.id_incidencia) ? "Votado" : "Votar"}
                            </button>

                            <button
                                onClick={() => handleVerDetalles(inc.id_incidencia)}
                            >
                                Ver detalles de la incidencia
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}