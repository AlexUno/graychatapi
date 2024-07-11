import path from "path";
import fs from "fs";

const clinetsDbPath = path.resolve("../db/clients.json");

export const readClientsDb = () => {
  if (fs.existsSync(clinetsDbPath)) {
    const data = fs.readFileSync(clinetsDbPath, "utf-8");
    return JSON.parse(data);
  }
  return {};
};

export const writeClientsDb = (data) => {
  fs.writeFileSync(clinetsDbPath, JSON.stringify(data, null, 2));
};
