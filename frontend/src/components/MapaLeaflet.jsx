import { MapContainer, Popup, TileLayer, Marker, useMap } from 'react-leaflet';
import '../utils/iconosLeaflet';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { votarIncidencia } from '../services/votosService';
import { sacarUsuariodelToken } from '../services/despiezarTokenService';
import { getIncidenciaId } from '../services/incidenciasService';
import { L } from 'leaflet';
import { useMapEvents } from "react-leaflet";
import { obtenerDireccion } from '../services/nominatimService';
import NuevaIncidencia from '../pages/NuevaIncidencia';

function FixMapSize({incidencias}) {
    const map = useMap();

    useEffect(() => {
        map.invalidateSize();
    }, [map, incidencias]);
    return null;
}

function HandlerClickMapa({setPosicionNueva, setNuevaIncidencia}) {
    useMapEvents({
        click: async (e) => {
            const {lat, lng} = e.latlng;
            let direccion = "";
            try {
                direccion = await obtenerDireccion(lat, lng);
            } catch (error) {
                console.error("Error obteniendo dirección:", error);
            }

            setPosicionNueva({lat, lng, direccion: direccion});
        }
    });
    return null;
}

function CentrarMapa({ubicacionUsuario}) {
    const map = useMap();

    useEffect(() => {
        if (!ubicacionUsuario) {
            return;
        }

        map.setView([ubicacionUsuario.lat, ubicacionUsuario.lon], map.getZoom());
    }, [ubicacionUsuario]);

    return null;
}

export default function MapaLeaflet({incidencias, onVerDetalles, onActualizarVoto, onNuevaIncidencia, nuevaIncidencia, setNuevaIncidencia, onIncidenciaCreada, ubicacionUsuario}) {
    const centro = ubicacionUsuario ? [ubicacionUsuario.lat, ubicacionUsuario.lon] : [40.4168, -3.7038];
    const id_usuario = sacarUsuariodelToken();

    const [votosUsuario, setVotosUsuario] = useState([]);

    const [posicionNueva, setPosicionNueva] = useState(null);

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
            center={centro}
            zoom={13}
            style={{height: '100vh', width: '100%'}}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FixMapSize incidencias={incidencias}/>
            <CentrarMapa
                ubicacionUsuario={ubicacionUsuario}
            />

            <HandlerClickMapa
                setPosicionNueva={setPosicionNueva}
                setNuevaIncidencia={setNuevaIncidencia}
            />

            {Array.isArray(incidencias) && incidencias.map((inc) => (
                <Marker
                    key={inc.id_incidencia}
                    position={[inc.latitud, inc.longitud]}
                >
                    <Popup minWidth={250} maxWidth={400}>
                        <div
                            style={{
                                width: "300px",
                                padding: "5px"
                            }}
                        >
                            <h3>{inc.titulo}</h3>
                            <p>{inc.descripcion}</p>
                            <p><strong>Categoría:</strong> {inc.categoria_nombre}</p>
                            <p><strong>Votos:</strong> {inc.num_votos}</p>
                            <div
                                style={{
                                    display: "flex",
                                    gap: "8px",
                                    justifyContent: "center",
                                    marginTop: "10px"
                                }}
                            >
                                <button
                                    onClick={() => handleVotar(inc.id_incidencia)}
                                    disabled={votosUsuario.includes(inc.id_incidencia)}
                                    style={{ background: "orange" }}
                                >
                                    {votosUsuario.includes(inc.id_incidencia) ? "Votado" : "Votar"}
                                </button>

                                <button
                                    onClick={() => handleVerDetalles(inc.id_incidencia)}
                                    style={{ background: "orange" }}
                                >
                                    Ver detalles de la incidencia
                                </button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
            {posicionNueva && (
                <div
                    style={{
                        width: "100%",
                        padding: "10px",
                        boxSizing: "border-box",
                        textAlign: "center"
                    }}
                >
                    <Popup
                        key={posicionNueva.lat + "," + posicionNueva.lng}
                        position={[posicionNueva.lat, posicionNueva.lng]}
                        onClose={() => setPosicionNueva(null)}
                    >
                        <div
                            style={{
                                width: "380px",
                                maxWidth: "85vw",
                                padding: "10px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center"
                            }}
                        >
                            <NuevaIncidencia
                                latitud={posicionNueva.lat}
                                longitud={posicionNueva.lng}
                                direccion={posicionNueva.direccion}
                                onIncidenciaCreada={() => { setPosicionNueva(null);
                                    if (onIncidenciaCreada) {
                                        onIncidenciaCreada();
                                    }
                                }}
                            />
                        </div>
                    </Popup>
                </div>
            )}
        </MapContainer>
    );
}