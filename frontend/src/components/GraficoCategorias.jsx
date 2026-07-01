import {
    PieChart, Pie, Tooltip, Cell, ResponsiveContainer
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function GraficoCategorias({ data, textoCentro }) {
    if (!data || data.length === 0) {
        return (
            <div
                style={{ textAlign: "center",
                padding: "40px",
                color: "#888"
                }}
            >
                <h3>Incidencias por categoría</h3>
                No hay datos disponibles para este periodo
            </div>
        );
    }

    return (
        <div style={{ height: 300 }}>
            <h3>Incidencias por categoría</h3>

            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="total"
                        nameKey="nombre"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        label
                        labelLine={false}
                    >
                        {data.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={16}
                        fontWeight="bold"
                        fill="#444"
                    >
                        {textoCentro}
                    </text>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

export default GraficoCategorias;