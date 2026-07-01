import { useEffect, useState } from "react";
import { getIncidenciasEliminadas, getIncidenciasCreadas, getIncidenciasPorCategoria,
    getComentariosEliminados, getImagenesEliminadas, getUsuariosBloqueados, getCambiosEstado } from "../services/gestorAvanzadoService";
import FiltroPeriodo from "../components/FiltroPeriodo";
import GraficoIncidencias from "../components/GraficoIncidencias";
import GraficoCategorias from "../components/GraficoCategorias";
import TarjetasElimBloq from "../components/TarjetasElimBloq";
import TablaCambiosEstados from "../components/TablaCambiosEstados";

function obtenerTextoCentro(periodo) {
    const hoy = new Date();

    if (periodo === "mes") {
        return hoy.toLocaleDateString("es-ES", {
            month: "long",
            year: "numeric"
        });
    }

    if (periodo === "ano") {
        return hoy.getFullYear().toString();
    }

    return "Esta semana";
}

function PanelAvanzado() {
    const [periodo, setPeriodo] = useState("mes");

    const [incidencias, setIncidencias] = useState([]);
    const [categorias, setCategorias] = useState([]);

    const [usuarios, setUsuarios] = useState([]);
    const [comentarios, setComentarios] = useState([]);
    const [imagenes, setImagenes] = useState([]);

    const [cambiosEstados, setCambiosEstados] = useState([]);

    useEffect(() => {
        cargarDatos();
    }, [periodo]);

    const cargarDatos = async () => {
        const [inc, cat, usu, com, img, cam] = await Promise.all([
            getIncidenciasCreadas(periodo),
            getIncidenciasPorCategoria(periodo),
            getUsuariosBloqueados(),
            getComentariosEliminados(),
            getImagenesEliminadas(),
            getCambiosEstado()
        ]);

        setIncidencias(inc);
        setCategorias(cat);
        setUsuarios(usu);
        setComentarios(com);
        setImagenes(img);
        setCambiosEstados(cam);
    };

    const incidenciasArregladas = incidencias.map(i => {
        let periodoFormateado;

        if (periodo === "semana") {
            periodoFormateado = new Date(i.periodo).toLocaleDateString("es-ES");
        } else if (periodo === "mes") {
            periodoFormateado = new Date(i.periodo).toLocaleDateString("es-ES", {
                month: "short",
                year: "numeric"
            });
        } else {
            periodoFormateado = new Date(i.periodo).getFullYear();
        }

        return {
            periodo: periodoFormateado,
            total: Number(i.total)
        };
    });

    const categoriasArregladas = categorias.map(c => ({
        nombre: c.nombre,
        total: Number(c.total)
    }));

    return (
        <div style={{ padding: "20px" }}>

            <h2
                style={{
                    margin: 0,
                    fontSize: "32px",
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
                    color: "#2B2620"
                }}
            >
                Panel avanzado
            </h2>

            <FiltroPeriodo periodo={periodo} setPeriodo={setPeriodo} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

                <GraficoIncidencias
                    data={incidenciasArregladas}
                />

                <GraficoCategorias
                    data={categoriasArregladas}
                    textoCentro={obtenerTextoCentro(periodo)}
                />

            </div>

            <TarjetasElimBloq
                usuarios={usuarios}
                comentarios={comentarios}
                imagenes={imagenes}
            />
            <TablaCambiosEstados
                cambios={cambiosEstados}
            />

        </div>
    );
}

export default PanelAvanzado;