import pkg from "whatsapp-web.js";
import path from "path";
import fs from "fs";
import qrcode from "qrcode";

const { Client, LocalAuth } = pkg;

const sessionsPath = path.resolve("../sessions");
if (!fs.existsSync(sessionsPath)) {
  fs.mkdirSync(sessionsPath);
}

export const clients = {};

/*
Error:
/home/nelo/www/testwhatsapp/node_modules/puppeteer-core/lib/cjs/puppeteer/common/ExecutionContext.js:229
        throw new Error('Evaluation failed: ' + (0, util_js_1.getExceptionMessage)(exceptionDetails));

Solution:
npm install github:pedroslopez/whatsapp-web.js#webpack-exodus
*/

export const createClient = (id) => {
  const sessionDir = path.join(sessionsPath, id);

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: id,
      dataPath: sessionDir,
    }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
      if (err) throw err;
      clients[id].qr = url;
    });
  });

  client.on("ready", () => {
    console.log(`Client ${id} is ready!`);
    clients[id].ready = true;
  });

  client.on("authenticated", () => {
    console.log(`Client ${id} is authenticated!`);
  });

  client.on("auth_failure", (message) => {
    console.error(`Client ${id} authenticated failure: ${message}`);
    delete clients[id];
  });

  client.on("disconnected", (reason) => {
    console.log(`Client ${id} disconnected: ${reason}`);
    delete clients[id];
  });

  client.initialize();
  clients[id] = { client, ready: false, qr: null };

  return client;
};

export const checkAuthStatus = async (client) => {
  try {
    await client.getState();
    return true;
  } catch (err) {
    return false;
  }
};
