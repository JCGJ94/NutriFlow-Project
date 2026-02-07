# Auditoría de Responsividad - NutriFlow

## Breakpoints de Tailwind CSS
- `sm`: 640px (móviles grandes / tablets pequeñas)
- `md`: 768px (tablets)
- `lg`: 1024px (laptops)
- `xl`: 1280px (desktops)
- `2xl`: 1536px (pantallas grandes)

## Componentes a Auditar

### ✅ Componentes Globales
- [x] Navbar - Revisar menú móvil
- [x] Footer - Ajustar columnas en móvil
- [ ] Toast - Verificar posición en móvil

### 📱 Páginas Principales
- [ ] Landing Page (`/`)
- [ ] Dashboard (`/dashboard`)
- [ ] Plans (`/plans`)
- [ ] Settings (`/settings`)
- [ ] Onboarding (`/onboarding`)
- [ ] Login/Register

### 🎯 Áreas Críticas

#### 1. **Dashboard**
- Grid de "Quick Actions": `md:grid-cols-2` → Verificar en móvil
- Tarjetas de planes: Asegurar scroll horizontal si es necesario
- SmartRecommendations: Grid `lg:grid-cols-3` → Verificar en tablet

#### 2. **Plans Page**
- Tabla de planes: Debe ser scrollable horizontalmente en móvil
- Botones de acción: Deben apilarse verticalmente en móvil

#### 3. **Settings**
- Formulario: Campos deben ocupar ancho completo en móvil
- Grid de 2 columnas: Debe colapsar a 1 columna en móvil

#### 4. **Onboarding**
- Wizard steps: Deben ser compactos en móvil
- Formularios: Ancho completo en móvil

## Principios de Diseño Responsive

1. **Mobile First**: Diseñar primero para móvil, luego escalar
2. **Touch Targets**: Botones mínimo 44x44px
3. **Legibilidad**: Texto mínimo 16px en móvil
4. **Espaciado**: Padding/margin adecuados para touch
5. **Imágenes**: Usar `object-cover` y `aspect-ratio`
6. **Navegación**: Menú hamburguesa en móvil

## Clases Tailwind Comunes para Responsive

```css
/* Padding responsive */
px-4 sm:px-6 lg:px-8

/* Grid responsive */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

/* Text size responsive */
text-sm sm:text-base lg:text-lg

/* Flex direction responsive */
flex-col md:flex-row

/* Hidden/visible responsive */
hidden md:block
md:hidden

/* Gap responsive */
gap-4 md:gap-6 lg:gap-8
```

## Checklist de Verificación

- [ ] Navbar funciona correctamente en móvil
- [ ] Footer se adapta a pantallas pequeñas
- [ ] Formularios son usables en móvil
- [ ] Tablas tienen scroll horizontal
- [ ] Imágenes se escalan correctamente
- [ ] Botones tienen tamaño táctil adecuado
- [ ] Texto es legible en todas las pantallas
- [ ] No hay overflow horizontal
- [ ] Modales/dialogs se adaptan a móvil
