import type { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

const accessToken = "APP_USR-8934636196580387-120118-7c835107e9baaa389c3238a9c575a3dc-2714166660";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Paso 1: obtener publicaciones públicas SIN token
    const searchUrl = "https://api.mercadolibre.com/sites/MLM/search?nickname=AUTOPARTESLOZANO";
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      return res.json({ message: "No se encontraron publicaciones." });
    }

    // Paso 2: tomar los IDs
    const ids = searchData.results.map((item: any) => item.id).join(",");

    // Paso 3: obtener detalles con token
    const itemsUrl = `https://api.mercadolibre.com/items?ids=${ids}`;
    const itemsResponse = await fetch(itemsUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const itemsData = await itemsResponse.json();

    res.json(itemsData);
  } catch (error) {
    console.error("Error al obtener publicaciones:", error);
    res.status(500).json({ error: "Error al obtener publicaciones" });
  }
}
