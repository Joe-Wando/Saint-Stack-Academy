---
slug: g06-0a-react
titre: React, composants, props, état et routes
domaine: Développement web
duree: 150
difficulte: bases
licence:
  - { niveau: L2, semestre: S3, ue: "Développement front-end et infographie" }
parcours:
  - { parcours: web, ordre: 6 }
ordre: 1
prerequis_cours: []
visibilite: public
objectifs:
  - Expliquer ce qu'est React, une bibliothèque, et le rôle du DOM virtuel
  - Créer un projet React et TypeScript avec Vite
  - Écrire des composants en JSX et leur passer des props
  - Afficher conditionnellement et afficher des listes avec map et key
  - Gérer un état avec useState et charger des données avec useEffect
  - Créer plusieurs pages avec React Router
prerequis:
  - HTML, CSS et JavaScript (fonctions fléchées, map, déstructuration)
  - Node.js installé
referentiels:
  - Cours « Introduction à React » de M. Harouna Soumaré (Software and DevOps engineer), base de ce cours
  - Documentation officielle react.dev, sections « Learn » et « Reference »
  - Meta Front-End Developer Professional Certificate, cours « React Basics »
quiz:
  - question: "Pourquoi dit-on que React est une bibliothèque et non un framework ?"
    choix: ["Parce qu'il est gratuit", "Parce qu'il ne gère que l'interface et te laisse choisir le reste (routes, requêtes, état global)", "Parce qu'il n'utilise pas JavaScript", "Parce qu'il est plus lent"]
    reponse: 1
    explication: "Une bibliothèque fournit des outils que tu appelles ; un framework impose un cadre complet. React ne s'occupe que des composants d'interface."
  - question: "Que sont les props ?"
    choix: ["Des variables globales", "Des données passées d'un composant parent à un composant enfant, en lecture seule", "Des styles CSS", "Des routes"]
    reponse: 1
    explication: "Le parent écrit <Carte nom=\"Awa\" /> et l'enfant reçoit { nom }. L'enfant ne doit jamais modifier ses props."
  - question: "Pourquoi écrire setCompteur(compteur + 1) plutôt que compteur = compteur + 1 ?"
    choix: ["C'est plus court", "Le setter prévient React que l'état a changé, ce qui redessine le composant", "Les deux font la même chose", "Pour éviter une erreur TypeScript seulement"]
    reponse: 1
    explication: "Modifier la variable directement ne déclenche aucun nouveau rendu. Seul le setter de useState le fait."
  - question: "Pourquoi React exige-t-il une prop key dans un map ?"
    choix: ["Pour le style", "Pour identifier chaque élément et mettre à jour la liste efficacement", "Pour trier la liste", "Ce n'est pas obligatoire"]
    reponse: 1
    explication: "La key, stable et unique (un id de préférence à l'index), permet au DOM virtuel de savoir quel élément a été ajouté, retiré ou déplacé."
  - question: "Avec useEffect(() => { ... }, []), quand l'effet s'exécute-t-il ?"
    choix: ["À chaque rendu", "Une seule fois, après le premier affichage", "Jamais", "À chaque clic"]
    reponse: 1
    explication: "Le tableau de dépendances vide signifie que l'effet ne dépend de rien : il ne s'exécute qu'après le premier affichage. C'est le cas typique d'un appel à une API."
---

> Ce cours reprend le cours « Introduction à React » de **M. Harouna Soumaré**, que je remercie. Les exemples ont été complétés et mis à jour pour React 19, Vite et TypeScript.

## Qu'est-ce que React ?

React est une **bibliothèque JavaScript** créée par Facebook (aujourd'hui Meta) pour construire des **interfaces utilisateur** à partir de **composants**. On l'utilise surtout pour des applications monopage (**SPA**, *single page application*) : le navigateur charge une seule page HTML, puis JavaScript met à jour son contenu sans jamais la recharger.

### Bibliothèque ou framework ?

Une **bibliothèque** est un ensemble de fonctions déjà écrites que **tu appelles** quand tu en as besoin. Un **framework** est un cadre complet qui **t'appelle** et impose une organisation.

React ne s'occupe que de l'affichage. Pour les routes, les requêtes ou l'état global, tu choisis tes outils. Angular, à l'inverse, est un framework qui fournit tout.

| | React | Angular |
|---|---|---|
| Nature | Bibliothèque d'interface | Framework complet |
| Langage | JavaScript ou TypeScript, avec JSX | TypeScript obligatoire |
| Organisation | Libre | Imposée (modules, services) |
| Apprentissage | Plus rapide au départ | Plus long |
| Mobile | React Native | Ionic, NativeScript |

## Le DOM virtuel

Le **DOM** est l'arbre des éléments de la page. Le modifier directement coûte cher, car le navigateur doit recalculer la mise en page et redessiner.

React garde en mémoire une copie légère de cet arbre, le **DOM virtuel**. Quand une donnée change :

1. React calcule le nouveau DOM virtuel ;
2. il le **compare** à l'ancien, une étape appelée réconciliation ;
3. il n'applique au vrai DOM **que les différences**.

> Analogie : plutôt que de repeindre toute la maison pour une tache sur un mur, React repère la tache et ne repeint que ce mur.

## Pourquoi React ?

- **Composants réutilisables** : un bouton, une carte produit ou un menu s'écrivent une fois et servent partout.
- **Interfaces interactives** : les likes, la recherche instantanée, les paniers se mettent à jour sans rechargement.
- **JSX** : on écrit un balisage proche du HTML directement dans le JavaScript.
- **Écosystème** : React Router, Tailwind CSS, Material UI, Next.js (voir le cours « Next.js, pages, layouts et routage (App Router) ») et React Native pour le mobile.

## Installer un projet avec Vite

```bash
npm create vite@latest ma-boutique -- --template react-ts
cd ma-boutique
npm install
npm run dev        # http://localhost:5173
```

Les fichiers importants : `index.html` (l'unique page), `src/main.tsx` (le point d'entrée, qui monte `<App />`) et `src/App.tsx` (le premier composant).

## Les composants et le JSX

Un composant est **une fonction** qui renvoie du JSX. Son nom commence **toujours par une majuscule**.

```tsx
function Bienvenue() {
  const ville = 'Dakar';
  return (
    <section className="hero">
      <h1>Bienvenue à {ville}</h1>
      <p>Nous sommes le {new Date().toLocaleDateString('fr-FR')}</p>
    </section>
  );
}
```

Les règles du JSX :

- on renvoie **un seul élément racine**, éventuellement un fragment `<>…</>` ;
- on écrit `className` au lieu de `class`, et `htmlFor` au lieu de `for` ;
- les accolades `{ }` insèrent une expression JavaScript ;
- toutes les balises se ferment, y compris `<img />` et `<br />`.

## Les props

Les **props** (*properties*) transmettent des données du parent vers l'enfant. Elles sont en **lecture seule**.

```tsx
type CarteProps = { nom: string; prix: number; enStock?: boolean };

function CarteProduit({ nom, prix, enStock = true }: CarteProps) {
  return (
    <article className="carte">
      <h3>{nom}</h3>
      <p>{prix.toLocaleString('fr-FR')} FCFA</p>
      {enStock ? <button>Ajouter</button> : <span>Rupture de stock</span>}
    </article>
  );
}

// Dans le parent :
<CarteProduit nom="Chemise wax" prix={12000} />
<CarteProduit nom="Sac en cuir" prix={25000} enStock={false} />
```

## Les conditions

| Besoin | Écriture |
|---|---|
| Deux possibilités | ternaire `{cond ? <A /> : <B />}` |
| Afficher ou rien | `{cond && <A />}` |
| Logique plus longue | `if` / `else` **avant** le `return` |

Attention avec `&&` : `{liste.length && <Liste />}` affiche « 0 » quand la liste est vide. Écris plutôt `liste.length > 0 &&`.

## Les listes

```tsx
const produits = [
  { id: 1, nom: 'Chemise wax', prix: 12000 },
  { id: 2, nom: 'Sac en cuir', prix: 25000 },
];

<ul>
  {produits.map((p) => <li key={p.id}>{p.nom}</li>)}
</ul>
```

La `key` doit être **unique et stable**, par exemple l'`id` venu de la base de données. Évite l'index du tableau si la liste peut être triée ou filtrée.

## Les styles

Il y a trois approches courantes :

1. Un fichier CSS importé dans le composant : `import './Carte.css'`.
2. Les **CSS Modules** : `import s from './Carte.module.css'`, puis `className={s.carte}`. Les classes sont isolées du reste de l'application.
3. **Tailwind CSS**, qui fait l'objet du cours suivant, « Tailwind CSS, styler avec des classes utilitaires ».

## L'état avec useState

L'**état** (*state*) est une donnée **propre au composant**, qui change avec le temps : un champ de saisie, un compteur, un panier. Contrairement aux props, l'état se modifie, mais **uniquement par son setter**. Chaque modification redessine le composant.

```tsx
import { useState } from 'react';

function Compteur() {
  const [quantite, setQuantite] = useState(1);   // [valeur, fonction de mise à jour] = useState(valeur initiale)
  return (
    <div>
      <button onClick={() => setQuantite((q) => Math.max(1, q - 1))}>−</button>
      <span>{quantite}</span>
      <button onClick={() => setQuantite((q) => q + 1)}>+</button>
      <p>Total : {(quantite * 12000).toLocaleString('fr-FR')} FCFA</p>
    </div>
  );
}
```

Exemple chiffré : on part de 1 et on clique 3 fois sur +. La quantité vaut alors 4, et le total affiche 48 000 FCFA.

La forme `setQuantite((q) => q + 1)` utilise la valeur **précédente** de l'état. C'est la forme sûre quand la nouvelle valeur dépend de l'ancienne.

**Un formulaire contrôlé** : la valeur du champ vient de l'état.

```tsx
const [recherche, setRecherche] = useState('');
<input value={recherche} onChange={(e) => setRecherche(e.target.value)} />
const visibles = produits.filter((p) => p.nom.toLowerCase().includes(recherche.toLowerCase()));
```

## Consommer une API avec useEffect

```tsx
import { useEffect, useState } from 'react';

type Utilisateur = { id: number; name: string; email: string };

function ListeUtilisateurs() {
  const [donnees, setDonnees] = useState<Utilisateur[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/users')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setDonnees)
      .catch((e) => setErreur(e.message))
      .finally(() => setChargement(false));
  }, []);                       // [] : une seule fois, après le premier affichage

  if (chargement) return <p>Chargement…</p>;
  if (erreur) return <p>Erreur : {erreur}</p>;
  return <ul>{donnees.map((u) => <li key={u.id}>{u.name} ({u.email})</li>)}</ul>;
}
```

Prévois **toujours trois états** : chargement, erreur et données.

## Les routes avec React Router

```bash
npm install react-router-dom
```

```tsx
// main.tsx
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';

function Produit() {
  const { id } = useParams();         // lit le paramètre :id de l'URL
  return <h2>Produit n° {id}</h2>;
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <nav><Link to="/">Accueil</Link> · <Link to="/produits/3">Produit 3</Link></nav>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/produits/:id" element={<Produit />} />
      <Route path="*" element={<p>Page introuvable</p>} />
    </Routes>
  </BrowserRouter>
);
```

`<Link>` change l'URL **sans recharger** la page, alors qu'une balise `<a href>` recharge tout.

## Démonstration

En direct, on construit la vitrine `ma-boutique` :

1. On crée le projet avec Vite et on vide `App.tsx`.
2. On écrit le composant `CarteProduit` avec ses props, puis la liste de 4 produits avec `map`.
3. On ajoute une barre de recherche (état et filtre) et un compteur de panier dans l'en-tête.
4. On ajoute la route `/produits/:id`.

## Exercice guidé

1. Crée le composant `Profil` qui reçoit `nom`, `metier` et `disponible` (booléen). Il affiche « Disponible » en vert ou « Occupé » en gris.
2. Affiche trois profils à partir d'un tableau, avec `map` et une `key`.
3. Ajoute un bouton « Basculer » dans chaque profil. Pour cela, `disponible` devient un **état** initialisé depuis la prop.

## Exercice autonome

Construis une mini application « Annuaire » :

- La page `/` liste les utilisateurs de `https://jsonplaceholder.typicode.com/users`, avec chargement et erreur.
- Un champ filtre les utilisateurs par nom en direct.
- Cliquer sur un nom ouvre `/utilisateurs/:id`, qui affiche son téléphone, sa ville et son entreprise grâce à un second `fetch`.
- Un compteur dans l'en-tête indique combien d'utilisateurs sont affichés.

## Correction

Exercice guidé :

```tsx
import { useState } from 'react';

type ProfilProps = { nom: string; metier: string; disponible: boolean };

function Profil({ nom, metier, disponible }: ProfilProps) {
  const [dispo, setDispo] = useState(disponible);
  return (
    <div className="profil">
      <h3>{nom}</h3><p>{metier}</p>
      <span style={{ color: dispo ? 'green' : 'gray' }}>{dispo ? 'Disponible' : 'Occupé'}</span>
      <button onClick={() => setDispo((d) => !d)}>Basculer</button>
    </div>
  );
}

const equipe = [
  { id: 1, nom: 'Awa', metier: 'Développeuse front', disponible: true },
  { id: 2, nom: 'Moussa', metier: 'DevOps', disponible: false },
  { id: 3, nom: 'Fatou', metier: 'Data engineer', disponible: true },
];

export default function App() {
  return <>{equipe.map((p) => <Profil key={p.id} nom={p.nom} metier={p.metier} disponible={p.disponible} />)}</>;
}
```

Exercice autonome, la page de détail :

```tsx
function Detail() {
  const { id } = useParams();
  const [u, setU] = useState<any>(null);
  useEffect(() => {
    fetch(`https://jsonplaceholder.typicode.com/users/${id}`).then((r) => r.json()).then(setU);
  }, [id]);                     // on relance l'effet si l'id change
  if (!u) return <p>Chargement…</p>;
  return <><h2>{u.name}</h2><p>{u.phone} · {u.address.city} · {u.company.name}</p><Link to="/">Retour</Link></>;
}
```

Le point clé est la dépendance `[id]` : sans elle, passer de l'utilisateur 1 à l'utilisateur 2 n'aurait pas relancé la requête.

## Pour aller plus loin

- Les exercices de react.dev/learn, notamment « Thinking in React » et « Tic-Tac-Toe ».
- `useContext` sert à partager un état (thème, utilisateur connecté) sans passer de props à chaque niveau.
- Cours suivant conseillé : « Next.js, pages, layouts et routage (App Router) » : Next.js ajoute à React le rendu côté serveur, le routage par fichiers et les API routes.
