// Archivo para funciones auxiliares de textos

// pulirYNormalizarTexto: 
const pulirYNormalizarTexto = (texto) => {
    const textoPulido = texto.trim();
    const textoNormalizado = textoPulido.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\w\s]/g, '');
    return textoNormalizado;
};

// contienePalabrasOfensivas: función para comprobar si un texto contiene palabras ofensivas
const palabrasOfensivas = ['idiota', 'tonto', 'estupido', 'imbecil', 'gilipollas', 'pendejo', 'cabron', 'puta', 'maricon', 'zorra'];
const contienePalabrasOfensivas = (texto) => {
    for (const palabra of texto.split(' ')) {
        if (palabrasOfensivas.includes(palabra)) {
            return true;
        }
    }
    return false;
};

module.exports = {
    pulirYNormalizarTexto,
    contienePalabrasOfensivas
};