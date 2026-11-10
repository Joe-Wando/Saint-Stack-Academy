---
slug: g06-0b-tailwind
titre: Tailwind CSS, styler avec des classes utilitaires
domaine: Développement web
duree: 90
difficulte: bases
licence:
  - { niveau: L2, semestre: S3, ue: "Développement front-end et infographie" }
parcours:
  - { parcours: web, ordre: 5 }
ordre: 2
prerequis_cours: [g06-0a-react]
visibilite: public
objectifs:
  - Expliquer l'approche utilitaire de Tailwind et la comparer à Bootstrap
  - Installer Tailwind CSS 4 dans un projet Vite et React
  - Utiliser les classes d'espacement, de typographie, de couleur, de flexbox et de grille
  - Rendre une interface responsive avec les préfixes sm, md et lg
  - Gérer les états (hover, focus) et le mode sombre, et personnaliser le thème
prerequis:
  - Séance « React, composants, props, état et routes »
  - Bases de CSS (boîte, flexbox)
referentiels:
  - Cours « Introduction à Tailwind CSS » de M. Harouna Soumaré (Software and DevOps engineer), base de cette séance
  - Documentation officielle tailwindcss.com (version 4)
  - W3C, WCAG 2.2, critère 1.4.3 « Contraste minimum »
quiz:
  - question: "Quelle est l'approche de Tailwind ?"
    choix: ["Des composants prêts à l'emploi comme .btn ou .card", "Des classes utilitaires qui appliquent chacune une propriété CSS", "Un préprocesseur comme Sass", "Une bibliothèque JavaScript d'animations"]
    reponse: 1
    explication: "p-4 ajoute un padding, text-lg une taille de texte, bg-blue-600 une couleur de fond : on compose le style directement dans le HTML."
  - question: "Que signifie la classe md:grid-cols-3 ?"
    choix: ["Toujours 3 colonnes", "3 colonnes à partir de la largeur md (768 px)", "3 colonnes en dessous de 768 px", "Une marge de 3"]
    reponse: 1
    explication: "Tailwind part du mobile (mobile first) : sans préfixe, la classe s'applique partout ; md: s'applique à partir de 768 px de large."
  - question: "Comment installe-t-on Tailwind 4 dans un projet Vite ?"
    choix: ["npx tailwindcss init puis @tailwind base", "npm install tailwindcss @tailwindcss/vite, le plugin dans vite.config, puis @import \"tailwindcss\" dans le CSS", "Avec un lien CDN Bootstrap", "Tailwind ne fonctionne pas avec Vite"]
    reponse: 1
    explication: "La commande init et les directives @tailwind sont celles de la version 3. La version 4 se configure par le plugin et une seule ligne @import."
  - question: "Pourquoi le CSS final de Tailwind est-il léger ?"
    choix: ["Il n'utilise pas de couleurs", "Il ne génère que les classes réellement présentes dans tes fichiers", "Il est compressé en image", "Il ne fonctionne qu'en mode sombre"]
    reponse: 1
    explication: "Tailwind analyse tes fichiers et ne produit que les classes utilisées, ce qui donne souvent moins de 10 Ko compressés."
  - question: "Quelle classe change la couleur d'un bouton au survol ?"
    choix: ["hover:bg-blue-700", "bg-blue-700:hover", "on-hover-blue", "focus:bg-blue-700"]
    reponse: 0
    explication: "Le préfixe d'état se place avant la classe : hover:, focus:, active:, disabled:, et dark: pour le mode sombre."
---

> Cette séance reprend le cours « Introduction à Tailwind CSS » de **M. Harouna Soumaré**, que je remercie. L'installation a été mise à jour pour Tailwind 4, la version actuelle.

## Qu'est-ce que Tailwind CSS ?

Tailwind est un **framework CSS** qui fournit des **classes utilitaires**. Chaque classe applique une seule propriété CSS : `p-4` ajoute un padding, `text-xl` une taille de texte, `bg-teal-600` une couleur de fond. On compose ainsi le design **directement dans le balisage**, sans écrire de fichier CSS.

```html
<button class="rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700">
  S'inscrire
</button>
```

## Qu'est-ce qu'un framework ?

Le mot vient de *frame* (cadre) et *work* (travail) : c'est une **boîte à outils** qui fournit un cadre et des éléments prêts à l'emploi pour développer plus vite un site ou une application.

## Pourquoi Tailwind ?

- **Productivité** : on ne cherche plus de noms de classes, et on ne passe plus d'un fichier à l'autre.
- **Personnalisation** : rien n'est imposé, et le design ne ressemble pas à celui de tous les autres sites.
- **Performance** : seules les classes utilisées sont générées.
- **Cohérence** : les espacements et les couleurs suivent une **échelle**, ce qui évite les valeurs au hasard.

## Un frontend performant

Un bon frontend n'est pas seulement « joli ». Il repose sur sept piliers :

1. la vitesse ;
2. l'ergonomie ;
3. l'**accessibilité**, à savoir le contraste, la navigation au clavier et des textes lisibles ;
4. une bonne expérience utilisateur ;
5. le design **responsive** ;
6. un code propre et maintenable ;
7. la performance perçue, c'est-à-dire des états de chargement clairs.

Tailwind aide surtout pour les piliers 3, 5 et 6.

## Tailwind et Bootstrap

| Critère | Tailwind CSS | Bootstrap |
|---|---|---|
| Approche | Classes utilitaires | Composants prédéfinis (`.btn`, `.card`) |
| Flexibilité | Très grande, sans style imposé | Les sites se ressemblent si on ne surcharge pas le style |
| Prise en main | Il faut apprendre les classes | Plus rapide au début |
| Personnalisation | Thème en CSS (`@theme`) | Variables Sass, surcharges |
| Poids du CSS | Seulement les classes utilisées | Fichier complet |
| Grille | Flexbox et CSS Grid libres | Grille à 12 colonnes |

Les deux permettent de construire rapidement des interfaces responsives.

## Installer Tailwind 4 avec Vite et React

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({ plugins: [react(), tailwindcss()] });
```

```css
/* src/index.css, importé dans main.tsx */
@import "tailwindcss";
```

> **Mise à jour.** Les commandes `npx tailwindcss init`, le fichier `tailwind.config.js` et les directives `@tailwind base; @tailwind components; @tailwind utilities;` sont celles de **Tailwind 3**. Tu les rencontreras dans d'anciens projets et tutoriels. La version 4, sortie en 2025, n'a plus besoin de fichier de configuration : elle détecte toute seule tes fichiers.

Sans Vite, la CLI fonctionne aussi :

```bash
npm install tailwindcss @tailwindcss/cli
npx @tailwindcss/cli -i ./src/input.css -o ./src/output.css --watch
```

Il suffit ensuite d'ajouter `<link href="./output.css" rel="stylesheet">` dans le `<head>`.

L'extension VS Code **Tailwind CSS IntelliSense** complète automatiquement les classes. Elle est indispensable.

## Les classes essentielles

L'échelle d'espacement : **1 unité = 0,25 rem = 4 px**. Ainsi, `p-4` vaut 16 px et `mt-8` vaut 32 px.

| Famille | Exemples | Effet |
|---|---|---|
| Espacement | `p-4`, `px-6`, `mt-2`, `gap-4`, `space-y-2` | padding, marge, espace entre les enfants |
| Taille | `w-full`, `max-w-md`, `h-12`, `min-h-screen` | largeur et hauteur |
| Texte | `text-sm` à `text-5xl`, `font-bold`, `text-center`, `leading-relaxed` | typographie |
| Couleur | `text-gray-700`, `bg-teal-600`, `border-gray-200` | nuances de 50 à 950 |
| Bordure | `border`, `rounded-lg`, `rounded-full`, `shadow-md` | contour, arrondi, ombre |
| Flexbox | `flex`, `items-center`, `justify-between`, `flex-col` | alignement |
| Grille | `grid`, `grid-cols-3`, `col-span-2` | colonnes |

Exemple chiffré : `px-6 py-3` donne 24 px de marge intérieure à gauche et à droite, et 12 px en haut et en bas.

## Le responsive, mobile d'abord

Une classe sans préfixe s'applique **partout**. Un préfixe l'active **à partir de** cette largeur :

| Préfixe | Largeur minimale |
|---|---|
| `sm:` | 640 px |
| `md:` | 768 px |
| `lg:` | 1024 px |
| `xl:` | 1280 px |

```html
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">…</div>
```

Ce code affiche 1 colonne sur téléphone, 2 sur tablette et 4 sur ordinateur.

## États et mode sombre

```html
<input class="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
<button class="bg-teal-600 hover:bg-teal-700 active:scale-95 disabled:opacity-50">OK</button>
<div class="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">…</div>
```

Ne retire jamais le contour de focus sans le remplacer par un `ring`, car les personnes qui naviguent au clavier en ont besoin.

## Personnaliser le thème

```css
@import "tailwindcss";

@theme {
  --color-saint-vert: #0F2A1F;
  --color-saint-bleu: #4C8DF6;
  --font-display: "Poppins", sans-serif;
}
```

Les classes `bg-saint-vert`, `text-saint-bleu` et `font-display` sont alors générées automatiquement.

## Avec React

On remplace `class` par `className`. Pour des classes **conditionnelles**, on utilise un gabarit de chaîne :

```tsx
<span className={`rounded-full px-2 py-1 text-xs ${enStock ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
  {enStock ? 'En stock' : 'Rupture'}
</span>
```

N'assemble jamais un nom de classe par morceaux, comme `bg-${couleur}-600` : Tailwind ne le verrait pas dans tes fichiers et ne générerait pas la classe.

## Démonstration

On reprend la vitrine React de la séance précédente et on la style :

- un en-tête `flex justify-between items-center` ;
- une grille de cartes responsive ;
- des cartes `rounded-xl shadow` avec un effet `hover:shadow-lg` ;
- un bouton aux couleurs de Saint Stack.

## Exercice guidé

Reproduis cette carte de profil avec Tailwind uniquement :

- un fond blanc, des coins arrondis, une ombre, une largeur maximale `max-w-sm` et le centrage horizontal ;
- un avatar rond de 64 px (`h-16 w-16 rounded-full`), puis à côté le nom en gras et le métier en gris ;
- deux boutons en bas : « Suivre », plein et teal, et « Message », avec une bordure ;
- en mode sombre, un fond gris foncé et un texte clair.

## Exercice autonome

Construis la page d'accueil d'une école de code fictive, entièrement en Tailwind :

1. Une barre de navigation, avec le logo à gauche et les liens à droite. Sur mobile, les liens passent en dessous.
2. Une section d'accroche, avec un titre `text-4xl md:text-6xl` et deux boutons.
3. Une grille de 6 cartes « formation » : 1 colonne sur mobile, 2 sur tablette, 3 sur ordinateur.
4. Un pied de page sombre.
5. Ajoute deux couleurs de marque dans `@theme` et utilise-les.

Vérifie le rendu en réduisant la fenêtre, ou avec le mode appareil des outils de développement (F12).

## Correction

Exercice guidé :

```tsx
export default function CarteProfil() {
  return (
    <div className="mx-auto mt-10 max-w-sm rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <img className="h-16 w-16 rounded-full object-cover" src="https://i.pravatar.cc/128" alt="Photo de profil d'Awa Diop" />
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Awa Diop</p>
          <p className="text-gray-500 dark:text-gray-400">Développeuse front-end</p>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button className="flex-1 rounded-lg bg-teal-600 py-2 font-semibold text-white hover:bg-teal-700 focus:ring-2 focus:ring-teal-400">Suivre</button>
        <button className="flex-1 rounded-lg border border-gray-300 py-2 font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700">Message</button>
      </div>
    </div>
  );
}
```

Exercice autonome, le point délicat est la barre de navigation responsive :

```tsx
<nav className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
  <span className="text-xl font-bold text-saint-vert">CodeSchool</span>
  <ul className="flex gap-4 text-gray-600"><li>Formations</li><li>Tarifs</li><li>Contact</li></ul>
</nav>
<section className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">{/* 6 cartes */}</section>
```

Sur mobile, `flex-col` empile le logo et les liens. À partir de `md`, `flex-row` les remet sur une seule ligne.

## Pour aller plus loin

- play.tailwindcss.com permet de s'exercer dans le navigateur, sans installation.
- shadcn/ui fournit des composants React accessibles construits avec Tailwind.
- Tailwind UI et Flowbite proposent des exemples de mises en page dont on peut s'inspirer.
