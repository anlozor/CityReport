import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

function GraficoIncidencias({ data }) {
    if (!data || data.length === 0) {
        return (
            <div
                style={{ textAlign: "center",
                padding: "40px",
                color: "#888"
                }}
            >
                <h3>Incidencias creadas</h3>
                No hay datos disponibles para este periodo
            </div>
        );
    }

    return (
        <div style={{ height: 300 }}>
            <h3>Incidencias creadas</h3>

            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export default GraficoIncidencias;