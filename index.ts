import {
  pdfsEnCarpetaSuperior,
  crearCarpetas,
  existePdfEnCarpetaInterior,
} from "./files.js";
import {
  convertirPdfToText,
  datosPDf,
  isPdfCorrect,
  extraerImagenes,
} from "./data.js";
import { readFileSync, rmdirSync, unlinkSync, writeFileSync, rmSync } from "fs";
import { readFile, unlink, writeFile } from "fs/promises";
import { partirArray, urlServer } from "./utils.js";
import { subir } from "./server.js";
import Service from "./service.js";
(async () => {
  //crea carpetas si no existen
  crearCarpetas();
  //devuelve el texto en el de cada pdf y el nombre del pdf sin convertir
  const textoPDfs = await Promise.all(
    pdfsEnCarpetaSuperior().map(async (archivoPdf) => {
      return {
        archivoPdf,
        contenido: await convertirPdfToText(archivoPdf),
      };
    })
  );

  //Revisa si el pdf es correcto, luego transforma a objeto. Regregsa solo archovs que no
  //han sido convertidos. Retorna el tipo objeto y el nombre del pdf sin convertir
  const datosPdf = textoPDfs
    .filter((item) => isPdfCorrect(item.contenido))
    .map((item) => {
      return { datos: datosPDf(item.contenido), archivoPdf: item.archivoPdf };
    })
    .filter((item) => {
      return existePdfEnCarpetaInterior(item.datos.nombrePDF) == false;
    });
  //Sacarle las fotos , los barcodes
  console.log(datosPdf.length, "archivos a procesar");
  const archivosConFotos = await Promise.all(
    datosPdf.map(async (item) => {
      await extraerImagenes(item.archivoPdf);
      const foto = await readFile(`./images/${item.archivoPdf}/img_p0_2.png`);
      const barcode = await readFile(
        `./images/${item.archivoPdf}/img_p0_3.png`
      );
      const pdf = await readFile(`../${item.archivoPdf}`);
      const archivo = item.archivoPdf;
      const datos = item.datos;
      return { foto, barcode, archivo, datos, pdf };
    })
  );
  const copiados = await Promise.all(
    archivosConFotos.map(async (item) => {
      if (existePdfEnCarpetaInterior(item.datos.nombrePDF)) {
        return null;
      }
      await writeFile(`./pdfs/${item.datos.nombrePDF}.pdf`, item.pdf);
      await writeFile(`./barcodes/${item.datos.nombrePDF}.png`, item.barcode);
      await writeFile(`./photos/${item.datos.nombrePDF}.png`, item.foto);
      await unlink(`../${item.archivo}`);
      return item;
    })
  );
  const archivosPaSubir = copiados.filter((item) => item != null);

  rmSync(`./images`, {
    recursive: true,
  });
  console.log("archivos a subir", archivosPaSubir.length);
  /*
   * tengo muchas mierdas que hacer, hasta aqui tengo copiados
   * lois archivos y las fotos en carpetas
   * de aqui solo toca comparar las las carpetas en el servidor con las que traigo en el array
   * Filtrar a ver si estan subidas
   * Cortar ese array en pedaciots de N objetos
   * Subir pedazo a pedazo
   */
  //cortar el

  const paSubirPartidos = partirArray(archivosPaSubir, 10);
  const service = new Service();
  const palJson = [];
  paSubirPartidos.map(async (trozo) => {
    await Promise.all(
      trozo.map(async (item) => {
        await service.create(item.datos);
        palJson.push({ foto: item.foto, barcode: item.barcode, pdf: item.pdf });
        // await service.createArchivos({
        //   foto: item.barcode,
        //   pdf: item.pdf,
        //   barcode: item.barcode,
        // });
      })
    );
  });
  const jsonArchivos = JSON.stringify(palJson);
  console.log(jsonArchivos);
  // Escribir el JSON en un archivo
  await writeFile("archivos.json", jsonArchivos);
})();
