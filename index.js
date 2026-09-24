//////////////////
// Importaciones
import express from "express";
import environments from "./src/api/config/environments.js";
import connection from "./src/api/database/db.js";
import cors from "cors";


//////////////////
// Config
const app = express();
const PORT = environments.port;


//////////////////
// Middlewares
app.use(cors());


//////////////////
// Endpoints
app.get("/", (req, res) => {
    res.send("Hola mundo");
});

app.get("/api/products", async (req, res) => {
    try {
        const [rows] = await connection.query("SELECT * FROM products");

        res.status(200).json({
            payload: rows
        });

    } catch (error) {
        console.log("Error obteniendo productos: ", error.message);
    }
})

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});