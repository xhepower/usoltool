import { readdirSync, mkdirSync, existsSync } from "fs";
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
