# Laboratorio 1 — Preparar el repositorio para CI

Sitio web construido con Astro que sirve de base para el Módulo IV: sobre este
repositorio se monta el pipeline de integración continua de la Sesión 2.

[![CI](https://github.com/albrtaraya/fullstack-lab-1-1ci-cd/actions/workflows/ci.yml/badge.svg)](https://github.com/albrtaraya/fullstack-lab-1-1ci-cd/actions/workflows/ci.yml)

## 🚀 Instalación local

```bash
git clone https://github.com/albrtaraya/fullstack-lab-1-1ci-cd.git
cd fullstack-lab-1-1ci-cd
npm install
```

Requiere Node.js `>=22.12.0`.

### Variables de entorno

Crea un archivo `.env` en la raíz con las siguientes claves (sin valores reales en este documento):

```
DATABASE_URL=
JWT_SECRET=
PORT=
```

## 📜 Comandos disponibles

| Comando           | Descripción                                            |
| ----------------- | ------------------------------------------------------ |
| `npm run dev`     | Levanta el entorno de desarrollo en `localhost:4321`   |
| `npm run build`   | Genera el build de producción en `dist/`               |
| `npm run preview` | Sirve localmente el build de producción                |
| `npm test`        | Corre las pruebas automatizadas (pendiente — Sesión 3) |

## 🗄️ Base de datos

PostgreSQL con migraciones y seeds gestionados con Prisma (ver Módulo 2).
