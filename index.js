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
app.use(cors()); // Middleware de aplicacion (se aplica en todas las peticiones y respuestas)

// Middleware logger para imprimir las solicitudes por consola y tener un historial
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
    next(); // Pasamos al siguiente middleware
});

// Middleware para parsear JSON en las solicitudes POST y PUT
app.use(express.json()); // Middleware para parsear JSON en el body




//////////////////
// Endpoints
app.get("/", (req, res) => {
    res.send("Hola mundo");
});

// GET all products
app.get("/api/products", async (req, res) => {
    try {
        const [rows] = await connection.query("SELECT * FROM products");

        res.status(200).json({
            payload: rows
        });

    } catch (error) {
        console.log("Error obteniendo productos: ", error.message);
    }
});


// GET product by id
app.get("/api/products/:id", async (req, res) => {
    try {
        let id = req.params.id;

        const [rows] = await connection.query("SELECT * FROM products WHERE products.id = ?", [id]);

        res.status(200).json({
            payload: rows[0]
        })

    } catch (error) {
        console.log("Error obteniendo producto con id: ", error);
    }
});


// POST product
app.post("/api/products", async (req, res) => {
    try {

        // console.log(req.body);
        const { category, image, name, price } = req.body

        const sql = "INSERT INTO products (name, image, category, price) VALUES (?, ?, ?, ?)";

        await connection.query(sql, [name, image, category, price]);

        return res.status(201).json({
            message: "Producto creado con exito"
        });

    } catch (error) {
        console.log(error);
    }
});


// PUT product
app.put("/api/products", async (req, res) => {
    const { id, name, image, price, category } = req.body;

    const sql = "UPDATE products SET name = ?, image = ?, price = ?, category = ? WHERE id = ?";

    await connection.query(sql, [name, image, price, category, id]);

    return res.status(200).json({
        message: "Producto actualizado correctamente"
    });
});


// DELETE product
app.delete("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM products WHERE id = ?";
    await connection.query(sql, [id]);

    res.status(200).json({
        message: `Producto con id ${id} eliminado correctamente`
    });
});



app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});