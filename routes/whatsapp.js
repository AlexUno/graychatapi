import { Router } from "express";
import { whatsappController } from "../controllers/whatsapp.controller.js";

const router = Router();

router.get("/check-auth/:id", whatsappController.checkAuth);
router.get("/qr/:id", whatsappController.qr);
router.post("/check-number", whatsappController.checkNumber);
router.post("/send-message", whatsappController.sendMessage);

export const whatsappRouter = router;
