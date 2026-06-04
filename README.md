# PokéQuiz — Le Monde des Ombres

Quiz Pokémon interactif sur le thème de **Giratina** : 5 mini-jeux, 100 % HTML/CSS/JS.

## ▶️ Jouer en ligne

**→ https://nhebachi57.github.io/Pokequiz/** (hébergé sur GitHub Pages, branche `main`).

Mis à jour automatiquement à chaque push sur `main`.

## 🚀 Jouer en local (le plus simple)

Double-clique **`index.html`** à la racine. C'est tout.

Les fichiers à la racine sont **autonomes** : le CSS et le JavaScript sont intégrés
directement dans chaque page. Chaque jeu fonctionne donc même ouvert seul, sans
serveur ni réglage. (Pense quand même à **extraire le .zip** avant d'ouvrir, sinon
les liens entre les pages ne marcheront pas.)

> Les sprites 3D animés sont chargés depuis Internet (Pokémon Showdown + PokéAPI).
> Une connexion est requise pour les images ; le reste marche hors ligne.

## 📁 Arborescence

```
pokequiz/
├── index.html              # Menu principal (hub Giratina) — AUTONOME
├── jeu-silhouette.html     # « C'est qui ce Pokémon ? »      — AUTONOME
├── jeu-types.html          # Quiz des Types                  — AUTONOME
├── jeu-capacites.html      # Capacités / attaques            — AUTONOME
├── jeu-pokedex.html        # Quiz Pokédex                    — AUTONOME
├── jeu-musique.html        # Studio Sonore (musical)         — AUTONOME
├── README.md
└── sources/                # Source unique pour MODIFIER le jeu
    ├── css/style.css       # Thème Giratina (couleurs, layout, animations)
    └── js/core.js          # Données + audio + moteur de quiz
```

## ✏️ Modifier le jeu

Pour garder les choses propres, **édite les fichiers de `sources/`** (source unique),
pas les fichiers autonomes de la racine.

- Changer un Pokémon → `sources/js/core.js`, tableau `ROSTER` :

```js
{
  name:"Dracaufeu",     // nom français affiché
  slug:"charizard",     // nom anglais → sprite Pokémon Showdown
  id:6,                 // n° National Dex → sprite de secours PokéAPI
  type:["Feu","Vol"],
  region:"Kanto",
  weak:["Roche","Eau","Électrik"],
  moves:["Lance-Flammes","Déflagration","Vol","Crocs Feu"],
  sig:"Déflagration",   // capacité signature
  lore:"Crache un feu si chaud…"
}
```

- Changer le thème → `sources/css/style.css`.
- Questions musicales → `MUSIC_BANK` dans `core.js`.

Après modification de `sources/`, il faut **régénérer** les fichiers autonomes
(ou demande-moi de le faire). Pour développer « à la mode dev » avec fichiers séparés,
lance un petit serveur local depuis `sources/` adapté, ou ouvre via un serveur statique.

> Les emplacements **Dracaufeu** et **Rayquaza** sont temporaires : à remplacer par
> tes 2 Pokémon préférés.

## 🎮 Contenu

5 jeux × 5 modes (Sprint 10 · Défi 20 · Marathon 50 · Infini ∞ · Survie 3 vies/12 s).
Base de 41 Pokémon, table des 18 types, particules, score / séries / résultats.

## 🎧 Studio Sonore — quiz « vraie musique »

Le mini-jeu musical fait écouter un **vrai thème des jeux Pokémon**, joué par le
**lecteur YouTube officiel intégré** (titre masqué, à reconnaître à l'oreille). Rien
n'est hébergé dans le dépôt : on ne fait que **référencer** les vidéos — donc **une
connexion internet est requise** pour ce mini-jeu.

Chaque morceau forme **une seule question, jouée en 3 temps** (et non trois questions) :

1. **Console** de première apparition (Game Boy → Nintendo Switch) ;
2. **Jeu** de première apparition ;
3. **Zone / lieu** associé.

On répond aux trois indices l'un après l'autre, puis tout est validé d'un coup : la
question compte juste si les **trois** parties sont correctes. Un **contrôle de volume**
(curseur + coupure) est intégré au lecteur et mémorisé.

> La base contient **57 thèmes réels vérifiés** couvrant les 6 consoles et les
> **9 générations** (Game Boy → Nintendo Switch), **remakes inclus** (Rouge Feu/Vert
> Feuille, HeartGold/SoulSilver, Rubis Oméga/Saphir Alpha, Diamant Étincelant/Perle
> Scintillante, Let's Go) et la **9G** (Écarlate/Violet). Les identifiants de vidéos vivent
> dans le tableau `OST` (2ᵉ `<script>` de `jeu-musique.html`) et sont faciles à mettre à
> jour si une vidéo est un jour supprimée.

## 🏆 Records persistants

Tes meilleurs scores sont mémorisés **sur ton appareil** (localStorage, aucun compte
ni serveur). Pour chaque jeu **et** chaque mode, le jeu retient ton meilleur score, ta
meilleure précision et ta plus longue série :

- sous chaque carte de mode → ton record actuel (ou « Aucun record » la première fois) ;
- sur l'écran de résultats → mise en avant **« ★ Nouveau record ! »** quand tu te dépasses ;
- sur le menu principal → la **meilleure précision** atteinte par jeu, plus un bouton
  *Réinitialiser les records* (apparaît dès qu'au moins un record existe).

> Les records sont liés au navigateur utilisé. Vider les données du site les efface.

## 🖼️ Crédits

Sprites : Pokémon Showdown + PokéAPI (rendus 3D HOME / artworks).
Pokémon © Nintendo / Game Freak / The Pokémon Company. Projet de fan non commercial.
