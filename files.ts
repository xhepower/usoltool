import { readdirSync, mkdirSync, existsSync } from "fs";
import { writeFile } from "fs/promises";
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
    await writeFile(`./pdfs/${nombrePDF}.pdf`, pdf);
    await writeFile(`./barcodes/${nombrePDF}.png`, barcode);
    await writeFile(`./photos/${nombrePDF}.png`, foto);
  } catch (error) {
    console.log(error);
  }
};
