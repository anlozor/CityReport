import { useEffect, useState } from "react";
import { getMiPerfil, actualizarMiPerfil } from "../services/perfilService";
import { toast } from "react-toastify";

function PerfilUsuario() {
    const [perfil, setPerfil] = useState(null);
    const [form, setForm] = useState({
        nombre: "",
        email: "",
        contraseña: "",
        alias: ""
    });

    useEffect(() => {
        cargarPerfil();
    }, []);

    const cargarPerfil = async () => {
        const {data} = await getMiPerfil();
        console.log("PERFIL:", data);

        setPerfil(data);
        setForm({
            nombre: data.nombre || "",
            email: data.email || "",
            contraseña: data.contraseña || "",
            alias: data.alias || ""
        });
    };

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const guardar = async () => {
        const {response, data} = await actualizarMiPerfil(form);

        if (!response.ok) {
            toast.error(data.mensaje);
            return;
        }

        toast.success("Perfil actualizado correctamente");
        setPerfil(data);
    };

    if (!perfil) {
        return <p>Cargando perfil...</p>;
    }

    return (
        <div
            style={{
                height: "100vh",
                width: "100vw",
                background: "linear-gradient(135deg, #f5f7fa, #e4edf5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <div
                style={{
                    width: "500px",
                    padding: "25px",
                    background: "white",
                    borderRadius: "16px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
                }}
            >
                <h2 style={{marginBottom: "5px"}}>{perfil.nombre}</h2>
                <p
                    style={{
                        color: "#666",
                        marginBottom: "15px"
                    }}
                >
                    {perfil.rol} · {perfil.alias}
                </p>

                <p
                    style={{
                        fontSize: "0.9rem",
                        color: "#888"
                    }}
                >
                    Registrad@ desde {new Date(perfil.fecha_registro).toLocaleDateString()}
                </p>
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "20px",
                        marginBottom: "20px"
                    }}
                >
                    <div
                        style={{
                            flex: 1,
                            padding: "12px",
                            background: "#f7f9fc",
                            borderRadius: "12px",
                            textAlign: "center"
                        }}
                    >
                        <h3 style={{color: "#ff7a00"}}>{perfil.num_incidencias}</h3>
                        <p style={{margin: 0, fontSize: "0.8rem", color: "#666"}}>
                            Incidencias
                        </p>
                    </div>

                    <div
                        style={{
                            flex: 1,
                            padding: "12px",
                            background: "#f7f9fc",
                            borderRadius: "12px",
                            textAlign: "center"
                        }}
                    >
                        <h3 style={{color: "#ff7a00"}}>{perfil.num_comentarios}</h3>
                        <p style={{margin: 0, fontSize: "0.8rem", color: "#666"}}>
                            Comentarios
                        </p>
                    </div>
                </div>
                <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Nombre"
                />
                <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                />
                <input
                    name="alias"
                    value={form.alias}
                    onChange={handleChange}
                    placeholder="Alias"
                />
                <input
                    name="contraseña"
                    value={form.contraseña}
                    onChange={handleChange}
                    placeholder="Contraseña"
                />
                <button onClick={guardar}>Guardar cambios</button>
            </div>
        </div>
    );
}

export default PerfilUsuario;