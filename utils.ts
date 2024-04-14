import * as dotenv from "dotenv";
dotenv.config();
export const fechaPdf = (fechita: string): Date | null => {
  try {
    const [dia, mes, anio] = fechita.split("/");
    const fechaUTC = new Date(
      Date.UTC(parseInt(`20${anio}`), parseInt(mes), parseInt(dia))
    );
    fechaUTC.setUTCHours(12, 0, 0, 0);
    return fechaUTC;
  } catch (error) {
    return null;
  }
};
export const urlServer = () => {
  const host = process.env.HOST;
  const port = process.env.PORT;
  return `${host}:${port}`;
};
const arrayOriginal = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Definir el tamaño de cada parte

// Crear un array para almacenar las partes

export const partirArray = <T>(arreglo: T[], size = 5): T[][] => {
  const partes: T[][] = [];
  const cantidadPartes = Math.ceil(arreglo.length / size);
  for (let i = 0; i < cantidadPartes; i++) {
    const inicio = i * size;
    const fin = (i + 1) * size;
    const parte = arreglo.slice(inicio, fin);
    partes.push(parte);
  }
  return partes;
};
