# 🐌 SnailRace — Prueba técnica Full-Stack

Aplicación de apuestas en carreras de caracoles construida con **React + TypeScript** (frontend) y **Express + TypeScript** (backend).

**Repositorio del proyecto:** [https://github.com/erwinbrowmh/erwin-0105](https://github.com/erwinbrowmh/erwin-0105)

---

## 📦 Estructura del proyecto

```
SISU/
├── backend/          # Express API — SnailPay mock
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/   snailpay.routes.ts
│   │   ├── services/ snailpay.service.ts
│   │   ├── types/    snailpay.types.ts
│   │   └── utils/    generateId.ts
│   └── tests/        snailpay.service.test.ts
└── frontend/         # React SPA
    ├── src/
    │   ├── components/ Dashboard, Forms, Charts, Modal
    │   ├── context/    AuthContext.tsx
    │   ├── types/      index.ts
    │   └── utils/      storage.ts
    └── tests/          storage.test.ts
```

---

## 🚀 Cómo ejecutar

### Requisitos
- Node.js v18+ (probado con v24)
- npm v9+

### Backend

```bash
cd backend
npm install
npm run dev
```

El servidor arranca en `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La app arranca en `http://localhost:5173`

> **Nota:** Inicia el backend antes del frontend para que la integración con SnailPay funcione.

---

## 🧪 Pruebas

### Backend (Vitest)
```bash
cd backend
npm test
```

### Frontend (Vitest + jsdom)
```bash
cd frontend
npm test
```

---

## 💳 Simular respuestas de SnailPay

### 2.3.1 — Cobro exitoso
| Campo | Valor |
|-------|-------|
| Número de tarjeta | `1234123412341234` |
| Fecha de vencimiento | `12/26` |
| CVV | `543` |
| Nombre | Cualquier valor no vacío |
| Monto | Cualquier cantidad > 0 |

### 2.3.2 — Error de transacción
| Escenario | Cómo reproducirlo |
|-----------|-------------------|
| Tarjeta rechazada | Cualquier número diferente a `1234123412341234` |
| CVV incorrecto | CVV diferente a `543` (con tarjeta correcta) |
| Tarjeta vencida | Fecha diferente a `12/26` (con tarjeta correcta) |
| Monto inválido | Ingresar `0` o negativo |
| Sin titular | Dejar el campo de nombre vacío |

### 2.3.3 — Error del sistema
Activar/desactivar mediante la API de administración:

```bash
# Activar error del sistema
curl -X POST http://localhost:3001/api/snailpay/admin/system-error \
  -H "Content-Type: application/json" \
  -d "{\"enabled\": true}"

# Desactivar
curl -X POST http://localhost:3001/api/snailpay/admin/system-error \
  -H "Content-Type: application/json" \
  -d "{\"enabled\": false}"

# Consultar estado
curl http://localhost:3001/api/snailpay/admin/status
```

Mientras el modo de error está activo, **ninguna recarga se aprueba**.

---

## 🔐 Seguridad de contraseñas

Las contraseñas se hashean con **SHA-256** usando la Web Crypto API (`crypto.subtle.digest`) del navegador antes de guardarse en localStorage. Nunca se almacena la contraseña en texto plano.

---

## 📋 Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/snailpay/charge` | Procesar cobro |
| `POST` | `/api/snailpay/admin/system-error` | Activar/desactivar error del sistema |
| `GET`  | `/api/snailpay/admin/status` | Estado del servicio |
| `GET`  | `/health` | Health check |

---

## 🛠 Herramientas y librerías utilizadas

### Frontend
- **React 19** — UI
- **TypeScript** — Tipado estático
- **Vite** — Bundler
- **Recharts** — Gráficas (donut y barras)
- **Web Crypto API** — Hashing de contraseñas (SHA-256)

### Backend
- **Express 4** — HTTP server
- **TypeScript** — Tipado estático
- **tsx** — Ejecución en desarrollo
- **Vitest** — Testing

### IA utilizada
- **Antigravity (Google DeepMind)** — Generación y estructuración del código
- Validación manual de cada decisión de diseño y lógica de negocio

---

## ✅ Funcionalidades completadas

- [x] Registro con nombre, correo y contraseña (SHA-256)
- [x] Inicio de sesión
- [x] Cierre de sesión
- [x] Persistencia de sesión y saldo en LocalStorage
- [x] Dashboard con nombre de usuario y saldo actualizable
- [x] Gráfica tipo donut de apuestas ganadas/perdidas
- [x] Gráfica de barras de victorias por caracol (6 caracoles, 6 carreras)
- [x] Modal de carga de saldo con SnailPay
- [x] Cobro exitoso — saldo actualizado inmediatamente
- [x] Error de transacción — múltiples escenarios
- [x] Error del sistema — endpoint de administración
- [x] Respuestas SnailPay con todos los campos requeridos
- [x] Tarjeta y CVV ficticios guardados en localStorage
- [x] Pruebas unitarias — backend y frontend
