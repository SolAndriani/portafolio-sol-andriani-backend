import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    console.log("Solicitud CORS desde:", origin);
    callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// === RUTA DE CONTACTO ===
app.post("/api/contact", async (req, res) => {
  const { name, from, subject, message } = req.body;

  if (!name || !from || !subject || !message) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  console.log("📩 Datos recibidos:", { name, from, subject, message });

  try {
    // Configurar transporte con Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Configurar el contenido del correo
    const mailOptions = {
      from: from,
      to: process.env.EMAIL_USER, // te lo envías a vos misma
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

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    console.log("✅ Correo enviado con éxito");
    res.status(200).json({ message: "Correo enviado correctamente ✅" });
  } catch (error) {
    console.error("❌ Error al enviar el correo:", error);
    res.status(500).json({ error: "Error al enviar el correo" });
  }
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
