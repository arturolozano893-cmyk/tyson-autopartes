// api/items.js
export default async function handler(req, res) {
  try {
    const response = await fetch(
      `https://api.mercadolibre.com/users/me/items/search`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MELI_ACCESS_TOKEN}`,
        },
      }
    );

    const data = await response.json();

    res.status(200).json({
      message: "Tus publicaciones en Mercado Libre",
      items: data.results,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al consultar Mercado Libre",
      details: error.message,
    });
  }
}
