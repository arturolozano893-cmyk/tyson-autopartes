// /api/items.js
export default async function handler(req, res) {
  try {
    // Paso 1: refrescar el token con MELI_REFRESH_TOKEN
    const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.MELI_CLIENT_ID,
        client_secret: process.env.MELI_CLIENT_SECRET,
        refresh_token: process.env.MELI_REFRESH_TOKEN,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(400).json({ message: "Error al refrescar token", details: tokenData });
    }

    const access_token = tokenData.access_token;

    // Paso 2: obtener ID del usuario
    const userRes = await fetch("https://api.mercadolibre.com/users/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const userData = await userRes.json();

    // Paso 3: recorrer todas las páginas de publicaciones
    let offset = 0;
    let allResults = [];
    let seguir = true;

    while (seguir) {
      const itemsRes = await fetch(
        `https://api.mercadolibre.com/users/${userData.id}/items/search?offset=${offset}&limit=30`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      const itemsData = await itemsRes.json();

      if (itemsData.results && itemsData.results.length > 0) {
        allResults = allResults.concat(itemsData.results);
        offset += 30;
        // Si ya no hay más resultados, paramos
        if (itemsData.results.length < 30) seguir = false;
      } else {
        seguir = false;
      }
    }

    if (allResults.length === 0) {
      return res.status(200).json({
        message: "No tienes publicaciones en Mercado Libre",
        items: [],
      });
    }

    // Paso 4: traer detalles y filtrar solo activos
    const detalles = await Promise.all(
      allResults.map(async (id) => {
        const itemRes = await fetch(`https://api.mercadolibre.com/items/${id}`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const itemData = await itemRes.json();
        if (itemData.status === "active") {
          return {
            id: itemData.id,
            titulo: itemData.title,
            precio: itemData.price,
            stock: itemData.available_quantity,
            imagen: itemData.thumbnail,
            link: itemData.permalink,
          };
        }
        return null;
      })
    );

    const activos = detalles.filter((i) => i !== null);

    res.status(200).json({
      message: activos.length
        ? "Tus publicaciones activas en Mercado Libre"
        : "No tienes publicaciones activas en Mercado Libre",
      items: activos,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al consultar Mercado Libre", details: error.message });
  }
}
