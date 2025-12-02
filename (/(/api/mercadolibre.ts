import fetch from "node-fetch";

export default async function handler(req, res) {
  const sellerId = "2714166660"; // Tu seller_id fijo
  const accessToken = process.env.MELI_ACCESS_TOKEN; // Token seguro desde Vercel

  try {
    const response = await fetch(
      `https://api.mercadolibre.com/users/${sellerId}/items/search`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();

    // Opcional: obtener detalles de cada publicación
    const detalles = await Promise.all(
      data.results.slice(0, 10).map(async (id) => {
        const r = await fetch(`https://api.mercadolibre.com/items/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        return await r.json();
      })
    );

    res.status(200).json(detalles);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor", details: error });
  }
}
