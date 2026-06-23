import NuevaIncidencia from "./NuevaIncidencia";

function NuevaIncidenciaPagina() {
    return (
        <div
            style={{
                padding: "20px"
            }}
        >
            <NuevaIncidencia
                latitud={null}
                longitud={null}
                direccion={""}
                modo="pagina"
            />
        </div>
    );
}

export default NuevaIncidenciaPagina;