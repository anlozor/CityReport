const opciones = [
    {valor: "semana", etiqueta: "Semana"},
    {valor: "mes", etiqueta: "Mes"},
    {valor: "ano", etiqueta: "Año"}];

export default function FiltroPeriodo({periodo, setPeriodo}) {
    return (
        <div
            style={{
                display: "inline-flex",
                background: "#EFEAE2",
                borderRadius: "999px",
                padding: "4px",
                gap: "2px"
            }}
        >
            {opciones.map(op => {
                const activo = periodo === op.valor;
                return (
                    <button
                        key={op.valor}
                        onClick={() => setPeriodo(op.valor)}
                        style={{
                            border: "none",
                            cursor: "pointer",
                            padding: "8px 20px",
                            borderRadius: "999px",
                            fontSize: "14px",
                            fontWeight: 600,
                            fontFamily: "inherit",
                            letterSpacing: "0.2px",
                            background: activo ? "#D9730D" : "transparent",
                            color: activo ? "#FFFFFF" : "#6B6459",
                            boxShadow: activo ? "0 2px 8px rgba(217, 115, 13, 0.35)" : "none",
                            transition: "all 0.18s ease"
                        }}
                    >
                        {op.etiqueta}
                    </button>
                );
            })}
        </div>
    );
}