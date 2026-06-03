# Coach Nutrition

Application web (PWA) de planning de repas et batch cooking, conçue mobile-first pour iPhone.
HTML / CSS / JavaScript vanilla — aucun build, servie telle quelle par GitHub Pages.

## Fonctionnalités

- **Aujourd'hui** — repas du jour (détecté automatiquement), citation, macros du jour
- **Semaine** — planning des 7 jours (dimanche → samedi), jour en cours mis en évidence
- **Recettes** — toutes les recettes groupées par jour, avec vue détail (ingrédients, étapes, macros, substitution halal, astuce batch)
- **Notes** — chaque recette se note de 1 à 5 ; bouton « Exporter mes notes » (texte ou JSON) à donner à ton agent
- **Courses** — liste par rayon, cases cochables persistées (localStorage), barre de progression
- **PWA** — installable sur l'écran d'accueil iOS, fonctionne hors-ligne (service worker), bouton de mise à jour

## Mettre à jour le menu de la semaine

Tout le contenu vient d'un seul fichier : **`data/semaine.json`**.
Pour publier un nouveau menu, il suffit d'écraser ce fichier puis de pousser sur GitHub.

Schéma : voir le fichier existant. Points clés :
- `jours` est dans l'ordre **dimanche → samedi**
- une valeur de repas (`petit_dejeuner`, `dejeuner`, `diner`) est un **id de recette** ou `null` (= créneau libre)
- `collations` est une liste d'ids
- chaque id renvoie à un objet de `recettes`
- changer `label_semaine` réinitialise automatiquement les cases cochées des courses
- champ optionnel `prep_dimanche` sur une recette : affiché en encadré « Prep du dimanche » dans la fiche, **uniquement si `batch_cooking` vaut `true`** (absent = rien)

> Les **notes des recettes** sont stockées séparément (localStorage, indexées par **nom** de recette), donc remplacer `data/semaine.json` ne les efface jamais.

## Structure

```
├── index.html              # coquille : 4 sections + barre d'onglets
├── app.js                  # chargement data, rendu, logique « aujourd'hui », persistance
├── style.css               # styles
├── manifest.webmanifest    # PWA
├── service-worker.js       # cache offline
├── data/
│   └── semaine.json        # LE fichier mis à jour chaque semaine
└── icons/
```

## Développement local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Un simple serveur statique suffit (le `fetch` de `data/semaine.json` ne fonctionne pas via `file://`).

## Déploiement (GitHub Pages)

Settings → Pages → Source : branche `main`, dossier `/ (root)`.
L'app sera servie à `https://athosjj.github.io/nutrition/`.
