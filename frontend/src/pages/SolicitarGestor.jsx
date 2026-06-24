import { useState } from "react";
import { toast } from "react-toastify";
import { crearSolicitudGestor } from "../services/solicitudGestorService";
import { useNavigate } from "react-router-dom";

function SolicitarGestor() {
    const [email, setEmail] = useState("");
    const [nombre, setNombre] = useState("");
    const [dni, setDni] = useState("");
    const [motivo, setMotivo] = useState("");
    const [direccion, setDireccion] = useState("");
    const [cp, setCp] = useState("");
    const [localidad, setLocalidad] = useState("");
    const [provincia, setProvincia] = useState("");

    const [imgDni1, setImgDni1] = useState(null);
    const [imgDni2, setImgDni2] = useState(null);
    const [imgCara, setImgCara] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append("email", email);
        formData.append("nombre", nombre);
        formData.append("dni", dni);
        formData.append("motivo_solicitud", motivo);
        formData.append("direccion", direccion);
        formData.append("cp", cp);
        formData.append("localidad", localidad);
        formData.append("provincia", provincia);

        formData.append("imagenes", imgDni1);
        formData.append("imagenes", imgDni2);
        formData.append("imagenes", imgCara);

        const {response, data} = await crearSolicitudGestor(formData);

        if (!response.ok) {
            toast.error(data.mensaje);
            return;
        }

        toast.success(data.mensaje);
        navigate("/estado-solicitud", {replace: true});
    };

    return (
        <div
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "30px"
            }}
        >
            <h1
                style={{
                    textAlign: "center",
                    marginBottom: "30px"
                }}
            >
                Formulario de solicitud de gestor
            </h1>
            <form
                onSubmit={handleSubmit}
                style={{
                    padding: "20px"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "15px"
                    }}
                >
                    <input
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            flex: 1,
                            padding: "10px",
                            fontSize: "16px"
                        }}
                    />
                    <input
                        placeholder="Nombre completo"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        style={{
                            flex: 1,
                            padding: "10px",
                            fontSize: "16px"
                        }}
                    />
                    <input
                        placeholder="DNI / NIE"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        style={{
                            flex: 1,
                            padding: "10px",
                            fontSize: "16px"
                        }}
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "20px",
                        marginBottom: "25px"
                    }}
                >
                    <label
                        style={{
                            width: "220px",
                            height: "220px",
                            borderRadius: "10px",
                            border: "2px dashed #bbb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            overflow: "hidden"
                        }}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImgDni1(e.target.files[0])}
                            style={{
                                display: "none"
                            }}
                        />
                        {imgDni1 ? (
                            <img
                                src={URL.createObjectURL(imgDni1)}
                                alt="DNI frontal"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain"
                                }}
                            />
                        ) : (
                            <span
                                style={{
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    color: "#666"
                                }}
                            >
                                + DNI frontal
                            </span>
                        )}
                    </label>

                    <label
                        style={{
                            width: "220px",
                            height: "220px",
                            borderRadius: "10px",
                            border: "2px dashed #bbb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            overflow: "hidden"
                        }}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImgDni2(e.target.files[0])}
                            style={{
                                display: "none"
                            }}
                        />
                        {imgDni2 ? (
                            <img
                                src={URL.createObjectURL(imgDni2)}
                                alt="DNI trasero"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain"
                                }}
                            />
                        ) : (
                            <span
                                style={{
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    color: "#666"
                                }}
                            >
                                + DNI trasero
                            </span>
                        )}
                    </label>

                    <label
                        style={{
                            width: "220px",
                            height: "220px",
                            borderRadius: "50%",
                            border: "2px dashed #bbb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            overflow: "hidden"
                        }}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImgCara(e.target.files[0])}
                            style={{
                                display: "none"
                            }}
                        />
                        {imgCara ? (
                            <img
                                src={URL.createObjectURL(imgCara)}
                                alt="Selfie"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover"
                                }}
                            />
                        ) : (
                            <span
                                style={{
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    color: "#666"
                                }}
                            >
                                + Foto del rostro
                            </span>
                        )}
                    </label>
                    
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "20px"
                    }}
                >
                    <textarea
                        placeholder="Explique brevemente los motivos por lo que quiere ser gestor"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        style={{
                            flex: 2,
                            minHeight: "200px",
                            padding: "10px",
                            fontSize: "16px"
                        }}
                    />
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px"
                        }}
                    >
                        <input
                            placeholder="Dirección"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            style={{
                                fontSize: "16px"
                            }}
                        />
                        <input
                            placeholder="Código Postal"
                            value={cp}
                            onChange={(e) => setCp(e.target.value)}
                            style={{
                                fontSize: "16px"
                            }}
                        />
                        <input
                            placeholder="Ciudad"
                            value={localidad}
                            onChange={(e) => setLocalidad(e.target.value)}
                            style={{
                                fontSize: "16px"
                            }}
                        />
                        <input
                            placeholder="Provincia"
                            value={provincia}
                            onChange={(e) => setProvincia(e.target.value)}
                            style={{
                                fontSize: "16px"
                            }}
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "12px",
                        background: "orange",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "16px"
                    }}
                >
                    Enviar solicitud
                </button>
            </form>
        </div>
    );
}

export default SolicitarGestor;