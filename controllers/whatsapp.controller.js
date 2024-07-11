import {
  checkAuthStatus,
  clients,
  createClient,
} from "../services/whatsapp.js";
import { v4 as uniqv4 } from "uuid";

const ERROR_MESSAGES = {
  SESSION_EXPIRED: "Сессия истекла, пожалуйста аутентифицируйтесь",
  UNAUTHORIZED: "Не авторизован",
  QR_NOT_AVAILABLE:
    "QR Code еще не доступен. Пожалуйста подождите и попробуйте еще раз!",
  TRY: "Не сработало. Попробуйте еще раз!",
};

const SUCCESS_MESSAGE = {
  AUTHORIZED: "Авторизован",
};

class WhatsappController {
  async checkAuth(req, res) {
    const id = req.params.id;

    if (!clients[id]) {
      return res
        .status(401)
        .json({ success: false, error: ERROR_MESSAGES["UNAUTHORIZED"] });
    }

    const client = clients[id].client;
    const isAuth = await checkAuthStatus(client);

    if (!isAuth) {
      return res.status(401).json({
        success: false,
        error: ERROR_MESSAGES["SESSION_EXPIRED"],
      });
    }

    const isReady = clients[id].ready;
    if (!isReady) {
      return res
        .status(401)
        .json({ success: false, error: ERROR_MESSAGES["UNAUTHORIZED"] });
    }

    res.json({ success: true, message: SUCCESS_MESSAGE["AUTHORIZED"] });
  }

  async qr(req, res) {
    let id = req.params.id;

    if (!clients[id]) {
      id = uniqv4();
      createClient(id);
    }

    if (clients[id].qr) {
      res.json({ success: true, qr: clients[id].qr, clientId: id });
    } else {
      res.json({
        clientId: id,
        success: false,
        error: ERROR_MESSAGES["QR_NOT_AVAILABLE"],
      });
    }
  }

  async checkNumber(req, res) {
    const { id, number } = req.body;

    if (!clients[id]) {
      return res
        .status(400)
        .json({ success: false, error: ERROR_MESSAGES["UNAUTHORIZED"] });
    }

    const client = clients[id].client;
    const isAuth = await checkAuthStatus(client);

    if (!isAuth) {
      return res.status(401).json({
        success: false,
        error: ERROR_MESSAGES["SESSION_EXPIRED"],
      });
    }

    try {
      const isRegistered = await client.isRegisteredUser(number);
      res.json({ success: true, isRegistered });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  async sendMessage(req, res) {
    const { id, to, message } = req.body;

    if (!clients[id]) {
      return res
        .status(400)
        .json({ success: false, error: ERROR_MESSAGES["UNAUTHORIZED"] });
    }

    const client = clients[id].client;
    const isAuth = await checkAuthStatus(client);

    if (!isAuth) {
      return res.status(401).json({
        success: false,
        error: ERROR_MESSAGES["SESSION_EXPIRED"],
      });
    }

    if (!clients[id].ready) {
      return res
        .status(400)
        .json({ success: false, error: ERROR_MESSAGES["TRY"] });
    }

    try {
      await client.sendMessage(to, message);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const whatsappController = new WhatsappController();
