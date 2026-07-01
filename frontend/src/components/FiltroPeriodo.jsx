export default function FiltroPeriodo({periodo, setPeriodo}) {
    return (
        <div
            style={{
                marginBottom: "20px"
            }}
        >
            <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
            >
                <option value="semana">Semana</option>
                <option value="mes">Mes</option>
                <option value="ano">Año</option>
            </select>
        </div>
    );
}