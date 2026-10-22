La migración de partes del kernel de Linux y de otros proyectos importantes desde C hacia Rust empezó principalmente por una razón: reducir los errores de seguridad relacionados con la memoria sin perder el rendimiento y el control que ofrece C.

No significa que C haya dejado de servir ni que Rust sea automáticamente mejor para todo. El problema es que C permite escribir software de muy bajo nivel con una enorme libertad, pero esa libertad también facilita errores difíciles de detectar, especialmente en sistemas operativos, controladores y componentes que manejan memoria directamente.

## 1. El problema de C: mucha libertad, muchos riesgos

C es uno de los lenguajes fundamentales de los sistemas operativos. Linux se desarrolló durante décadas con él porque ofrece control directo sobre la memoria, un rendimiento excelente y una interacción muy cercana con el hardware.

Sin embargo, C no comprueba automáticamente muchas condiciones relacionadas con la memoria.

Por ejemplo:

c
```
int *p = malloc(sizeof(int));
*p = 42;
free(p);
printf("%d\n", *p); // Error: uso de memoria liberada
```

El ejemplo contiene un use-after-free: el programa accede a una región de memoria después de liberarla. Este tipo de error puede provocar fallos, corrupción de datos o vulnerabilidades explotables.

Otros problemas frecuentes son:

- Buffer overflow: escribir fuera de los límites de un bloque de memoria.
- Use-after-free: utilizar memoria después de liberarla.
- Double free: liberar dos veces el mismo bloque.
- Data races: acceder concurrentemente a datos compartidos sin la sincronización adecuada.

C permite cometer estos errores sin que el compilador necesariamente los detecte. En software privilegiado, como un kernel, las consecuencias pueden ser especialmente graves.

## 2. ¿Qué aporta Rust que C no tiene?

Rust fue diseñado para ofrecer rendimiento de lenguaje de sistemas, pero con mecanismos que impiden muchas clases de errores de memoria antes de ejecutar el programa.

La diferencia más importante está en cómo se administra la memoria.

C: el programador es responsable

El desarrollador administra la memoria manualmente y debe asegurarse de no usar punteros inválidos, liberar memoria incorrectamente o acceder fuera de los límites.

Rust: el compilador impone reglas

Su sistema de ownership, préstamos (borrowing) y tiempos de vida (lifetimes) permite detectar muchos errores de memoria durante la compilación, sin necesitar un recolector de basura.

Por ejemplo, Rust normalmente impide que un programa acceda a una referencia después de que el dato correspondiente haya dejado de ser válido. También restringe cómo se comparten datos entre distintos hilos de ejecución.

Esto tiene dos ventajas fundamentales:

- Seguridad: se reducen las vulnerabilidades provocadas por accesos inválidos a memoria.
- Mantenimiento: ciertos errores se detectan antes de que el software llegue a producción, en lugar de descubrirlos mediante pruebas, fallos o ataques.

No elimina todos los errores posibles: siguen existiendo fallos lógicos, errores de diseño y operaciones inseguras explícitas mediante `unsafe`. Pero reduce considerablemente una categoría importante de problemas.

blog.google

+1

## 3. ¿Por qué se empezó a incorporar Rust al kernel de Linux?

El proyecto Rust for Linux comenzó a ganar impulso alrededor de 2020 y presentó una propuesta formal en 2021. El soporte inicial se incorporó al kernel principal en la versión 6.1, publicada en diciembre de 2022.

Inside Rust Blog

+1

La idea no era reemplazar de golpe millones de líneas de C, sino permitir que determinados componentes nuevos se desarrollaran en Rust.

Embedded Linux — System Level Documentation documentation

Controladores de dispositivos

Un driver interactúa con hardware y, en muchos casos, procesa datos que no son confiables. Un error de memoria en él puede comprometer todo el sistema.

Part 23: Case Studies | Computer Architecture & OS Mastery - Wasil Zafar

Componentes que administran memoria y recursos

Rust permite construir abstracciones que hacen más difícil utilizar incorrectamente determinados recursos del kernel.

Rust Is No Longer Experimental in Linux … | by Prem Chandak | Dec, 2025 | Medium

Código nuevo

Es más sencillo incorporar Rust progresivamente en componentes seleccionados que reescribir y volver a validar todo el código histórico.

La estrategia es pragmática: conservar el código C que funciona bien y utilizar Rust donde sus garantías aporten beneficios concretos.

Rust for Linux

+1

## 4. No es solo Linux: Android y otros proyectos también lo adoptaron

El cambio es parte de una tendencia más amplia en el desarrollo de software de bajo nivel.

Canyon Star TV

Android

Google incorporó Rust para desarrollar componentes nativos del sistema, como servicios de seguridad y virtualización. Su estrategia prioriza escribir código nuevo en Rust en vez de convertir todo el código C y C++ existente.

blog.google

+1

Google Chrome Web Browser Icon PNG

Google Chrome y otros componentes de Google

Google ha impulsado el uso de lenguajes seguros para la memoria en componentes sensibles, con el objetivo de reducir errores que puedan convertirse en vulnerabilidades.

blog.google

+1

Linux color icon in PNG, SVG

Linux

Rust se incorporó como segundo lenguaje para facilitar la implementación de drivers y otros módulos con mayores garantías de seguridad de memoria. C sigue siendo central en el kernel.

The Linux Kernel documentation

+1

Un dato ilustrativo: Google informó que en Android 13 aproximadamente el 21 % del código nativo nuevo desarrollado para esa versión estaba escrito en Rust. Era una medida correspondiente a esa versión, no al conjunto completo de Android.

blog.google

## 5. ¿Rust es igual de rápido que C?

En muchos casos, sí. Ambos son lenguajes compilados que permiten generar código máquina eficiente. Rust no necesita un recolector de basura funcionando constantemente para administrar la memoria.

Sin embargo, eso no significa que cualquier programa escrito en Rust vaya a ser tan rápido como cualquier implementación en C. El resultado depende del algoritmo, las abstracciones, las optimizaciones del compilador y el diseño del programa.

| Característica | C | Rust |
| --- | --- | --- |
| Rendimiento potencial | Excelente | Excelente |
| Control de memoria | Manual | Controlado mediante reglas y abstracciones |
| Seguridad de memoria por defecto | No garantizada | Garantizada en el código seguro |
| Recolector de basura obligatorio | No | No |
| Curva de aprendizaje | Moderada | Más exigente al principio |
| Integración con código existente en Linux | Nativa | Requiere interfaces y herramientas de integración |

Rust tiene un costo real: el compilador impone reglas que pueden resultar difíciles al principio, y mantener un proyecto que utiliza dos lenguajes aumenta la complejidad de compilación, integración y mantenimiento. Además, las interfaces con código C y las secciones `unsafe` requieren especial cuidado.

Rust for Linux

+1

## 6. Entonces, ¿por qué no reescribir todo Linux en Rust?

Porque probablemente sería una mala decisión de ingeniería.

Linux contiene décadas de trabajo, optimizaciones, compatibilidad con hardware, controladores y código probado en producción. Reescribirlo todo supondría un esfuerzo enorme y podría introducir errores nuevos mientras se intenta solucionar otros.

Además, C no es intrínsecamente inseguro en todos los sentidos: los desarrolladores pueden escribir código C robusto y aplicar análisis estático, pruebas, sanitizadores y otras defensas. El problema es que muchas garantías dependen de la disciplina y de las herramientas externas, en vez de estar impuestas por el lenguaje.

Por eso, la estrategia de migración gradual tiene sentido:

1. Mantener los componentes C que ya funcionan.
2. Escribir en Rust componentes nuevos o especialmente sensibles a errores de memoria.
3. Crear interfaces seguras entre ambos lenguajes.
4. Ampliar su uso a medida que maduren las herramientas, las abstracciones y la experiencia de los desarrolladores.

## La conclusión importante

El cambio de C a Rust no se debe principalmente a que C sea lento o esté obsoleto, sino a que mantener software seguro se ha vuelto cada vez más importante y costoso.

C sigue siendo extraordinariamente útil para sistemas operativos. Rust intenta conservar sus ventajas de rendimiento y control, pero trasladar parte de la responsabilidad por la seguridad desde el programador hacia el compilador.

En otras palabras: la industria está intentando dejar de depender exclusivamente de que los programadores no cometan ciertos errores y empezar a utilizar lenguajes que hagan esos errores mucho más difíciles de escribir.

Si te interesa el aspecto técnico, la pregunta más interesante que sigue es cómo Rust logra hacer eso con ownership y borrowing sin utilizar un recolector de basura. Esa es una de las razones fundamentales por las que resulta atractivo para un kernel.
