// api/refresh.js
export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.MELI_CLIENT_ID,
        client_secret: process.env.MELI_CLIENT_SECRET,
        refresh_token: process.env.MELI_REFRESH_TOKEN,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).json({
        message: "Token actualizado correctamente",
        tokens: data,
      });
    } else {
      res.status(response.status).json({
        error: "No se pudo refrescar el token",
        details: data,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Error interno", details: error.message });
  }
}
