import { nombrePDF } from "data.js";
import { instance as http } from "./http-common.js";
interface datos {
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
}
interface Archivos {
  foto: Buffer;
  barcode: Buffer;
  pdf: Buffer;
  nombre: string;
}
//const axios = require("axios").default;
export default class Service {
  async create(data: datos) {
    try {
      return await http.post("/pdfs", data);
    } catch (error) {
      console.error(error);
    }
  }
  async createArchivos(data: Archivos) {
    const foto = data.foto.toString("base64");
    const pdf = data.pdf.toString("base64");
    const barcode = data.barcode.toString("base64");
    try {
      return await http.post("/pdfs/archivos", {
        foto,
        barcode,
        pdf,
        nombre: data.nombre,
      });
    } catch (error) {
      console.error(error);
    }
  }
  async getAll() {
    return http.get("/pdfs");
  }
  async findByName(nombre: string) {
    try {
      const res = await http.get(`/pdfs/archivos/${nombre}`);
      const aja = (await res).data;
      return aja;
    } catch (error) {
      console.log(error);
    }
  }
  async exist(nombrePDF: string): Promise<boolean> {
    try {
      const response = await http.get(`/pdfs/existe/${nombrePDF}`);
      const rta = response.data;
      return rta;
    } catch (error) {
      console.error(nombrePDF, error);
    }
  }
  async guardarBd(data: datos) {
    try {
      await this.create(data);
    } catch (error) {
      console.log(error);
    }
  }

  async post(data) {
    return http.post("/pdfs/", data);
  }
  async getArchivos() {
    return http.get("/pdfs/archivos");
  }
  async get(id) {
    return http.get(`/pdfs/${id}`);
  }

  async update(id, data) {
    return http.patch(`/pdfs/${id}`, data);
  }
  async delete(id) {
    return http.delete(`/pdfs/${id}`);
  }
  async deleteAll() {
    return http.delete(`/pdfs`);
  }
  async findByFile(file) {
    return http.get(`/pdfs?file=${file}`);
  }
  async findByDate(fecha) {
    return http.get(`/pdfs?fecha=${fecha}`);
  }
  async findByInterval(fecha1, fecha2) {
    return http.get(`/pdfs?fecha1=${fecha1}&fecha2=${fecha2}`);
  }
  async upload(data) {
    return http.post(`/pdfs/subir`, data);
  }
  async pdfGuardados() {
    const datos = (await this.getAll()).data;
    let guardados = [];
    datos.map((dato) => {
      guardados.push(dato.pdf);
    });
    return guardados;
  }
}
