# Blue Latitude — Contexto del proyecto

## ¿Qué es esto?
Web de lujo para **Blue Latitude**, empresa de experiencias náuticas en **Mallorca, Islas Baleares**. Proyecto freelance.

## Stack
HTML/CSS/JS puro en un solo archivo `index.html`. Sin frameworks. Única dependencia externa: Google Fonts (Cormorant Garamond + Inter).

## Servicios que ofrece el cliente
1. **Motos de Agua** — adrenalina, rutas por calas exclusivas
2. **Embarcaciones** — lanchas rápidas y veleros de lujo, sin itinerarios fijos
3. **Experiencia Completa** — paquetes a medida: catering, calas privadas, traslados

## Diseño / estética
- Estética premium/lujo
- Paleta: navy oscuro (`#0C1A27`) + dorado (`#C5A46E`) + crema (`#F4EFE6`)
- Tipografía: **Cormorant Garamond** (títulos) · **Inter** (cuerpo)
- Animaciones: partículas flotantes en el hero, shimmer lines, scroll reveal con IntersectionObserver
- Galería con 3 imágenes (actualmente gradientes CSS como placeholder, esperan fotos reales)

## Estructura de secciones
| ID | Sección |
|----|---------|
| `#inicio` | Hero (pantalla completa) |
| `#nosotros` | Statement + estadísticas |
| `#servicios` | Grid de 3 servicios |
| *(marquee)* | Banda de texto en loop |
| `#galeria` | Intro + galería de 3 imágenes |
| `#contacto` | Formulario de contacto |
| footer | Logo + links + copyright |

## Placeholders pendientes de rellenar
- `[NUM]` × 3 → años en Mallorca · experiencias entregadas · embarcaciones en flota
- `[PRECIO]` × 2 → precio motos de agua (por hora) · precio embarcaciones (por día)
- `[TU TELÉFONO AQUÍ]` → teléfono de contacto
- `[TU EMAIL AQUÍ]` → email de contacto

## Assets pendientes
- Fotos reales para la galería → carpeta `assets/`
- Video hero → `assets/hero.mp4` (el código JS ya está preparado pero comentado en el `<script>`)
