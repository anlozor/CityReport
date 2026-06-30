import { MapContainer, Popup, TileLayer, Marker, useMap } from 'react-leaflet';
import '../utils/iconosLeaflet';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { votarIncidencia } from '../services/votosService';
import { sacarUsuariodelToken } from '../services/despiezarTokenService';
import { getIncidenciaId } from '../services/incidenciasService';
import L from 'leaflet';
import { useMapEvents } from "react-leaflet";
import { obtenerDireccion } from '../services/nominatimService';
import NuevaIncidencia from '../pages/NuevaIncidencia';

const iconoNormalGestor = L.divIcon({
    className: "icono-incidencia-normal",
    html: `
        <div style="
            width: 14px;
            height: 14px;
            background: #ff3b3b;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 6px rgba(0,0,0,0.4);
        "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
});

const iconoSeleccionado = L.divIcon({
    className: "icono-incidencia-seleccionada",
    html: `
        <div style="
            width: 18px;
            height: 18px;
            background: #00c853;
            border-radius: 6px;
            border: 2px solid white;
            box-shadow: 0 0 8px rgba(0,0,0,0.5);
            transform: rotate(45deg);
        "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
});

const iconoAzulDefault = new L.Icon.Default();

function FixMapSize({incidencias}) {
    const map = useMap();

    useEffect(() => {
        map.invalidateSize();
    }, [map, incidencias]);
    return null;
}

function HandlerClickMapa({setPosicionNueva, setNuevaIncidencia, modoDocumento}) {
    useMapEvents({
        click: async (e) => {
            if (modoDocumento) {
                return;
            }

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

export default function MapaLeaflet({incidencias, onVerDetalles, onActualizarVoto, onNuevaIncidencia, nuevaIncidencia, setNuevaIncidencia, onIncidenciaCreada, ubicacionUsuario, modo, incidenciasSeleccionadas, modoDocumento}) {
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

    useEffect(() => {
        if (modoDocumento) {
            setPosicionNueva(null);
            setNuevaIncidencia?.(null);
        }
    }, [modoDocumento]);

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
                modoDocumento={modoDocumento}
            />

            {Array.isArray(incidencias) && incidencias.map((inc) => {
                const estaSeleccionada = incidenciasSeleccionadas?.some((i) => i.id_incidencia === inc.id_incidencia);

                return (
                    <Marker
                        key={inc.id_incidencia}
                        position={[inc.latitud, inc.longitud]}
                        icon={modoDocumento ? (estaSeleccionada ? iconoSeleccionado : iconoNormalGestor) : iconoAzulDefault}
                        eventHandlers={{
                            click: () => {
                                if (modo === "gestor" && onVerDetalles) {
                                    onVerDetalles(inc);
                                }
                            }
                        }}
                    >
                        {modo === "usuario" && (
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
                                            onClick={() => {
                                                handleVerDetalles(inc.id_incidencia)
                                            }}
                                            style={{ background: "orange" }}
                                        >
                                            Ver detalles de la incidencia
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                        )}
                    </Marker>
                );
                
            })}
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
                                modo="popup"
                            />
                        </div>
                    </Popup>
                </div>
            )}
        </MapContainer>
    );
}