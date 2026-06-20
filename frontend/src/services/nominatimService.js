export async function obtenerDireccion(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);

        if (!response.ok) {
            throw new Error("Error obteniendo dirección");
        }

        const data = await response.json();

        return data.display_name;
    } catch (error) {
        console.error(error);
    }
}