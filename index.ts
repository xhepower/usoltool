import {
  pdfsEnCarpetaSuperior,
  crearCarpetas,
  existePdfEnCarpetaInterior,
  guardarImagenes,
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
import { create } from "domain";
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
    });

  //Sacarle las fotos , los barcodes
  let copiados: number = 0;
  let repetidos: number = 0;
  let subidos: number = 0;
  let noSubidos: number = 0;
  let nombres = [];
  const service = new Service();
  /* Se va  a dividir en tres partes:
    1. verificar si no esta en la carpeta, si no esta entonces proceder a copiar 
      el archivo de manera sincronica
    2. verificar que no este el archivo en la base de datos y si no esta subirlo
    3. lo mismo con las fotos son tres a la vez asi que debo subir de uno en uno
    4. si todo va bien pues mover el pdf a la carpeta con el nombre
    
    */

  await Promise.all(
    datosPdf.map(async (item) => {
      const { datos, archivoPdf } = item;
      const { nombrePDF } = datos;
      await extraerImagenes(archivoPdf);
      const foto = await readFile(`./images/${archivoPdf}/img_p0_2.png`);
      const barcode = await readFile(`./images/${archivoPdf}/img_p0_3.png`);
      const pdf = await readFile(`../${archivoPdf}`);
      try {
        if (existePdfEnCarpetaInterior(nombrePDF) == false) {
          await guardarImagenes({ foto, barcode, pdf, nombrePDF });
          copiados++;
        } else {
          repetidos++;
        }
        const listaNombres = await Promise.all(
          (await service.getAll()).data.map((dato) => dato.nombrePDF)
        );
        nombres.push(listaNombres);
        if (listaNombres.includes(nombrePDF) == false) {
          await service.create(datos);
          subidos++;
        } else {
          noSubidos++;
        }
      } catch (error) {
        console.error(error);
      }
    })
  );
  console.log(copiados, repetidos, subidos, noSubidos);
  const jsonData = JSON.stringify(nombres, null, 2);
  writeFileSync("datos.json", jsonData);
})();

// const archivosConFotos = await Promise.all(
//   datosPdf.map(async (item) => {
//     await extraerImagenes(item.archivoPdf);
//     const foto = await readFile(`./images/${item.archivoPdf}/img_p0_2.png`);
//     const barcode = await readFile(
//       `./images/${item.archivoPdf}/img_p0_3.png`
//     );
//     const pdf = await readFile(`../${item.archivoPdf}`);
//     const archivo = item.archivoPdf;
//     const datos = item.datos;
//     return { foto, barcode, archivo, datos, pdf };
//   })
// );
// const copiados = await Promise.all(
//   archivosConFotos.map(async (item) => {
//     if (existePdfEnCarpetaInterior(item.datos.nombrePDF)) {
//       return null;
//     }
//     await writeFile(`./pdfs/${item.datos.nombrePDF}.pdf`, item.pdf);
//     await writeFile(`./barcodes/${item.datos.nombrePDF}.png`, item.barcode);
//     await writeFile(`./photos/${item.datos.nombrePDF}.png`, item.foto);
//     await unlink(`../${item.archivo}`);
//     return item;
//   })
// );
// const archivosPaSubir = copiados.filter((item) => item != null);

// rmSync(`./images`, {
//   recursive: true,
// });
// console.log("archivos a subir", archivosPaSubir.length);
// /*
//  * tengo muchas mierdas que hacer, hasta aqui tengo copiados
//  * lois archivos y las fotos en carpetas
//  * de aqui solo toca comparar las las carpetas en el servidor con las que traigo en el array
//  * Filtrar a ver si estan subidas
//  * Cortar ese array en pedaciots de N objetos
//  * Subir pedazo a pedazo
//  */
// //cortar el

// const paSubirPartidos = partirArray(archivosPaSubir, 10);
// const service = new Service();
// let subidos = [];

// paSubirPartidos.map(async (trozo) => {
//   await Promise.all(
//     trozo.map(async (item) => {
//       const { foto, pdf, barcode } = item;
//       const existe = await service.findByName(item.datos.nombrePDF);
//       if (!existe.data) {
//         await service.create(item.datos);
//         await service.createArchivos({
//           foto,
//           pdf,
//           barcode,
//           nombre: item.datos.nombrePDF,
//         });
//         subidos.push(item.datos.nombrePDF);
//       }
//     })
//   );
// });
// console.log("arvhivos subidos", subidos.length);
