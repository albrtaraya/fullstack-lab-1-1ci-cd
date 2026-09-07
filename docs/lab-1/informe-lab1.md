# Laboratorio 1 — Preparar el repositorio para CI
### Informe de ejecución

**Estudiante:** Albert Araya
**Repositorio:** https://github.com/albrtaraya/fullstack-lab-1-1ci-cd
**Rama:** `main`
**Fecha:** 06/09/2026

---

## Paso 1 — Auditoría rápida del repositorio

Se revisó el `.gitignore` de la raíz y se completó para cubrir el mínimo exigido por el laboratorio:

```
# Dependencias
node_modules/

# Variables de entorno
.env
.env.local
.env.production
.env.*.local

# Builds
dist/
build/

# Tipos generados por Astro
.astro/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Archivos de IDE y sistema operativo
.vscode/
.idea/
.DS_Store
```

**Verificación (sección 1.3):**

```bash
$ git ls-files | grep -E "node_modules|\.env$"
(sin resultados)
```

Ni `node_modules/` ni `.env` están versionados, por lo que no fue necesario ejecutar
`git rm -r --cached`.

Adicionalmente se comprobó que `dist/` queda fuera del control de versiones: tras correr
`npm run build`, `git status` devuelve el árbol limpio.

**Pendiente menor:** los archivos `.vscode/extensions.json` y `.vscode/launch.json` fueron
versionados en el commit inicial de Astro, antes de que `.vscode/` entrara al `.gitignore`.
Siguen rastreados y deben sacarse con `git rm -r --cached .vscode`. Como `main` ya está
protegida, ese cambio entrará por Pull Request en el Laboratorio 2. No afecta los
entregables del Laboratorio 1, que solo exigen `node_modules` y `.env` fuera del tracking.

**Commit:** `4fc2cc1 chore: completar .gitignore (env, builds, IDE) y sacar .vscode del tracking`

### ✅ Checkpoint 1
- [x] El `.gitignore` existe y cubre `node_modules`, `.env`, `dist`/`build` y archivos de IDE.
- [x] Se confirmó con `git ls-files` que `node_modules` y `.env` ya no aparecen rastreados.

---

## Paso 2 — README mínimo viable

Se completó `README.md` reemplazando todos los `[placeholder]` de la plantilla por la
información real del proyecto:

| Sección | Contenido |
|---|---|
| Nombre y descripción | "Laboratorio 1 — Preparar el repositorio para CI". Sitio Astro que sirve de base para el pipeline de la Sesión 2. |
| Instalación local | `git clone` con la URL real, `cd fullstack-lab-1-1ci-cd`, `npm install`. Se documenta el requisito Node.js `>=22.12.0`. |
| Variables de entorno | `DATABASE_URL`, `JWT_SECRET`, `PORT` — solo nombres, sin valores reales. |
| Comandos disponibles | `npm run dev`, `npm run build`, `npm run preview` y `npm test` marcado como *pendiente — Sesión 3*. |
| Base de datos | PostgreSQL con migraciones y seeds gestionados con Prisma. |

El marcador `<!-- BADGE_CI -->` quedó inmediatamente debajo de la descripción, donde en la
Sesión 2 se insertará el badge de estado del pipeline.

Las instrucciones de instalación son ejecutables tal cual: se validó que `npm run build`
completa correctamente (1 página generada en 19.4 s).

**Evidencia:** capturas `05-readme-instalacion-y-env.jpg` y `06-readme-comandos-y-base-datos.jpg`

**Commit:** `8826f36 docs: completar README con instalación, comandos y marcador de badge`

### ✅ Checkpoint 2
- [x] El README tiene nombre, descripción, instalación, variables de entorno (solo nombres) y tabla de comandos.
- [x] El marcador `<!-- BADGE_CI -->` está presente y visible.

---

## Paso 3 — Protección de la rama `main`

Ruta seguida: **Settings → Branches → Add classic branch protection rule**.

### Configuración aplicada

| Campo | Valor |
|---|---|
| Branch name pattern | `main` |
| Require a pull request before merging | ✅ Activado |
| Require approvals | ✅ Activado — 1 aprobación mínima |
| Require status checks to pass before merging | ✅ Activado (aún sin checks: "No checks have been added", se completa en la Sesión 2) |
| Do not allow bypassing the above settings | ✅ Activado |

> **Nota sobre la última casilla:** no aparece en la tabla 3.2 del laboratorio, pero es
> necesaria para que la verificación 3.3 funcione. Sin ella, GitHub permite que el
> administrador del repositorio (el propio dueño) haga *bypass* de la regla y el push
> directo se completaría sin error, dando un falso negativo.

**Evidencia:** capturas `01-regla-patron-main-y-pull-request.jpg`,
`02-require-approvals-1-y-status-checks.jpg`, `03-regla-creada-branch-protection.jpg`
y `07-regla-activa-en-settings-branches.jpg`

### Verificación 3.3 — el push directo debe ser rechazado

```bash
$ git checkout main
$ echo "# prueba de protección" >> README.md
$ git commit -am "test: intento de push directo a main"
[main 768efc4] test: intento de push directo a main
 1 file changed, 1 insertion(+)

$ git push origin main
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote:
remote: - Changes must be made through a pull request.
To https://github.com/albrtaraya/fullstack-lab-1-1ci-cd.git
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs to 'https://github.com/albrtaraya/fullstack-lab-1-1ci-cd.git'
```

El push fue **rechazado** con `protected branch hook declined`, tal como exige el laboratorio.

### Limpieza del commit de prueba

```bash
$ git reset --soft HEAD~1
$ git restore --staged README.md
$ git checkout -- README.md
$ git status --short
(árbol limpio)
```

El README quedó exactamente como al terminar el Paso 2.

### ✅ Checkpoint 3
- [x] La regla de protección de `main` está creada con las 3 casillas activadas.
- [x] Se intentó un push directo a `main` y fue rechazado.
- [x] Se deshizo el commit de prueba y el README quedó como en el Paso 2.

---

## Paso 4 — Verificación cruzada en parejas

Checklist preparado en `docs/verificacion-cruzada-lab1.md`, con la evidencia del push
rechazado ya incorporada. Pendiente la firma del compañero revisor durante la sesión
presencial.

---

## Entregable final

| Requisito | Estado |
|---|---|
| `.gitignore` actualizado y sin `node_modules` ni `.env` rastreados | ✅ |
| `README.md` con las 4 secciones completas y el marcador `<!-- BADGE_CI -->` | ✅ |
| Rama `main` protegida: PR obligatorio, 1 aprobación mínima y status checks requeridos | ✅ |
| Verificación cruzada firmada por un compañero | ⏳ Pendiente de firma |

**Insignia:** 🛡️ Guardián de Main (10 puntos) — Paso 3 completado y verificado.

---

## Anexo — Índice de evidencias

| Archivo | Muestra |
|---|---|
| `01-regla-patron-main-y-pull-request.jpg` | Patrón `main` y "Require a pull request before merging" activado |
| `02-require-approvals-1-y-status-checks.jpg` | "Require approvals: 1" y "Require status checks to pass before merging" |
| `03-regla-creada-branch-protection.jpg` | Confirmación "Branch protection rule created" |
| `04-repositorio-github.jpg` | Vista general del repositorio con los commits del laboratorio |
| `05-readme-instalacion-y-env.jpg` | README renderizado: instalación y variables de entorno |
| `06-readme-comandos-y-base-datos.jpg` | README renderizado: tabla de comandos y base de datos |
| `07-regla-activa-en-settings-branches.jpg` | Regla `main` activa en Settings → Branches |

## Anexo — Commits del laboratorio

```
62c8c55  docs: agregar checklist de verificacion cruzada del Laboratorio 1
8826f36  docs: completar README con instalación, comandos y marcador de badge
4fc2cc1  chore: completar .gitignore (env, builds, IDE) y sacar .vscode del tracking
```
