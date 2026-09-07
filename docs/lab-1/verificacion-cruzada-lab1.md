# Laboratorio 1 — Verificación cruzada (Paso 4)

Repositorio: https://github.com/albrtaraya/fullstack-lab-1-1ci-cd
Rama evaluada: `main`
Fecha: ____ / ____ / 2026

## Checklist de verificación

| # | Ítem | OK |
|---|------|----|
| 1 | `.gitignore` excluye `node_modules`, `.env` y carpetas de build (`dist/`, `build/`) | ✅ |
| 2 | `git ls-files` no muestra `node_modules` ni `.env` rastreados | ✅ |
| 3 | README tiene nombre, descripción, instalación, variables de entorno (solo nombres) y tabla de comandos | ✅ |
| 4 | El marcador `<!-- BADGE_CI -->` está presente y visible cerca del título | ✅ |
| 5 | La rama `main` rechaza el push directo (se intentó y falló) | ✅ |
| 6 | La regla exige al menos 1 aprobación antes del merge | ✅ |

## Evidencia del push rechazado

Comando ejecutado sobre `main`:

```bash
git checkout main
echo "# prueba de protección" >> README.md
git commit -am "test: intento de push directo a main"
git push origin main
```

Mensaje devuelto por GitHub:

```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote:
remote: - Changes must be made through a pull request.
To https://github.com/albrtaraya/fullstack-lab-1-1ci-cd.git
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs to 'https://github.com/albrtaraya/fullstack-lab-1-1ci-cd.git'
```

Limpieza posterior:

```bash
git reset --soft HEAD~1
git restore --staged README.md
git checkout -- README.md
```

## Firmas

| Rol | Nombre | Firma / Visto bueno |
|-----|--------|---------------------|
| Estudiante evaluado | Alberto Araya | ____________________ |
| Compañero revisor | ____________________ | ____________________ |

## Observaciones

_______________________________________________________________

_______________________________________________________________
