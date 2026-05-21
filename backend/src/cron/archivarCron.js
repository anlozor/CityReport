// 1. Importamos la función
// 2. Creamos la tarea programada


// 1. Importamos node-cron y la función
const cron = require('node-cron');
const archivarIncidencias = require('./archivarLogica');

// 2. Creamos la tarea programada para todos los días a las 00:00
cron.schedule('0 0 * * *', async () => {
    console.log('Ejecutando cron para archivar incidencias...');
    await archivarIncidencias();
    console.log('Cron para archivar incidencias finalizado.');
});