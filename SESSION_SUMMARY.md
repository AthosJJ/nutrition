# Résumé de session — Coach Nutrition (PWA)

> Document de passation pour reprendre le projet dans une nouvelle session Claude Code.

## ⚠️ À faire AVANT de démarrer la nouvelle session

Le code n'est **pas encore sur GitHub** — le dépôt `AthosJJ/nutrition` est **vide**.
Il n'existe que dans l'archive `nutrition.zip` qui t'a été envoyée. Pour le publier :

```bash
unzip nutrition.zip && cd repo
git push -u origin main
```

(Le commit et le remote `origin` sont déjà configurés dans le `.git` de l'archive.)
Tant que ce push n'est pas fait, une nouvelle session Claude Code « depuis le repo » clonera un dépôt vide.

Pourquoi le push n'a pas pu être fait automatiquement : l'environnement web de cette session
avait un accès **lecture seule** à GitHub (pas de token d'écriture), car la session avait
démarré depuis un handoff de design et non depuis le dépôt connecté.

## Le projet

Application web **PWA** de planning de repas et **batch cooking**, mobile-first iPhone.
Stack : **HTML / CSS / JavaScript vanilla**, aucun build, servie telle quelle (GitHub Pages).

### Fonctionnalités
- **Aujourd'hui** : repas du jour (détection auto du jour), citation, macros du jour
- **Semaine** : planning 7 jours (dimanche → samedi), jour courant mis en évidence
- **Recettes** : groupées par jour + vue détail (ingrédients, étapes, macros, substitution halal, astuce batch)
- **Courses** : liste par rayon, cases cochables persistées en `localStorage`, barre de progression
- **PWA** : installable sur écran d'accueil iOS, fonctionne hors-ligne (service worker)

## Fichiers du dépôt

```
README.md                # doc projet
index.html               # coquille : 4 sections + barre d'onglets        (~5 Ko)
app.js                   # chargement data, rendu, logique « aujourd'hui », persistance  (~22 Ko)
style.css                # styles (thème terracotta)                       (~20 Ko)
data/semaine.json        # ★ LE fichier de contenu, mis à jour chaque semaine  (~14 Ko)
manifest.webmanifest     # PWA
service-worker.js        # cache offline
icons/                   # icon.svg + icon-192.png + icon-512.png + apple-touch-icon.png
```

## Point clé : mettre à jour le menu

Tout le contenu vient de **`data/semaine.json`**. Pour publier un nouveau menu :
écraser ce fichier puis pousser.

Schéma :
- `label_semaine` : changer cette valeur réinitialise les cases cochées des courses
- `jours` : ordre **dimanche → samedi**
- repas (`petit_dejeuner`, `dejeuner`, `diner`) = un **id de recette** ou `null` (créneau libre)
- `collations` = liste d'ids
- chaque id renvoie à un objet de `recettes` (ingrédients, étapes, macros, halal, batch)

## Dév local

```bash
python3 -m http.server 8000   # http://localhost:8000
```
Un serveur statique est nécessaire (le `fetch` de `data/semaine.json` échoue en `file://`).

## Déploiement

GitHub → Settings → Pages → Source : branche `main`, dossier `/ (root)`
→ servie sur `https://athosjj.github.io/nutrition/`

## Notes / dette technique connue

- Les icônes PNG sont des **placeholders** terracotta (carré arrondi uni), valides pour rendre
  la PWA installable. À remplacer par un vrai logo quand souhaité (mêmes noms dans `icons/`).
- `data/semaine.json` contient un menu d'exemple — peut être étoffé.

## Idées de suite possibles

- Menu `semaine.json` plus complet / plusieurs semaines
- Vrai jeu d'icônes / logo
- Génération auto de la liste de courses depuis les ingrédients des recettes sélectionnées
- Ajustement des portions / macros
