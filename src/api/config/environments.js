import dotenv from "dotenv";

dotenv.config(); // Carga la info del .env en Node.js

// Exportamos esta informacion de forma anonima a los modulos que requiran de esta info
export default {
    port: process.env.PORT,
    database: {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    }
}