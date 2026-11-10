---
slug: c05-figma
titre: "Maquetter une interface avec Figma"
domaine: Développement web
duree: 120
difficulte: découverte
licence:
  - { niveau: L2, semestre: S3, ue: "Développement front-end et infographie" }
parcours:
  - { parcours: web, ordre: 4 }
ordre: 3
prerequis_cours: []
visibilite: public
objectifs:
  - Situer la maquette dans le cycle de conception (wireframe, maquette, prototype)
  - Maîtriser les bases de Figma (frames, formes, texte, calques, contraintes)
  - Construire des mises en page adaptatives avec l'Auto Layout
  - Créer des composants, des variantes et des styles (couleurs, typographie)
  - Prototyper un parcours et préparer la remise aux développeurs (Dev Mode)
prerequis:
  - Cours « React, composants, props, état et routes » et « Tailwind CSS, styler avec des classes utilitaires »
  - Un compte Figma gratuit
referentiels:
  - Google UX Design Professional Certificate, cours « Build Wireframes and Low-Fidelity Prototypes »
  - W3C, WCAG 2.2 (contrastes, tailles de cible)
  - Jakob Nielsen, « 10 Usability Heuristics for User Interface Design »
quiz:
  - question: "Quel est l'ordre habituel de conception ?"
    choix: ["Prototype, wireframe, maquette", "Wireframe (structure), maquette (apparence), prototype (interactions)", "Code, puis maquette", "Maquette seulement"]
    reponse: 1
    explication: "On valide la structure avant de passer du temps sur les couleurs, puis on rend le tout cliquable pour tester."
  - question: "À quoi sert l'Auto Layout ?"
    choix: ["À dessiner des icônes", "À disposer automatiquement les éléments en ligne ou en colonne avec espacements et marges, comme flexbox", "À exporter en PDF", "À traduire le texte"]
    reponse: 1
    explication: "Un bouton dont le texte s'allonge s'agrandit tout seul : c'est l'équivalent de display: flex et gap."
  - question: "Pourquoi créer un composant pour un bouton ?"
    choix: ["Pour l'exporter", "Pour qu'une modification du composant principal se répercute sur toutes ses instances", "Pour le cacher", "Ce n'est pas utile"]
    reponse: 1
    explication: "Même logique qu'un composant React : une seule source de vérité, réutilisée partout."
  - question: "Quel contraste minimal le WCAG demande-t-il pour un texte normal (niveau AA) ?"
    choix: ["2:1", "4,5:1", "10:1", "Aucun"]
    reponse: 1
    explication: "4,5:1 pour le texte normal, 3:1 pour le grand texte ; un gris clair sur blanc échoue souvent."
  - question: "Que fournit le Dev Mode de Figma aux développeurs ?"
    choix: ["Le code complet de l'application", "Les mesures, espacements, couleurs, typographies et extraits CSS des éléments", "La base de données", "Les tests"]
    reponse: 1
    explication: "Le développeur lit les valeurs exactes au lieu de les deviner sur une image."
---

## Pourquoi maquetter avant de coder ?

Modifier une maquette prend 2 minutes. Modifier une interface déjà codée, testée et déployée prend des heures. Maquetter permet de **valider le parcours** avec les utilisateurs et le Product Owner (voir le cours « Scrum en pratique avec Jira ») **avant** d'écrire la première ligne de code.

**Figma** est l'outil de référence. Il fonctionne dans le navigateur, se partage par un simple lien, et plusieurs personnes peuvent y travailler en même temps.

## Les trois niveaux

| Niveau | Contenu | Objectif |
|---|---|---|
| **Wireframe** | des blocs gris, sans couleur, du texte factice | valider la **structure** et la hiérarchie |
| **Maquette** | les couleurs, la typographie, les images et le contenu réel | valider l'**apparence** |
| **Prototype** | des écrans reliés par des interactions | **tester** le parcours, comme un utilisateur |

## Les bases de Figma

| Élément | Raccourci | Rôle |
|---|---|---|
| **Frame** | `F` | un écran ou un conteneur : choisis un format prédéfini (Desktop 1440, iPhone 15) |
| Rectangle, ellipse | `R`, `O` | des formes |
| Texte | `T` | du texte |
| Panneau Calques | à gauche | la hiérarchie, comme le DOM |
| Panneau Propriétés | à droite | taille, couleurs, effets, Auto Layout |

**Les contraintes** indiquent comment un élément se comporte quand son frame change de taille : collé à gauche, centré, étiré. C'est le premier pas vers le responsive.

## L'Auto Layout, le flexbox de Figma

On sélectionne des éléments, puis `Maj+A`. Le conteneur aligne alors ses enfants **en ligne ou en colonne**, avec un **espacement** (gap) et des **marges intérieures** (padding).

```
Bouton (Auto Layout horizontal, padding 12 × 24, gap 8)
┌────────────────────────────┐
│  [icône]  S'inscrire        │   ← le texte s'allonge, le bouton suit
└────────────────────────────┘
```

| Figma | CSS et Tailwind |
|---|---|
| Auto Layout horizontal | `display: flex` (`flex`) |
| Auto Layout vertical | `flex-direction: column` (`flex-col`) |
| Gap 16 | `gap: 16px` (`gap-4`) |
| Padding 24 | `padding: 24px` (`p-6`) |
| Hug contents | largeur selon le contenu |
| Fill container | `flex: 1` ou `w-full` |

Exemple chiffré : un bouton de texte 16 px, avec un padding de 12 px en haut et en bas, mesure 16 × 1,5 (hauteur de ligne) + 2 × 12 = 24 + 24 = **48 px** de haut. C'est au-dessus de la cible tactile minimale de **44 px** recommandée.

## Composants, variantes et styles

- **Composant** (`Ctrl+Alt+K`) : le bouton principal devient un **modèle**. Ses copies sont des **instances**, mises à jour automatiquement, comme un composant React.
- **Variantes** : un seul composant « Bouton » avec des propriétés `type = principal | secondaire` et `état = normal | survol | désactivé`. On retrouve les props de React.
- **Styles et variables** : couleurs (`vert-saint #0F2A1F`, `bleu #4C8DF6`), textes (Titre 1, Corps), espacements. Les modifier une fois les met à jour partout, comme le `@theme` de Tailwind.

Un ensemble de composants et de styles forme un **design system**. C'est ce qui garantit la cohérence d'une application.

## L'accessibilité dès la maquette

- **Contraste** : au moins 4,5:1 pour le texte normal (WCAG AA). Un plugin comme *Contrast* ou *Stark* le vérifie.
- **Taille des cibles tactiles** : au moins 44 × 44 px.
- La **couleur** ne doit pas être la **seule** information : on ajoute une icône ou un texte à côté d'un bord rouge d'erreur.
- **Hiérarchie** : un seul titre principal, et des tailles de texte qui suivent une échelle (16, 20, 24, 32).

## Prototyper et remettre aux développeurs

- **Le mode Prototype** : on relie un bouton à un écran (au clic, naviguer vers…), avec une animation (*Smart Animate*). Le bouton ▶ lance la démonstration, partageable par lien.
- **Les tests utilisateurs** : on observe 3 à 5 personnes accomplir une tâche sur le prototype, sans les aider. On trouve ainsi l'essentiel des problèmes d'ergonomie.
- **Le Dev Mode** : le développeur clique sur un élément et lit ses dimensions, ses espacements, ses couleurs, sa police, ainsi que des extraits CSS. Les icônes et images s'exportent en SVG ou en PNG.

## Démonstration

On maquette la page « Catalogue » d'une plateforme de cours en ligne :

1. un wireframe ;
2. les styles de couleur (une charte de trois couleurs) ;
3. le composant « Carte de cours », avec des variantes selon le statut (à faire, en cours, terminé) ;
4. la grille de cartes en Auto Layout ;
5. un prototype qui relie une carte à la page du cours ;
6. la lecture des valeurs en Dev Mode, et la correspondance avec le CSS réel (`globals.css`).

## Exercice guidé

1. Crée un composant « Bouton » en Auto Layout, avec 3 variantes : principal, secondaire, désactivé.
2. Vérifie le contraste du texte sur chaque variante.
3. Remplace le texte d'une instance par un texte deux fois plus long, et vérifie que le bouton s'adapte.

## Exercice autonome

Maquette le mini-projet « annuaire » (voir le cours « Scrum en pratique avec Jira ») :

1. Les wireframes de 3 écrans : liste des membres, profil, formulaire d'ajout.
2. Les styles de couleur et de texte, et 4 composants (bouton, champ, carte membre, barre de navigation).
3. Les maquettes en version ordinateur **et** mobile.
4. Un prototype cliquable du parcours « ajouter un membre ».
5. Un test du prototype auprès de 2 personnes, avec 3 problèmes relevés et corrigés.
6. Le lien Figma partagé dans la description de l'Epic Jira.

## Correction

Exercice guidé, ce qu'on attend :

- le composant a un Auto Layout horizontal, un padding de 12 × 24, et des coins arrondis de 8 ;
- les variantes sont regroupées dans un *Component Set* avec la propriété `Type` ;
- le contraste du texte blanc sur le bleu `#4C8DF6` vaut environ **3,2:1**, ce qui est **insuffisant** pour un texte normal (4,5:1).

Pour le corriger, on fonce le bleu (par exemple `#2563EB`, environ 5,2:1) ou on agrandit et met en gras le texte (le seuil passe alors à 3:1 pour du « grand texte »).

> Ce test révèle un piège fréquent : de nombreuses interfaces utilisent ce bleu pour leurs boutons principaux, avec un texte blanc. C'est une bonne première correction à proposer.

Exercice autonome, l'évaluation : les écrans suivent-ils les **heuristiques de Nielsen** ? On vérifie notamment :
- la visibilité de l'état du système (indicateur de chargement, messages après une action) ;
- la prévention des erreurs (validation des champs avant envoi) ;
- la cohérence (mêmes composants partout).

## Pour aller plus loin

- **Figma Variables** et les modes (clair et sombre) préparent un thème dynamique.
- Des plugins exportent les styles Figma en variables CSS ou en thème Tailwind.
- Le site *Refactoring UI* donne d'excellents conseils de design pour les développeurs.
