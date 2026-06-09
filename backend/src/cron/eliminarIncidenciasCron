// 1. Importamos node-cron y función
const cron = require('node-cron');
const eliminarIncidencias = require('./eliminarIncidenciasLogica');

// 2. Creamos la tarea programada para todos los días a las 00:00
cron.schedule('0 0 * * *', async () => {
    console.log('Ejecutando cron para eliminar incidencias...');
    await eliminarIncidencias();
    console.log('Cron para eliminar incidencias finalizado.');
});