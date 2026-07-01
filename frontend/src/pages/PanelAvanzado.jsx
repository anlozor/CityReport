import { useEffect, useState } from "react";
import { getIncidenciasEliminadas, getIncidenciasCreadas, getIncidenciasPorCategoria,
    getComentariosEliminados, getImagenesEliminadas, getUsuariosBloqueados } from "../services/gestorAvanzadoService";
import FiltroPeriodo from "../components/FiltroPeriodo";
import GraficoIncidencias from "../components/GraficoIncidencias";
import GraficoCategorias from "../components/GraficoCategorias";
import TarjetasElimBloq from "../components/TarjetasElimBloq";

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

    useEffect(() => {
        cargarDatos();
    }, [periodo]);

    const cargarDatos = async () => {
        const [inc, cat, usu, com, img] = await Promise.all([
            getIncidenciasCreadas(periodo),
            getIncidenciasPorCategoria(periodo),
            getUsuariosBloqueados(),
            getComentariosEliminados(),
            getImagenesEliminadas()
        ]);

        setIncidencias(inc);
        setCategorias(cat);
        setUsuarios(usu);
        setComentarios(com);
        setImagenes(img);
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

            <h2>Panel avanzado</h2>

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

        </div>
    );
}

export default PanelAvanzado;