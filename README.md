# IFTS16_2026c2_Seminario

### TO DO
- Incorporar middlewares
- Crear los endpoints basicos sin optimizar
    - GET
    - POST
    - PUT
    - DELETE

- Optimizar endpoints
- Optimizar vistas

- Refactorizar + aplicar el patron MVC

- Incorporar EJS

#### EXTRAS
- Login
- Bcrypt
- Multer
- Excels

---

### Objetivos
- Garantizar el backoffice y la API REST
- Vistas en EJS
- Opcional Front cliente

## Guia TP Seminario

```sh
node -v # v20.5.0
npm -v # 9.8.0
```

## 1. Arrancando un servidor minimo
### 1.1 Configuracion inicial del proyecto
```sh
# Comprobamos version de Node.js y NPM
node -v # v20.5.0

npm -v # 9.8.0

# Creamos las carpetas del front y el back de nuestro proyecto
mkdir tpSeminario_Back tpSeminario_Front

# Inicializamos el proyecto back
cd tpSeminario_Back
npm init -y
```

---


### 1.2 Instalacion de dependencias y setup basico con sintaxis [`ESM`](https://nodejs.org/api/esm.html)
```sh
# Instalamos las dependencias necesarias, que se guardaran en node_modules
npm install express ejs mysql2 nodemon dotenv
```

#### Que estamos instalando?

- `express`: Framework web
- `EJS`: Motor de plantillas
- `mysql2`: Cliente mysql para Node.js
- `nodemon`: Herramienta que reinicia automaticamente la aplicacion Node.js cuando detecta cambios en los archivos durante el desarrollo
- `dotenv`: Modulo que carga variables de entorno desde un archivo `.env` al entorno de ejecucion de Node.js


---


### 1.3 Declaramos la sintaxis `ESM` y el script de arranque en el `package.json`

```json
"type": "module",
  "scripts": {
    "dev": "nodemon index.js"
  },
```

---


### 1.4 Creamos el archivo principal `index.js` tal como lo indica el `package.json`
```js
import express from "express";
const app = express();

// Endpoint de prueba
app.get("/", (req, res) => {
    res.send("Hola mundo!");
});

app.listen(3000, () => {
    console.log(`Servidor corriendo en el puerto 3000`);
});
```

Finalmente ejecutamos nuestro servidor con el nuevo script `"dev"`
```sh
npm run dev
```

---


# 2. Conectando nuestra app a una Base de Datos
### 2.1 Instalar mysql y phpmyadmin
- En Linux, seguir los tutoriales de instalacion de nuestra version de Linux, en este caso `Linux Mint 21.3`
- Para Windows, usar [xampp](https://www.apachefriends.org/es/index.html)


---


### 2.2 Crear archivos `.gitignore` y `.env` en la raiz del proyecto
```sh
# Creamos ambos en un solo comando
touch .gitignore .env
```
- `.gitignore` nos permite no enviar a git nuestros paquetes de npm y nuestras variables de entorno
- `.env` sirve para almacenar localmente variables sensibles como el usuario y password de la conexion a la BBDD, el puerto, etc

#### Dentro de `.gitignore` escribimos
```
node_modules
.env
```


#### Creamos nuestras variables de entorno en `.env`
Previamente instalamos el paquete dotenv, que sirve para cargar las variables de entorno desde un archivo `.env`, lo que es especialmente util para manejar configuraciones de desarrollo, produccion y otras configuraciones especificas

```
PORT=3000
DB_HOST="localhost"
DB_NAME="nombreDB"
DB_USER="user"
DB_PASSWORD="pass"
```


---


### 2.3 Crear estructura de directorios de nuestro proyecto para almacenar la config y la conexion a la BBDD
- Creamos las carpetas y el archivo `src/api/config/environments.js`

- `environments.js`
```js
// Importamos el modulo dotenv para importar las variables de entorno
import dotenv from "dotenv";

dotenv.config(); // Cargamos las variables de entorno

// Las exportamos desde este modulo
export default {
    port: process.env.PORT || 3000,
    database: {
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    }
}
```

- Creamos las carpetas y el archivo `src/api/database/db.js`
```js
// Importamos el modulo mysql2 en modo promesas para hacer peticiones asnyc a la BBDD
import mysql2 from "mysql2/promise";

// Importamos la informacion de la conexion a la BBDD de las variables de entorno
import environments from "../config/environments.js";

// Traemos la informacion del .env que importamos de environments.js
const { database } = environments;

// Creamos un pool de conexiones a la BBDD
const connection = mysql2.createPool({
    host: database.host,
    database: database.name,
    user: database.user,
    password: database.password
});

// Exportamos el pool de conexiones para que pueda ser utilizado en otros archivos
export default connection;
```

---


### 2.4 Creamos un endpoint minimo para probar la conexion a la BBDD

#### Creamos el endpoint GET all products en index.js
```js
//////////////////
// Importaciones
import express from "express";
import connection from "./src/api/database/db.js"; // Traemos la conexion a la BBDD
import environments from "./src/api/config/environments.js"; // Traemos las variables de entorno


//////////
// Config
const PORT = environments.port;
const app = express();

///////////////
// Endpoints
app.get("/", (req, res) => {
    res.send("Hola mundo!");
});

app.get("/api/products", async (req, res) => {
    try {
        const [rows] = await connection.query("SELECT * FROM products");
        
        res.status(200).json({
            payload: rows
        })

    } catch (error) {
        console.error("Error obteniendo productos", error.message);
    }
});



app.listen(3000, () => {
    console.log(`Servidor corriendo en el puerto 3000`);
});
```

#### Listo! Ya podemos visualizar en el navegador o en [Insomnia](https://insomnia.rest/)


---


### 2.5 Creamos un front minimo para poder consumir nuestro primer endpoint basico -> tpIntegrador_Front
#### *Front minimo creado en la carpeta front* `index.html`

#### Creado nuestro HTML y llamado a nuestro endpoint, nos topamos con el error de CORS
```js
Access to fetch at 'http://localhost:3000/api/products' from origin 'null' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

#### Que es CORS y por que bloquea la API?
CORS (Cross-Origin Resource Sharing) es un mecanismo de seguridad implementado por los navegadores para restrigir las solicitudes HTTP que se realizan desde un dominio diferente al del servidor. Su propostio es prevenir ataques maliciosos, evitando que un sitio web malicioso acceda a recursos protegidos (cookies, tokens de autenticacion) de otro sitio sin autorizacion

Cuando intentamos consumir nuestra propia API REST desde una aplicacion web alojada en un dominio distinto, en nuestro caso:

- Front: `file:///home/xabier/Escritorio/Docencia/2026/IFTS16_2026c1_Seminario/tpSeminario_Front/index.html`
- Back: `http://localhost:3000/api/products`

El navegador bloquea la solicitud si el servidor de la API no incluye los headers adecuados de CORS. Esto ocurre porque el origen (protocolo, dominio y puerto) de la aplicacion cliente no coincide con el del servidor de la API, activando la politica CORS


#### Por que no podemos consumir nuestra API Rest?
- El navegador bloquea la solicitud si el servidor no respodne con las cabeceras de CORS necesarias.
- El error tipico en la consola: *No 'Access-Allow-Origin' header is present*, lo que significa que el servidor no atuoriza el acceso desde nuestro origen

#### Que solucion hay?
Para permitir el acceso desde nuestro frontend, debemos configurar nuestra API REST para que respodna con las siguientes cabeceras HTTP
```
Access-Control-Allow-Origin: https://tufrontend.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

Para nuestra aplicacion con `Node.js` / `Express.js` vamos a usar el middleware `cors()` o manualmente configurar esas cabeceras

---

### 2.6 / Instalamos CORS y middlewares para que nuestro front pueda consumir esa informacion
Los middlewares son funciones que se ejecutan durante el ciclo de solicitud y respuesta de una aplicacion.

Estas funciones tienen acceso al objeto de solicitud `req` y al objeto de respuesta `res` y a la siguiente funcion de middleware en ese ciclo, que se denota normalmente como `next`.

Los middlewares pueden realizar tareas como ejecutar codigo, modificar los objetos de solicitud y respuesta, finalizar el ciclo de solicitud/respuesta o invocar a la sigueinte funcion de middleware

Los middlewares pueden ser de diferentes tipos, como middleware de nivel de aplicacion, que registramos usando `app.use()` y se aplicaca a todas las rutas y metodos de una aplicacion Express

Los middlewares de terceros son funciones desarrolladas por la comunidad y publicadas en [npm](https://www.npmjs.com/package/cors) que permiten agregar funcionalidades adicionales a las aplicaciones de Node.js, como el analisis de cookies con el modulo cookie-parser, etc.

Estos middlewares ayudan a separar las preocupaciones y gestionar rutas complejas de manera mas eficiente

#### Instalamos [cors](https://www.npmjs.com/package/cors) en nuestro backend
```sh
npm i cors
```

En nuestro index.js
```js
import cors from "cors"; // Importamos el modulo CORS

app.use(cors()); // Middleware CORS basico que permite todas las solicitudes

// Middleware "logger" de aplicacion para analizar las solicitudes por consola
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next(); // Pasa al siguiente middleware
});

// Middleware para parsear en las solicitudes POST y PUT
app.use(express.json());
```

Ahora podremos consumir los datos que proporciona nuestra API Rest desde una aplicacion frontend!


---


# 3. Creamos los endpoints basicos (sin optimizar) de nuestro CRUD

### Conceptos fundamentales
Un CRUD (Create, Read, Update, Delete) es una aplicacion que interatua con una base de datos efectuando las siguientes operaciones

- **Create**: Lo hace a traves del verbo HTTP POST -> Envia datos al servidor. Se uas comunmente en formularios de registro, login, etc

- **Read**: Lo hace a traves del verbo HTTP GET -> Obtiene datos del servidor, es la solicitud que hacemos desde el navegador para acceder a paginas web o buscar informacion

- **Update**: Lo hace a traves del verbo HTTP PUT -> Actualiza informacion en el servidor

- **Delete**: Lo hace a traves del verbo HTTP DELETE -> Elimina informacion en el servidor


---


### 3.1 / Creamos el endpoint GET products by id
```js
app.get("/api/products/:id", async (req, res) => {

    // Extraemos el valor numerico de la url
    let id = req.params.id;

    let sql = "SELECT * FROM products where products.id = ?";

    const [rows] = await connection.query(sql, [id]);

    res.status(200).json({
        payload: rows
    });
});
```

Probamos este endpoint accediendo a la URL: `http://localhost:3000/api/products/1`
En caso de existir en nuestra BBDD un producto con id 1, nos lo mostrara

```json
{
  "payload": [
    {
      "id": 1,
      "name": "hamburguesa impossible",
      "image": "https://burgernj.com/wp-content/uploads/2021/05/Impossible-Burger_.jpg",
      "category": "food",
      "price": "2000.00",
      "active": 1
    }
  ]
}
```