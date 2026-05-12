# Verdulería Familiar

Sistema POS e inventario para la operación diaria de un comercio local, diseñado para registrar ventas, controlar stock, revisar historial, gestionar catálogo y realizar cierre diario de caja.

## 🚀 Qué hace

Este proyecto fue construido para resolver necesidades reales de operación en un negocio local, centralizando tareas clave del día a día en una aplicación web simple y directa.

Permite:

- registrar ventas rápidamente
- controlar stock
- revisar historial de ventas
- consultar resumen del negocio
- administrar productos y catálogo
- realizar cierre del día
- exportar datos para respaldo o reporte

## ✨ Funcionalidades principales

- **Ventas**
  - registro de ventas
  - productos por kilo y por unidad
  - cálculo de vuelto
  - variantes de venta
  - anulación de ventas
  - devolución automática de stock al cancelar

- **Stock**
  - control de existencias
  - actualización de mercadería
  - revisión de productos con bajo stock

- **Catálogo**
  - administración de productos
  - variantes de producto
  - configuración del catálogo

- **Resumen e historial**
  - cifras clave del negocio
  - ventas recientes
  - movimientos recientes
  - historial de ventas

- **Cierre del día**
  - registro de cierre diario
  - control de caja
  - exportación de datos

- **Exportación**
  - descarga de reportes
  - exportación CSV

## 🧠 Problema que resuelve

En muchos negocios pequeños, la operación diaria se maneja entre papel, WhatsApp, memoria o planillas dispersas.  
Este sistema busca simplificar esa realidad con un flujo claro para:

- vender
- controlar stock
- revisar movimiento diario
- cerrar caja
- consultar datos relevantes

Todo desde una sola aplicación.

## 🛠 Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend / Data:** Supabase
- **Arquitectura:** App Router + módulos por dominio (`sales`, `products`, `stock`, `dashboard`, `closure`)
- **Base de datos:** PostgreSQL vía Supabase

## 📦 Módulos del sistema

- `ventas`
- `stock`
- `productos`
- `resumen`
- `historial`
- `cierre`
- `exportar`
- `admin catálogo`

## ⚙️ Lógica de negocio implementada

- productos por kilo y por unidad
- cálculo de vuelto
- anulación de ventas
- devolución automática de stock
- cierre diario de caja
- exportación de reportes
- gestión de variantes de producto

## 🧩 Estructura del proyecto

Organizado por módulos funcionales:

- `dashboard`
- `products`
- `sales`
- `stock`
- `closure`

Esto permite separar mejor la lógica de cada dominio y mantener el proyecto más claro y escalable.

## 📌 Estado actual

Proyecto propio en uso real para la operación de un negocio local.

Actualmente cubre:

- ventas
- inventario
- historial
- resumen
- exportación
- cierre del día
- administración de catálogo

## 🔒 Notas

Este proyecto fue construido para uso real en un contexto de comercio local.  
No incluye credenciales ni configuraciones sensibles en el repositorio.

## 📬 Contacto

- LinkedIn: [Martín Vergara](https://www.linkedin.com/in/martin-ignacio-vergara-quiroz-b8042a251/)
- GitHub: [MartinVergaraQ](https://github.com/MartinVergaraQ)