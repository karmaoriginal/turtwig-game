# Turtwig – prototipo (versión dividida)

Juego en HTML/canvas con tres modos: **Combate 1 vs 1**, **Voleibol** y **Historia** (modo de prueba).
Es el mismo juego que `Turtwig_Charmander_Story30.html`, pero repartido en archivos.

## Cómo abrirlo

- **Doble clic en `index.html`** funciona.
- Lo más cómodo en Termux: `python -m http.server 8000` dentro de esta carpeta y abrir `http://localhost:8000`.

## Estructura

| Ruta | Qué contiene |
|---|---|
| `index.html` | Pantalla, controles táctiles y el **orden de carga** de los scripts (no lo cambies) |
| `css/style.css` | Estilos y controles táctiles |
| `fonts/PixOp.ttf` | Fuente pixelada del juego |
| `js/engine.js` | Canvas, escalado, sprites (`Sprites`) y animador (`Animator`) |
| `js/moves.js` | Ataques, tabla de tipos, movimientos por especie, evoluciones |
| `js/fx.js` | Efectos visuales y proyectiles |
| `js/entities.js` | Especies (`KINDS`), `Fighter`, `Player`, `Enemy` (IA: objeto `AI`) |
| `js/game.js` | Objeto `G`: bucle, combate, selección de luchador, pantallas VS |
| `js/volley.js` | Voleibol: constantes (`VB`) y jugadores |
| `js/story-world.js` | Historia: mapa del Pueblo Hoja, NPCs, Pokémon salvajes (`WILD_TBL`), zoom (`STORY`) |
| `js/story.js` | Historia: lógica y dibujo |
| `js/menu-volley.js` | Menú de modos, editor de equipos y partida de voleibol |
| `js/input.js` | Teclado y controles táctiles |
| `js/main.js` | Arranque y bucle a 60 fps |
| `js/data/base.js` | Rutas de retratos, entrenadores y árboles |
| `js/data/<especie>.js` | Animaciones y cuadros de cada especie (**generados, no se editan a mano**) |
| `assets/` | PNG sueltos: retratos, entrenadores, árboles, vegetación, balones, tileset, NPCs |

Los scripts son clásicos (sin módulos) y comparten variables globales, por eso el orden en `index.html` importa.

## Controles

Flechas / WASD mover · Z X C V B N ataques · Shift correr · E hablar · Enter confirmar · Esc volver.
En el teléfono aparecen un joystick y botones táctiles solos (hay que girarlo en horizontal).

## Publicarlo en GitHub Pages

1. Crea un repositorio **público** (por ejemplo `turtwig-game`) en github.com.
2. En esta carpeta:
   ```
   git init -b main
   git add .
   git commit -m "Turtwig prototipo"
   git remote add origin git@github.com:karmaoriginal/turtwig-game.git
   git push -u origin main
   ```
3. En el repositorio: Settings → Pages → *Deploy from a branch* → `main` / `(root)` → Save.
4. En un par de minutos queda en `https://karmaoriginal.github.io/turtwig-game/`.

## Créditos y aviso

Proyecto de fans, sin fines de lucro. Los Pokémon y sus nombres pertenecen a Nintendo, Game Freak y
The Pokémon Company. Añade aquí los créditos de los autores de los sprites y tilesets que uses.
