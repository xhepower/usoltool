import {
  pdfsEnCarpetaSuperior,
  crearCarpetas,
  existePdfEnCarpetaInterior,
  guardarImagenes,
  bufferDatos,
} from "./files.js";
import {
  convertirPdfToText,
  datosPDf,
  isPdfCorrect,
  extraerImagenes,
} from "./data.js";
import { readFileSync, rmdirSync, unlinkSync, writeFileSync, rmSync } from "fs";
import { readFile, rm, unlink, writeFile } from "fs/promises";
import { partirArray, urlServer } from "./utils.js";
import { subir } from "./server.js";
import Service from "./service.js";
import { create } from "domain";
(async () => {
  try {
    crearCarpetas();

    const textoPDfs = await Promise.all(
      pdfsEnCarpetaSuperior().map(async (archivoPdf) => {
        return {
          archivoPdf,
          contenido: await convertirPdfToText(archivoPdf),
        };
      })
    );

    const datosPdf = textoPDfs
      .filter((item) => isPdfCorrect(item.contenido))
      .map((item) => {
        return { datos: datosPDf(item.contenido), archivoPdf: item.archivoPdf };
      });

    const service = new Service();

    const datosDu = [];
    const uniqueDatos = [];
    const idsVistos = {};

    for (const dato of datosPdf) {
      if (!idsVistos[dato.datos.nombrePDF]) {
        const { datos, archivoPdf } = dato;
        const { nombrePDF } = datos;
        await extraerImagenes(archivoPdf);
        const { foto, barcode, pdf } = await bufferDatos(archivoPdf);
        uniqueDatos.push({ datos, archivoPdf, foto, barcode, pdf });
      } else {
        datosDu.push(dato.archivoPdf);
      }
      idsVistos[dato.datos.nombrePDF] = true;
    }

    const datosWeb = (await service.getAll()).data.map(
      (item) => item.nombrePDF
    );

    const datosSubir = uniqueDatos.filter(
      (item) => !datosWeb.includes(item.datos.nombrePDF)
    );
    console.log(
      textoPDfs.length,
      datosPdf.length,
      uniqueDatos.length,
      datosWeb.length,
      datosSubir.length
    );
    uniqueDatos.map(async (item) => {
      const { foto, pdf, barcode, datos } = item;
      const { nombrePDF } = datos;
      await guardarImagenes({
        foto,
        pdf,
        barcode,
        nombrePDF,
      });
    });
    await rm(`./images`, { recursive: true, force: true });
    const pedazos = partirArray(datosSubir, 3);
    pedazos.map(async (pedazo) => {
      let cont = 0;
      await Promise.all(
        pedazo.map(async (item) => {
          const { foto, pdf, barcode } = item;
          await Promise.all([
            await service.guardarBd(item.datos),
            service.createArchivos({
              foto,
              barcode,
              pdf,
              nombre: item.datos.nombrePDF,
            }),
          ]);
        })
      );
    });
    datosPdf.map(async (item) => await unlink(`../${item.archivoPdf}`));
  } catch (error) {
    console.error(error);
  }
})();
