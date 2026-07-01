function TarjetasElimBloq({ usuarios, comentarios, imagenes }) {
    return (
        <div style={{ marginTop: "100px" }}>

            <h3>Eliminados y bloqueados</h3>

            <div style={{ display: "flex", gap: "20px" }}>

                <Tarjeta title="Usuarios bloqueados" data={usuarios} />
                <Tarjeta title="Comentarios eliminados" data={comentarios} />
                <Tarjeta title="Imágenes eliminadas" data={imagenes} />

            </div>
        </div>
    );
}

function Tarjeta({ title, data }) {
    return (
        <div style={{
            flex: 1,
            padding: "15px",
            borderRadius: "10px",
            background: "#f5f5f5"
        }}>
            <h4>{title}</h4>
            <p style={{ fontSize: "24px" }}>{data.length}</p>
        </div>
    );
}

export default TarjetasElimBloq;