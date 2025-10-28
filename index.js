// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Lista de orígenes permitidos (tu frontend en producción)
const allowedOrigins = [
  "https://www.solandriani.com",
  "https://solandriani.com",
  "https://sol-andriani-frontend.vercel.app" // si pruebas desde Vercel directamente
];

// Configuración de CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS no permitido"));
    }
  },
  credentials: true,
}));

// Parseo de JSON y URL-encoded
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Endpoint de contacto
app.post("/api/contact", async (req, res) => {
  const { name, from, subject, message } = req.body;

  if (!name || !from || !subject || !message) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  console.log("📩 Datos recibidos:", { name, from, subject, message });

  try {
    // Transportador de Nodemailer usando Gmail con App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,  // tu email en Render
        pass: process.env.EMAIL_PASS,  // app password de Gmail
      },
    });

    const mailOptions = {
      from: from,
      to: process.env.EMAIL_USER,
      subject: `Nuevo mensaje de ${name}: ${subject}`,
      html: `
        <h2>Nuevo mensaje desde tu portafolio 💌</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${from}</p>
        <p><strong>Asunto:</strong> ${subject}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Correo enviado con éxito");
    res.status(200).json({ message: "Correo enviado correctamente ✅" });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ error: "Error al enviar el correo" });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
