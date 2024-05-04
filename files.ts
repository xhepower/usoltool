import { readdirSync, mkdirSync, existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import path from "path";

// Ruta de la carpeta un nivel arriba
const rutaCarpetaSuperior = "../";
const CARPETAS = ["pdfs", "photos", "barcodes", "images"];

export const pdfsEnCarpetaSuperior = () => {
  try {
    const archivos = readdirSync(rutaCarpetaSuperior);
    const archivosPDF = archivos.filter((archivo) => archivo.endsWith(".pdf"));
    return archivosPDF;
  } catch (error) {
    console.error("Error al leer la carpeta:", error);
    return [];
  }
};
export const existePdfEnCarpetaInterior = (pdf: string) => {
  const archivos = readdirSync("./pdfs");
  return archivos.includes(`${pdf}.pdf`);
};
export const crearCarpetas = () => {
  CARPETAS.map((folderName) => {
    if (!existsSync(folderName)) {
      mkdirSync(folderName);
    }
  });
};
export const guardarImagenes = async ({
  foto,
  pdf,
  barcode,
  nombrePDF,
}: {
  foto: Buffer;
  barcode: Buffer;
  pdf: Buffer;
  nombrePDF: string;
}) => {
  try {
    let copiado = 0;
    let repetido = 0;
    if (existePdfEnCarpetaInterior(nombrePDF) == false) {
      await writeFile(`./pdfs/${nombrePDF}.pdf`, pdf);
      await writeFile(`./barcodes/${nombrePDF}.png`, barcode);
      await writeFile(`./photos/${nombrePDF}.png`, foto);
      copiado++;
    } else {
      repetido++;
    }
    return { copiado, repetido };
  } catch (error) {
    console.log(error);
  }
};
export const bufferDatos = async (archivoPdf) => {
  const foto = await readFile(`./images/${archivoPdf}/img_p0_2.png`);
  const barcode = await readFile(`./images/${archivoPdf}/img_p0_3.png`);
  const pdf = await readFile(`../${archivoPdf}`);
  return { foto, barcode, pdf };
};
