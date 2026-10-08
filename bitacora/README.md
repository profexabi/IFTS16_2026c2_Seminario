# Apuntes

## Que es CORS?
Cuando desde el front hacemos un fetch a nuestra API Rest, nos encontramos con un fallo en la consola!

```txt
Access to fetch at 'http://localhost:3000/api/products/' from origin 'null' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

CORS (Cross-0rigin Resource Sharing) es un mecanismo de seguridad implementado por los navegadores para restringir las solicitudes HTTP que se realizan desde un dominio diferente al del servidor de destino.

Su proposito principal es prevenir ataques maliciosos, evitando que un sitio web malicioso acceda a recursos protegidos (como cookies o tikens de autenticacion) de otro sitio sin autorizacion.

Cuando intentamos consumir nuestra API REST desde un dominio distinto al del servidor, en este caso `localhost:3000`, el navegador bloquea la solicitud si el servidor de la API no incluye las cabeceras (headers) adecuadas de CORS. Esto ocurre porque el origen (protocolo, dominio y puerto) de la aplicacion cliente no coincide con el del servidor de la API, activando la politica del mismo origen

Para permitir el acceso desde el frontn, debemos configurar nuestra API REST para que responda con las siguientes cabeceras HTTP
```txt
Access-Control-Allow-Origin: https://tufrontend.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

- Usa * como valor de Access-Control-Allow-Origin solo si la API es pública (no recomendado para APIs con credenciales).
- Para desarrollo local, puedes usar http://localhost:3000 o http://localhost:*.
- En entornos de producción, especifica los dominios exactos permitidos.

    Ejemplos de implementación:

    PHP: Usa header('Access-Control-Allow-Origin: *'); al inicio del script.
    Node.js/Express: Usa el middleware cors() o configura manualmente las cabeceras.
    Spring Boot: Usa @CrossOrigin en el controlador o configura globalmente.
    API Gateway (AWS, Oracle, Google): Activa CORS directamente en la consola o mediante políticas de solicitud.

**Sin esta configuración, el navegador bloqueará cualquier solicitud entre orígenes, incluso si tu API está funcionando correctamente.**


---


## Que son los `middlewares`?
Como vimos CORS en nuestra aplicacion es un middleware que en cada respuesta que da el servidor, da explicitamente permiso para consumir los recursos que provee y expone la API REST.

Los middlewares son funciones que se ejecutan durante el ciclo de solicitud y respuesta de una aplicacion. Son funciones que tienen acceso al objeto de peticiones `req` y al objeto de respuestas `res` y a la siguiente funcion de middleware en el ciclo, `next`.

Los middlewares puede realizar tareas como ejecutar codigo, modificar las solicitudes y respuestas, finalizarlas o invocar al siguiente middleware