// /api/status.js
export default async function handler(req, res) {
  const client_id = process.env.MELI_CLIENT_ID;
  const client_secret = process.env.MELI_CLIENT_SECRET;
  const refresh_token = process.env.MELI_REFRESH_TOKEN;

  try {
    // Paso 1: refrescar el token
    const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id,
        client_secret,
        refresh_token,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(400).json({ message: "Error al refrescar token", details: tokenData });
    }

    const access_token = tokenData.access_token;

    // Paso 2: obtener publicaciones
    const itemsRes = await fetch(`https://api.mercadolibre.com/users/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const userData = await itemsRes.json();

    const listingsRes = await fetch(
      `https://api.mercadolibre.com/users/${userData.id}/items/search`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const listingsData = await listingsRes.json();

    // Paso 3: contar por estado
    const counts = { active: 0, paused: 0, closed: 0, others: 0 };
    for (const id of listingsData.results) {
      const itemRes = await fetch(`https://api.mercadolibre.com/items/${id}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const itemData = await itemRes.json();
      const status = itemData.status;
      if (counts[status] !== undefined) {
        counts[status]++;
      } else {
        counts.others++;
      }
    }

    // Respuesta final
    res.status(200).json({
      message: "Estado de cuenta Mercado Libre",
      user_id: userData.id,
      nickname: userData.nickname,
      token_status: "Vigente",
      publicaciones: counts,
    });
  } catch (error) {
    res.status(500).json({ message: "Error interno", error: error.message });
  }
}
