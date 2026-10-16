# ShifuMiJS

Jeu Pierre - Feuille - Ciseaux avec 4 niveaux de difficulté, du plus simple au plus stratégique.


## Niveaux de difficulté

| Niveau | Nom | Stratégie IA |
|--------|-----|--------------|
| 1 | Facile | 100 % aléatoire |
| 2 | Intermédiaire | Chaîne de Markov d'ordre 2 (fenêtre glissante des 10 derniers coups) avec récence pondérée |
| 3 | Élevé | Markov d'ordre 2 + détection du pattern « joueur joue le contre de l'IA » |
| 4 | Expert | Markov + anti-pattern + bluff (1 coup sur 7 joué au hasard pour piéger) |


## Lancer en local

Le jeu est 100 % statique (HTML / JS vanilla, aucune dépendance à bundler).

**Option 1 — Ouverture directe**
Ouvrir simplement `index.html` dans un navigateur moderne.

**Option 2 — Serveur HTTP local** (recommandé pour éviter les restrictions `file://`)
```bash
python -m http.server 8000
```
Puis accéder à `http://localhost:8000`.

**Raccourcis clavier** : `1` = Pierre, `2` = Feuille, `3` = Ciseaux.


## Auteur

- [@prudhomme-dev](https://github.com/prudhomme-dev)


## Licence

[CreativeCommons BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)


## Demo

https://shifumi.cedric-prudhomme.fr/
