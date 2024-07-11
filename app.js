import express from "express";
import { whatsappRouter } from "./routes/whatsapp.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use("/api", whatsappRouter);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, "0.0.0.0", () => {
  const { port, address } = server.address();

  console.log(`Server has been started on http://${address}:${port}`);
});
