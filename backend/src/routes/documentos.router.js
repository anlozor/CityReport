const express = require('express');
const auth = require('../middlewares/auth.middleware');
const { usuarioNoBloqueado } = require('../middlewares/usuarios.middleware');
const { autorizarRol } = require('../middlewares/roles.middleware');
const { getIncidenciasConIdsDocs, cargarImagenBuffer } = require('../helpers/documentos.helper');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.post("/incidencias", auth, usuarioNoBloqueado, autorizarRol(1, 2), async (req, res) => {
    try {
        // Primero leemos el array con los ids de las incidencias selecciondas
        const {incidencias} = req.body;

        // Comprobamos que hay incidencias seleccionadas
        if (!incidencias || incidencias.length == 0) {
            return res.status(400).json({
                mensaje: "No hay incidencias seleccionadas"
            });
        }

        const infoIncidencias = await getIncidenciasConIdsDocs(incidencias);

        // Creamos el documento pdf
        const pdf = new PDFDocument({margin: 40});

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=incidencias.pdf");
        pdf.pipe(res);

        // Hacemos el título
        pdf.fontSize(18).text("Informe de incidencias", {align: "center"});
        pdf.moveDown(2);

        // Recorremos las incidencias
        for (const [indice, inc] of infoIncidencias.entries()) {

            if (indice !== 0) {
                pdf.addPage();
            }
            
            pdf.fontSize(14).text(`${indice + 1}. ${inc.titulo}`, {
                underline: true
            });

            pdf.fontSize(11);
            pdf.text(`Descripción: ${inc.descripcion}`);
            pdf.text(`Dirección: ${inc.direccion_texto}`);
            pdf.text(`Categoría: ${inc.categoria_nombre}`);
            pdf.text(`Estado: ${inc.estado_nombre}`);
            pdf.text(`Votos: ${inc.num_votos}`);

            const fecha = new Date(inc.fecha_creacion).toLocaleDateString("es-ES");
            pdf.text(`Fecha de la incidencia: ${fecha}`);
            pdf.moveDown(0.5);

            // Añadimos las imagenes de la incidencia si las hay
            if (inc.imagenes && inc.imagenes.length > 0) {
                pdf.fontSize(12).text("Imágenes de la incidencia");

                for (const img of inc.imagenes) {
                    try {
                        if (pdf.y > pdf.page.height - 250) {
                            pdf.addPage();
                        }

                        const {buffer} = await cargarImagenBuffer(img.ruta);

                        pdf.image(buffer, {
                            fit: [400, 300],
                            align: "center",
                            valign: "center"
                        });
                        pdf.y += 50; // Bajamos el cursor para que no se monten las letras encima de las imagenes
                        pdf.moveDown(0.5);
                    } catch (error) {
                        pdf.fontSize(10).text("No se pudo cargar la imagen");
                    }
                }
                pdf.moveDown(1);
            }

            // Añadimos sus comentarios si los tiene junto a sus imagenes
            pdf.fontSize(12).text("Comentarios:");
            if (inc.comentarios.length === 0) {
                pdf.fontSize(12).text("Sin comentarios");
            } else {
                for (const c of inc.comentarios) {
                    
                    pdf.fontSize(10).text(`- ${c.autor}: ${c.texto}`)

                    if (c.imagenesComentarios && c.imagenesComentarios.length > 0) {
                        for (const img of c.imagenesComentarios) {
                            try {
                                if (pdf.y > pdf.page.height - 250) {
                                    pdf.addPage();
                                }

                                const {buffer} = await cargarImagenBuffer(img.ruta);

                                pdf.image(buffer, {
                                    fit: [300, 200],
                                    align: "center",
                                    valign: "center"
                                });
                                pdf.y += 20; // Bajamos el cursor para que no se monten las letras encima de las imagenes
                                pdf.moveDown(0.5);
                            } catch (error) {
                                pdf.fontSize(9).text("(Imagen no disponibe)");
                            }
                        }
                    }
                    pdf.moveDown(0.5);
                };
            }

            pdf.moveDown(1);
            pdf.text("----------------------------");
            pdf.moveDown(1);
        };
        pdf.end();

    } catch (error) {
        console.error("Error al generar el documento:", error);
        res.status(500).json({
            mensaje: "Error al generar el documento"
        });
    }
});

module.exports = router;