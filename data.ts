import { readFile, writeFile } from "fs/promises";

import { mkdir, mkdirSync, readFileSync, writeFileSync } from "fs";
import PDFParse from "pdf-parse";
import { exportImages } from "pdf-export-images";
import { fechaPdf } from "./utils.js";

const rutaCarpetaSuperior = "../";
const file1 = "../CONFIRMACION DORONY.pdf";
const pdfSinPath =
  "Consular Electronic Application Center - Print Applicationeddy.pdf";
const file2 =
  "../Consular Electronic Application Center - Print Applicationeddy.pdf";
export const isPdfCorrect = (texto: string[]) => {
  return texto.includes("Application - Sensitive But Unclassified(SBU)");
};

// Ruta del archivo PDF a convertir

// Función asincrónica para leer el archivo PDF y convertirlo a JSON
export async function convertirPdfToText(archivoPDF: string) {
  const rutaArchivoPDF = `${rutaCarpetaSuperior}${archivoPDF}`;
  let rta: string[] = [];

  try {
    // Lee el archivo PDF de manera asincrónica
    const pdfBuffer = await readFile(rutaArchivoPDF);
    // Convierte el buffer del PDF a texto usando pdf-parse
    const pdfData = await PDFParse(pdfBuffer);
    return pdfData.text
      .split("\n")
      .toString()
      .split(",")
      .toString()
      .split(",")
      .toString()
      .split(":")
      .toString()
      .split(",")
      .toString()
      .split("?")
      .toString()
      .split(",")
      .filter((item) => item !== "")
      .filter((item) => item !== " ");
  } catch (error) {
    console.error("Error al convertir el PDF a JSON:", error);
  }

  return rta;
}
export function datosPDf(contenido: string[]) {
  const datosBusqueda = {
    name: "Full Name in Native Language",
    idNumber: "National Identification Number",
    city: "City",
    address: "Home Address",
    phone: "Primary Phone Number",
    email: "Email Address",
    passport: "Passport/Travel Document Number",
    purpose: "Purpose of Trip to the U.S. (1)",
    issued: "Have you ever been issued a U.S. visa",
  };

  //   let datos: {};

  let datos: {
    date: Date | null;
    name: string;
    idNumber: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    passport: string;
    purpose: string;
    issued: string | undefined;
    nombrePDF: string;
  } = {
    date: new Date(),
    name: "",
    idNumber: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    passport: "",
    purpose: "",
    issued: "",
    nombrePDF: "",
  };
  datos.date = fechaPdf(contenido[0]);
  Object.keys(datosBusqueda).map((key) => {
    datos[key] = (() => {
      for (let i = 0; i <= contenido.length; i++) {
        if (contenido[i] == datosBusqueda[key]) {
          return contenido[i + 1];
        }
      }
    })();
  });
  if (datos.issued !== "NO") {
    datos.issued = "SI";
  }
  datos.nombrePDF = nombrePDF({
    date: datos.date,
    passport: datos.passport,
    idNumber: datos.idNumber,
  });
  return datos;
}

export function nombrePDF(datos: {
  date: Date | null;
  idNumber: string;
  passport: string;
}) {
  const fecha =
    datos.date == null
      ? "null"
      : datos.date.getDate() +
        "-" +
        datos.date.getMonth() +
        "-" +
        datos.date.getFullYear();

  return datos.idNumber + "-" + datos.passport + "-" + fecha;
}
export async function extraerImagenes(pdf) {
  mkdirSync(`./images/${pdf}`, {
    recursive: true,
  });
  await exportImages(`../${pdf}`, `./images/${pdf}/`);
  //await exportImages(`../${pdf}`, `./images/`);
}
