# Laboratorio 2 — Git Quest
### Informe de ejecución

**Estudiante:** Albert Omar Araya Cory
**Repositorio:** https://github.com/albrtaraya/fullstack-lab-1-1ci-cd
**Pull Request:** #1 — https://github.com/albrtaraya/fullstack-lab-1-1ci-cd/pull/1
**Fecha:** 06/09/2026

---

## Prerrequisitos — Diagnóstico rápido

```bash
$ git --version
git version 2.36.1.windows.1

$ node --version
v22.14.0

$ npm --version
10.7.0

$ git branch --show-current
main

$ git pull origin main
Already up to date.
```

| Prerrequisito | Estado |
|---|---|
| Git instalado y funcionando | Cumplido |
| Node.js y npm instalados | Cumplido |
| Autenticación GitHub funcionando (push exitoso previo) | Cumplido |
| `.gitignore` excluye `node_modules`, `.env` y builds | Cumplido (Laboratorio 1) |
| README completo con el marcador `<!-- BADGE_CI -->` | Cumplido (Laboratorio 1) |
| Rama `main` protegida, push directo rechazado | Cumplido (Laboratorio 1) |
| Repositorio local actualizado, sin conflictos | Cumplido |
| Árbol de trabajo limpio | Cumplido (ver nota) |

**Nota sobre el árbol de trabajo:** al iniciar el laboratorio había documentación del
Laboratorio 1 sin confirmar (informe, evidencias y reorganización de `docs/`). Como `main`
está protegida, esos archivos se preservaron en su propia rama `docs/informe-laboratorio-1`
(commit `c0bfd2a`) antes de empezar el circuito, dejando el árbol limpio sin descartar
trabajo.

---

## Estación 1 — Rama Limpia

**Objetivo:** crear una rama de feature partiendo de `main` actualizado, siguiendo la convención.

```bash
$ git checkout main
Switched to branch 'main'

$ git pull origin main
Already up to date.

$ git status --short
(working tree clean)

$ git checkout -b feature/corregir-titulo-e-idioma
Switched to a new branch 'feature/corregir-titulo-e-idioma'

$ git branch --show-current
feature/corregir-titulo-e-idioma
```

**Validación de la convención:**

| Regla | Cumple |
|---|---|
| Prefijo `feature/` | Sí |
| Solo minúsculas | Sí |
| Separación con guiones, sin espacios ni guiones bajos | Sí |
| El nombre describe el cambio | Sí |
| Parte de `main` actualizado (`git pull` previo) | Sí |

**Evidencia:** `01-ramas-en-github.jpg`

**Insignia:** Rama Limpia (5 puntos)

---

## Estación 2 — Cambio Real

**Objetivo:** un cambio pequeño pero genuino y visible en el código.

**Archivo modificado:** `src/layouts/Layout.astro`

**Qué se corrigió:** el layout declaraba `lang="en"` en un sitio cuyo contenido está en
español, y conservaba el título `Astro Basics` heredado del starter de Astro. Ambos son
textos visibles: el idioma afecta a los lectores de pantalla y a la oferta de traducción del
navegador; el título aparece en la pestaña.

Corresponde a la categoría "corregir un texto visible en la interfaz" de la lista de cambios
válidos del laboratorio.

```bash
$ git status --short
 M src/layouts/Layout.astro

$ git diff
diff --git a/src/layouts/Layout.astro b/src/layouts/Layout.astro
index 21bfe59..d6a0865 100644
--- a/src/layouts/Layout.astro
+++ b/src/layouts/Layout.astro
@@ -1,12 +1,12 @@
 <!doctype html>
-<html lang="en">
+<html lang="es">
        <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width" />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" href="/favicon.ico" />
                <meta name="generator" content={Astro.generator} />
-               <title>Astro Basics</title>
+               <title>Laboratorio 1 — Preparar el repositorio para CI</title>
        </head>
        <body>
                <slot />
```

`git diff` devuelve contenido real: 2 líneas añadidas y 2 eliminadas. Adicionalmente se
verificó que `npm run build` sigue completando sin errores (1 página en 5,67 s).

**Evidencia:** `02-diff-del-cambio-real.jpg`

---

## Estación 3 — Commit Convencional

**Objetivo:** confirmar el cambio con un mensaje que siga Conventional Commits.

```bash
$ git add .

$ git commit -m "fix: corregir idioma del documento y titulo generico de la pagina"

$ git log --oneline -1
ae65d0e fix: corregir idioma del documento y titulo generico de la pagina
```

**Justificación del prefijo:** se usó `fix:` porque el cambio corrige dos valores incorrectos
que ya estaban en el código (un idioma mal declarado y un título heredado del starter), no
agrega funcionalidad nueva ni es solo documentación.

| Criterio | Cumple |
|---|---|
| Estructura `<tipo>: <descripción>` | Sí |
| Prefijo correcto según el tipo de cambio | Sí |
| Descripción en minúsculas, sin punto final | Sí |
| La descripción explica el cambio real de la Estación 2 | Sí |
| No es un mensaje genérico ("cambios", "update", "arreglos varios") | Sí |

**Insignia:** Commit Convencional (10 puntos)

---

## Estación 4 — Pull Request Completo

```bash
$ git push -u origin feature/corregir-titulo-e-idioma
 * [new branch]      feature/corregir-titulo-e-idioma -> feature/corregir-titulo-e-idioma
```

**Pull Request #1** — https://github.com/albrtaraya/fullstack-lab-1-1ci-cd/pull/1

**Título:** Corregir el idioma del documento y el título genérico de la página

**Descripción** (plantilla del laboratorio):

> **Qué cambia** — Se corrigió el atributo `lang` del layout, que declaraba `en` en un sitio
> cuyo contenido está en español, y se reemplazó el título `Astro Basics` que venía del
> starter por el nombre real del proyecto.
>
> **Por qué** — Un `lang` incorrecto afecta la accesibilidad: los lectores de pantalla
> pronuncian el contenido con la fonética equivocada, y los navegadores ofrecen traducir una
> página que ya está en el idioma del usuario. El título genérico, además, no identifica el
> proyecto en la pestaña del navegador ni en los resultados de búsqueda.
>
> **Cómo probarlo** — 1) `npm install` y `npm run dev`. 2) Abrir `http://localhost:4321`.
> 3) Verificar que la pestaña muestra "Laboratorio 1 — Preparar el repositorio para CI" en
> lugar de "Astro Basics". 4) Inspeccionar `<html>` y confirmar que el atributo es `lang="es"`.

**Estado:** ABIERTO. No se hizo merge, según indica el laboratorio.

El botón *Merge pull request* aparece **deshabilitado** con la leyenda *Awaiting approval*:
la regla de protección creada en el Laboratorio 1 exige al menos 1 aprobación antes de
integrar. Esto confirma que la protección de `main` funciona de extremo a extremo.

**Evidencias:** `03-formulario-pull-request.jpg`, `04-pull-request-abierto.jpg`,
`05-merge-bloqueado-sin-aprobacion.jpg`

### Revisor asignado — pendiente

No fue posible asignar un revisor: el repositorio no tiene colaboradores y GitHub no permite
que el autor de un Pull Request se asigne a sí mismo como revisor (el selector devuelve
"Nothing to show").

Corresponde al caso previsto en la sección "Solución de problemas frecuentes" del
laboratorio. Para resolverlo:

1. **Settings → Collaborators → Add people**, e invitar al compañero revisor o al docente
   por su usuario de GitHub.
2. Una vez que acepte la invitación, abrir el PR #1 y asignarlo en el panel **Reviewers**.

**Insignia:** Pull Request Perfecto (15 puntos, sujeto a la asignación del revisor)

---

## Checklist final del Git Quest

| Estación | Requisito | Estado |
|---|---|---|
| 1 | La rama sigue la convención `feature/nombre-corto` y parte de `main` actualizado | Cumplido |
| 2 | Cambio real y visible, confirmado con `git diff` | Cumplido |
| 3 | Commit siguiendo Conventional Commits que describe el cambio | Cumplido |
| 4 | Pull Request con título y descripción completa (qué / por qué / cómo probarlo) | Cumplido |
| 4 | Revisor asignado | Pendiente: requiere agregar colaborador |
| — | El Pull Request sigue ABIERTO, sin merge | Cumplido |

---

## Anexo A — Índice de evidencias

| Archivo | Contenido |
|---|---|
| `01-ramas-en-github.jpg` | Ramas del repositorio: `main` protegida y `feature/corregir-titulo-e-idioma` con el PR #1 |
| `02-diff-del-cambio-real.jpg` | Diff del PR sobre `src/layouts/Layout.astro` y estado "Awaiting approval" |
| `03-formulario-pull-request.jpg` | Formulario del PR con título y descripción completos antes de crearlo |
| `04-pull-request-abierto.jpg` | Pull Request #1 abierto con la descripción renderizada |
| `05-merge-bloqueado-sin-aprobacion.jpg` | Botón "Merge pull request" deshabilitado por falta de aprobación |

## Anexo B — Ramas y commits

```
main                                (protegida)
├── docs/informe-laboratorio-1
│   └── c0bfd2a  docs: agregar informe y evidencias del Laboratorio 1
└── feature/corregir-titulo-e-idioma
    └── ae65d0e  fix: corregir idioma del documento y titulo generico de la pagina  -> PR #1
```
