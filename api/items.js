// api/items.js
export default async function handler(req, res) {
  try {
    // Primero obtenemos la lista de publicaciones
    const response = await fetch(
      `https://api.mercadolibre.com/users/me/items/search`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MELI_ACCESS_TOKEN}`,
        },
      }
    );

    const data = await response.json();

    // Si no hay resultados, devolvemos mensaje
    if (!data.results || data.results.length === 0) {
      return res.status(200).json({
        message: "No tienes publicaciones activas en Mercado Libre",
        items: [],
      });
    }

    // Para cada publicación, pedimos detalles (título, precio, imagen)
    const detalles = await Promise.all(
      data.results.map(async (id) => {
        const itemRes = await fetch(`https://api.mercadolibre.com/items/${id}`, {
          headers: {
            Authorization: `Bearer ${process.env.MELI_ACCESS_TOKEN}`,
          },
        });
        const itemData = await itemRes.json();
        return {
          id: itemData.id,
          titulo: itemData.title,
          precio: itemData.price,
          imagen: itemData.thumbnail,
          link: itemData.permalink,
        };
      })
    );

    res.status(200).json({
      message: "Tus publicaciones en Mercado Libre",
      items: detalles,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al consultar Mercado Libre",
      details: error.message,
    });
  }
}
