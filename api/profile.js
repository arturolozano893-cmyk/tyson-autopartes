// api/profile.js
export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.mercadolibre.com/users/me", {
      headers: {
        Authorization: `Bearer ${process.env.MELI_ACCESS_TOKEN}`,
      },
    });

    const data = await response.json();

    res.status(200).json({
      message: "Perfil conectado a Mercado Libre",
      usuario: {
        id: data.id,
        nickname: data.nickname,
        nombre: data.first_name,
        apellido: data.last_name,
        email: data.email,
        tipo: data.user_type,
        país: data.country_id,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al consultar perfil",
      details: error.message,
    });
  }
}
