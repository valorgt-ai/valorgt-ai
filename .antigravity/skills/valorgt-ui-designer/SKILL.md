---
name: valorgt-ui-designer
description: Diseñador especialista de UI/UX y creador de componentes visuales premium estilo Fintech/Glassmorphism para la plataforma ValorGT.
---

# Skill de Diseño de Componentes Visuales - ValorGT AI (valorgt.app)

Este Skill instruye a los agentes de Antigravity sobre cómo diseñar, maquetar, modificar y pulir elementos de la interfaz de usuario (UI) y la experiencia de usuario (UX) para el proyecto **ValorGT AI**. 

Sigue estas directrices al pie de la letra para mantener la coherencia visual futurista, la interactividad de alta gama y la modularidad del código del proyecto.

---

## 1. Identidad de Marca y Ecosistema Visual (Design System)

La estética de ValorGT es **Futuristic Fintech / Premium Cyberpunk Glassmorphism**. Los elementos deben verse sofisticados, translúcidos, vivos y con sutiles resplanderes tecnológicos.

### 🎨 Paleta de Colores Oficiales (CSS Variables en `styles.css`)
*   **Fondo del Sistema (`--cyber-dark` / base):** `#050608` (Negro absoluto espacial).
*   **Cián Predictivo (`--cyan` / `--neon-cyan`):** `#00f0ff` (Brillo tecnológico del valuador e IA).
*   **Púrpura Inversor (`--neon-purple`):** `#bf5af2` (Brillo holográfico del portafolio y simuladores).
*   **Verde Esmeralda (`--neon-emerald` / `--green`):** `#00ff80` (Aprobaciones bancarias, saldos positivos y éxitos).
*   **Oro Digital (`--gold` / `--neon-gold`):** `#ffd700` (Cartera de oro digital, transacciones XAUt y pautas destacadas).
*   **Rojo Alerta (`--red` / `--neon-red`):** `#ff375f` (Denegaciones de pago, cancelaciones e intentos bloqueados).
*   **Textos:**
    *   Primario: `#ffffff` (Blanco puro para legibilidad).
    *   Secundario: `#ebebf5` (Gris claro de confort).
    *   Mutado (`--text-muted`): `#8e8e93` / `#555` (Gris opaco para leyendas, Huds e IDs).

### ✨ Efectos de Resplandor Neón (Glows)
Todos los elementos interactivos o destacados deben llevar sombras con brillo neón difuminado:
*   **Efecto Cián:** `box-shadow: 0 0 15px rgba(0, 240, 255, 0.25);`
*   **Efecto Púrpura:** `box-shadow: 0 0 15px rgba(191, 90, 242, 0.25);`
*   **Efecto Dorado:** `box-shadow: 0 0 15px rgba(255, 215, 0, 0.35);`
*   **Efecto Esmeralda:** `box-shadow: 0 0 15px rgba(0, 255, 128, 0.3);`

---

## 2. Mosaicos Translúcidos (Glassmorphism)

Los contenedores y tarjetas principales (`.card`) no deben ser opacos. Deben utilizar el efecto de "vidrio esmerilado":
```css
background: rgba(8, 6, 12, 0.72);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.08);
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
```
*   **Bordes de Mosaicos según el Área:**
    *   Área de Valuación (Dashboard) / Catálogo: `border: 1px solid rgba(0, 240, 255, 0.15);`
    *   Área de Portafolio IA / Simuladores: `border: 1px solid rgba(191, 90, 242, 0.15);`
    *   Área de Gestión B2B: `border: 1px solid rgba(255, 255, 255, 0.08);`

---

## 3. Catálogo de Botones Interactivos Premium

Todos los botones deben incluir efectos de hover y transiciones fluidas de `transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);`.

### 🟦 Botón Cián (Valuación/Catálogo)
```html
<button class="btn-commercial btn-commercial-cyan" style="background: rgba(0, 240, 255, 0.08); border: 1px solid var(--cyan); color: var(--cyan);">
    <i data-lucide="eye"></i> VER DETALLES
</button>
```

### 🟪 Botón Púrpura (Planes/Inversiones/Portafolio)
```html
<button class="btn-commercial-purple" style="background: linear-gradient(135deg, #bf5af2 0%, #00f0ff 100%); border: none; color: #fff; text-shadow: 0 0 5px rgba(255,255,255,0.4);">
    <i data-lucide="award"></i> ADQUIRIR PLAN
</button>
```

### 🟨 Botón Dorado (Oro Digital/Pautas Destacadas)
```html
<button class="btn-commercial-gold" style="background: linear-gradient(135deg, #ffd700 0%, #bf5af2 100%); border: none; color: #000; font-weight: bold; box-shadow: 0 0 10px rgba(255,215,0,0.3);">
    <i data-lucide="zap"></i> PAUTAR AHORA
</button>
```

---

## 4. Estructura de Formularios e Inputs Estilizados

Los campos de entrada (`input`, `select`, `textarea`) deben integrarse dentro de un div de clase `.input-group` que ordene el contenido en columna. Nunca utilices placeholders genéricos sin estilo.

### Estructura HTML Semántica Recomendada:
```html
<div class="input-group" style="display: flex; flex-direction: column; gap: 4px;">
    <label for="example-id" style="font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-family: var(--font-mono); letter-spacing: 0.5px;">Etiqueta Campo</label>
    <input type="text" id="example-id" placeholder="Ej. Escribe aquí..." style="padding: 10px; font-size: 0.8rem; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 6px; outline: none; transition: border-color 0.2s;">
</div>
```
*   **Efecto Focus en JavaScript / CSS:** En el evento focus, el borde debe brillar con el color del área (`border-color: var(--cyan)` o `border-color: var(--neon-purple)`).

---

## 5. Reglas Técnicas de Maquetación para Agentes

Al construir o modificar componentes visuales en `index.html`, `app.js` o `styles.css`:

1.  **NO Utilizar TailwindCSS:** El proyecto está maquetado puramente con HTML5 semántico y CSS Vanilla personalizado en `styles.css`.
2.  **Soporte de Iconos Lucide:** Siempre inicializa nuevos iconos llamando a `lucide.createIcons();` de forma diferida en la función JavaScript que renderiza el componente.
3.  **Mantener la Visibilidad del Sidebar Colapsable:**
    *   El menú lateral colapsa agregando la clase `.sidebar-collapsed` al contenedor `.app-container`.
    *   Asegúrate de que cualquier componente inyectado en el menú lateral sea compatible con el estado colapsado (usando tooltips premium y ocultando texto largo reactivamente).
4.  **Alineación "En Fila" de Previsualizaciones:**
    *   Cualquier grilla de miniaturas (ej. cargador de fotos o listado de comprobantes) debe utilizar `display: flex; flex-direction: row; flex-wrap: wrap; gap: 12px; width: 100%;` para garantizar que los elementos se encolumnen de manera elegante una al lado de la otra.
    *   Agrega `flex-shrink: 0;` a los elementos secundarios para evitar que el navegador reduzca su tamaño.

---

## 6. Proceso de Validación Visual

Antes de entregar cualquier cambio en la interfaz gráfica del usuario:
1.  **Verificación de Moneda:** Comprueba que todos los precios en Quetzales se conviertan de forma matemáticamente exacta y muestren el símbolo `Q` cuando la variable global `activeCurrency` sea `'GTQ'`, y cambien a `$` en el modo `'USD'`.
2.  **Validación de Lightboxes e Interrupciones:** Asegúrate de que las pantallas bloqueadas o overlays (`.hidden`) tengan `display: none !important;` y que al activarse se remueva esa clase de manera limpia.
3.  **Animaciones de Escaneo:** Mantén las barras láser IA interactivas en sincronía con los textos de telemetría de carga para dar un aspecto reactivo y vivo.
