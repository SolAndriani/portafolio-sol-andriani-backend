import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://www.solandriani.com",
  "https://solandriani.com",
  "https://sol-andriani-frontend.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("CORS no permitido"));
  },
  credentials: true,
}));

app.use(express.json({ limit: "5mb" }));

app.post("/api/contact", async (req, res) => {
  const { name, from, subject, message } = req.body;
  if (!name || !from || !subject || !message) return res.status(400).json({ error: "Todos los campos son obligatorios" });

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "solandriani@resend.dev",
        to: "solagustinaandriani@gmail.com",
        subject: `Nuevo mensaje de ${name}: ${subject}`,
        html: `<p><strong>Nombre:</strong> ${name}</p>
               <p><strong>Email:</strong> ${from}</p>
               <p><strong>Asunto:</strong> ${subject}</p>
               <p><strong>Mensaje:</strong> ${message}</p>`
      })
    });

    if (!response.ok) throw new Error("Error enviando correo");
    res.status(200).json({ message: "Correo enviado correctamente ✅" });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ error: "Error al enviar el correo" });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
