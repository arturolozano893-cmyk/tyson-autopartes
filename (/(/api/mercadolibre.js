import fetch from "node-fetch";

async function refreshAccessToken() {
  const response = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: process.env.MELI_CLIENT_ID,
      client_secret: process.env.MELI_CLIENT_SECRET,
      refresh_token: process.env.MELI_REFRESH_TOKEN,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

export default async function handler(req, res) {
  const sellerId = "2714166660";
  let accessToken = process.env.MELI_ACCESS_TOKEN;

  try {
    let response = await fetch(
      `https://api.mercadolibre.com/users/${sellerId}/items/search`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken();
      response = await fetch(
        `https://api.mercadolibre.com/users/${sellerId}/items/search`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();

    const detalles = await Promise.all(
      data.results.slice(0, 10).map(async (id) => {
        const r = await fetch(`https://api.mercadolibre.com/items/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return await r.json();
      })
    );

    res.status(200).json(detalles);
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor", details: error });
  }
}
