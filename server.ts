import { urlServer } from "./utils.js";

const url = urlServer();

export const subir = async (item: object) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Puedes incluir otras cabeceras aquí si es necesario
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error("Error al enviar la solicitud.");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};
