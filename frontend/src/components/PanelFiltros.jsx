import { useEffect, useRef } from "react";

export default function PanelFiltros({abierto, filtros, setFiltros, pedirUbicacion, mostrarVotos = true, setAbierto}) {
    if (!abierto) {
        return null;
    }

    const panelRef = useRef(null);

    const cambiarEstado = (estado) => {
        if (filtros.estado.includes(estado)) {
            setFiltros({
                ...filtros,
                estado: filtros.estado.filter(e => e !== estado)
            });
        } else {
            setFiltros({
                ...filtros,
                estado: [...filtros.estado, estado]
            });
        }
    };

    const proximidades = [
        { label: "500 m", value: 500 },
        { label: "1 km", value: 1000 },
        { label: "5 km", value: 5000 }];

    useEffect(() => {
        if (!abierto) return;

        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)){
                setAbierto(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [abierto]);

    return (
        <div
            ref={panelRef}
            style={{
                position: "absolute",
                top: "70px",
                right: "20px",
                width: "320px",
                background: "#fff",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                padding: "16px",
                zIndex: 1000,
                fontFamily: "system-ui, sans-serif"
            }}
        >
            <h2
                style={{
                    margin: "0 0 12px 0",
                    fontSize: "18px"
                }}
            >
                Filtros
            </h2>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                }}
            >
                {mostrarVotos && (
                    <label
                        style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center"
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={filtros.votos === true}
                            onChange={(e) => setFiltros({
                                ...filtros,
                                votos: e.target.checked ? true : false
                                })
                            }
                        />
                        Más votadas
                    </label>
                )}
                
                <label
                    style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center"
                    }}
                >
                    <input
                        type="checkbox" 
                        checked={filtros.historicas === true}
                        onChange={(e) => setFiltros({
                            ...filtros,
                            historicas: e.target.checked ? true : false
                        })}
                    />
                    Incidencias históricas
                </label>
                <label
                    style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center"
                    }}
                >
                    <input
                        type="checkbox"
                        checked={filtros.propias === true}
                        onChange={(e) => setFiltros({
                            ...filtros,
                            propias: e.target.checked ? true : false
                        })}
                    />
                    Mis incidencias
                </label>
            </div>
            <hr
                style={{
                    margin: "14px 0",
                    border: "none",
                    borderTop: "1px solid #eee"
                }}
            />
            <strong
                style={{
                    fontSize: "18px",
                    color: "#555"
                }}
            >
                Antigüedad máxima
            </strong>
            <select
                value={filtros.fecha}
                onChange={(e) => setFiltros({
                    ...filtros,
                    fecha: e.target.value
                })}
                style={{
                    width: "100%",
                    marginTop: "6px",
                    padding: "8px",
                    borderRadius: "10px",
                    border: "1px solid #ddd"
                }}
            >
                <option value="0">
                    Todas las incidencias
                </option>
                <option value="7">
                    Últimos 7 días
                </option>
                <option value="30">
                    Últimos 30 días
                </option>
                <option value="90">
                    Últimos 90 días
                </option>
            </select>
            <hr
                style={{
                    margin: "14px 0",
                    border: "none",
                    borderTop: "1px solid #eee"
                }}
            />
            <strong
                style={{
                    fontSize: "18px",
                    color: "#555"
                }}
            >
                Estado
            </strong>
            <div
                style={{
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                }}
            >
                {["nueva", "validada", "en proceso", "resuelta"].map(estado => (
                    <label
                        key={estado}
                        style={{
                            display: "flex",
                            gap: "8px"
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={filtros.estado.includes(estado)}
                            onChange={() => cambiarEstado(estado)}
                        />
                            <span
                                style={{
                                    textTransform: "capitalize"
                                }}
                            >
                                {estado}
                            </span>
                    </label>
                ))}
            </div>
            <hr
                style={{
                    margin: "14px 0",
                    border: "none",
                    borderTop: "1px solid #eee"
                }}
            />
            <strong
                style={{
                    fontSize: "18px",
                    color: "#555"
                }}
            >
                Proximidad
            </strong>
            <label
                style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "8px"
                }}
            >
                <input
                    type="checkbox"
                    checked={filtros.proximidadActivada}
                    onChange={(e) => {
                        const checked = e.target.checked;
                        setFiltros({
                            ...filtros,
                            proximidadActivada: checked,
                            ...(checked ? {} : {proximidad: 500, proximidadIndice: 0})
                        });
                    }}
                />
                Activar filtro por proximidad
            </label>

            {filtros.proximidadActivada && (
                <div
                    style={{marginTop: "10px"}}
                >
                    <button
                        onClick={pedirUbicacion}
                        style={{
                            background: "orange",
                            fontWeight: "bold",
                            fontSize: "12px"
                        }}
                    >
                        Usar mi ubicación
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="2"
                        step="1"
                        value={filtros.proximidadIndice}
                        style={{width: "100%"}}
                        onChange={(e) => {
                            const indice = Number(e.target.value);
                            setFiltros({
                                ...filtros,
                                proximidadIndice: indice,
                                proximidad: proximidades[indice].value
                            });
                        }}
                    />
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between"
                        }}
                    >
                        {proximidades.map((p) =>(
                            <small
                                key={p.value}
                            >
                                {p.label}
                            </small>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}