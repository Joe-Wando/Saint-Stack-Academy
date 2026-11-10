---
slug: c06-express-graphql
titre: "Express en profondeur et introduction à GraphQL"
domaine: Développement web
duree: 150
difficulte: bases
licence:
  - { niveau: L2, semestre: S4, ue: "Développement back-end" }
parcours:
  - { parcours: web, ordre: 9 }
ordre: 2
prerequis_cours: []
visibilite: public
objectifs:
  - Structurer une API Express (routeurs, middlewares, gestion centralisée des erreurs)
  - Valider les entrées avec un schéma (Zod) et documenter l'API (OpenAPI)
  - Expliquer les principes REST et leurs limites (sur-récupération, sous-récupération)
  - Écrire un schéma GraphQL (types, Query, Mutation) et ses résolveurs avec Apollo Server
  - Choisir entre REST et GraphQL selon le contexte
prerequis:
  - Cours Docker (API boutique), « Sécurité des applications web, OWASP Top 10 » et « Tests d'intégration d'API avec Supertest »
referentiels:
  - OpenJS Node.js Application Developer (JSNAD)
  - GraphQL Specification (graphql.org)
  - OpenAPI Specification 3.1 ; Roy Fielding, thèse sur REST (2000)
quiz:
  - question: "Dans Express, qu'est-ce qu'un middleware ?"
    choix: ["Une base de données", "Une fonction (req, res, next) exécutée dans l'ordre avant la route, qui peut modifier la requête, répondre ou passer la main", "Un serveur web", "Un test"]
    reponse: 1
    explication: "Journalisation, authentification, parsing JSON, limitation de débit : tout est middleware."
  - question: "Comment Express reconnaît-il un middleware de gestion d'erreurs ?"
    choix: ["Par son nom", "Il a quatre paramètres : (err, req, res, next)", "Il est déclaré en premier", "Il commence par error"]
    reponse: 1
    explication: "On le place en dernier ; next(err) dans une route y envoie directement l'erreur."
  - question: "Quel problème GraphQL résout-il par rapport à REST ?"
    choix: ["La sécurité", "Le client demande exactement les champs dont il a besoin, en une seule requête", "La vitesse du réseau", "Le stockage"]
    reponse: 1
    explication: "Fini la sur-récupération (champs inutiles) et la sous-récupération (plusieurs appels pour un écran)."
  - question: "En GraphQL, quelle différence entre Query et Mutation ?"
    choix: ["Aucune", "Query lit les données, Mutation les modifie", "Mutation est plus rapide", "Query est réservée aux administrateurs"]
    reponse: 1
    explication: "C'est l'équivalent de GET d'un côté, et de POST, PUT, DELETE de l'autre."
  - question: "Qu'est-ce que le problème N+1 en GraphQL ?"
    choix: ["Une erreur de syntaxe", "Un résolveur exécute une requête par élément d'une liste (1 pour la liste + N pour les enfants)", "Une limite de 1 requête", "Un problème de sécurité réseau"]
    reponse: 1
    explication: "On le résout en regroupant les accès (DataLoader) : une requête pour tous les enfants à la fois."
---

## Express en profondeur

L'API boutique (voir le cours « Docker, volumes, réseaux et dockerisation d'une API ») tenait dans un fichier. Une vraie API se **structure**.

```
src/
├── app.js                  construit l'application (testable avec Supertest)
├── server.js               écoute le port
├── routes/produits.js      routeur : les URL /produits
├── services/produits.js    logique métier et accès à la base
├── middlewares/
│   ├── auth.js
│   ├── valider.js
│   └── erreurs.js
└── schemas/produit.js      schémas de validation
```

### Les middlewares

Une requête traverse une **chaîne de fonctions** `(req, res, next)`. Chacune peut agir, répondre, ou appeler `next()` pour passer la main à la suivante.

```
requête → [json] → [journal] → [helmet] → [limite de débit] → [auth] → [valider] → route → réponse
                                                                                       ↓ erreur
                                                                                [gestion des erreurs]
```

```js
// app.js
const express = require('express');
const helmet = require('helmet');
const produits = require('./routes/produits');
const { gererErreurs } = require('./middlewares/erreurs');

const app = express();
app.use(express.json({ limit: '100kb' }));
app.use(helmet());
app.use((req, res, next) => {                                // journalisation
  const debut = Date.now();
  res.on('finish', () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - debut}ms`));
  next();
});
app.use('/api/produits', produits);
app.use((req, res) => res.status(404).json({ erreur: 'Route introuvable' }));
app.use(gererErreurs);                                        // en DERNIER
module.exports = app;
```

### La validation avec Zod et la gestion des erreurs

```js
// schemas/produit.js
const { z } = require('zod');
exports.ProduitEntree = z.object({
  nom: z.string().trim().min(2).max(100),
  prix: z.number().int().positive(),
  categorie: z.enum(['Vêtements', 'Accessoires', 'Chaussures']),
});

// middlewares/valider.js
exports.valider = (schema) => (req, res, next) => {
  const r = schema.safeParse(req.body);
  if (!r.success) return res.status(400).json({ erreur: 'Données invalides', details: r.error.flatten().fieldErrors });
  req.body = r.data;              // données nettoyées et typées
  next();
};

// middlewares/erreurs.js
class ErreurMetier extends Error { constructor(statut, message) { super(message); this.statut = statut; } }
exports.ErreurMetier = ErreurMetier;
exports.gererErreurs = (err, req, res, next) => {             // QUATRE paramètres
  if (err instanceof ErreurMetier) return res.status(err.statut).json({ erreur: err.message });
  console.error(err);                                         // journal complet côté serveur
  res.status(500).json({ erreur: 'Erreur interne' });         // rien de technique côté client (OWASP A05)
};

// routes/produits.js
const router = require('express').Router();
router.post('/', valider(ProduitEntree), async (req, res, next) => {
  try { res.status(201).json(await service.creer(req.body)); }
  catch (e) { next(e); }
});
module.exports = router;
```

Depuis Express 5, une erreur levée dans une route `async` est transmise automatiquement au gestionnaire : le `try/catch` n'est plus obligatoire.

### REST, les principes

| Principe | Exemple |
|---|---|
| Des **ressources** au pluriel, identifiées par une URL | `/api/produits`, `/api/produits/12` |
| Le **verbe HTTP** porte l'action | `GET` (lire), `POST` (créer), `PATCH` (modifier en partie), `DELETE` |
| Des **codes de statut** justes | 201 à la création, 204 sans contenu, 400, 404, 409 (conflit) |
| Le **filtrage et la pagination** dans la query string | `?categorie=Vêtements&page=2&limite=20` |
| Une **documentation** OpenAPI | `swagger-ui-express`, ou `@nestjs/swagger` |

**Les limites de REST**. Pour afficher la page d'un client, le mobile doit appeler `/clients/3`, puis `/clients/3/commandes`, puis `/produits/…` pour chaque produit. C'est la **sous-récupération**, et cela fait de nombreux allers-retours sur un réseau 3G. À l'inverse, `/clients/3` renvoie 30 champs quand l'écran n'en affiche que 2 : c'est la **sur-récupération**.

## GraphQL

**GraphQL** (créé par Facebook) expose **un seul point d'entrée** (`/graphql`) et un **schéma typé**. Le client écrit une **requête** qui décrit **exactement** les données voulues.

```graphql
# Le schéma (SDL)
type Produit { id: ID!  nom: String!  prix: Int!  categorie: String! }
type Ligne { produit: Produit!  quantite: Int! }
type Commande { id: ID!  date: String!  statut: String!  lignes: [Ligne!]!  total: Int! }
type Client { id: ID!  nom: String!  ville: String  commandes: [Commande!]! }

type Query {
  produits(categorie: String): [Produit!]!
  client(id: ID!): Client
}
type Mutation {
  creerProduit(nom: String!, prix: Int!, categorie: String!): Produit!
}
```

Le `!` signifie « non nul ». `[Produit!]!` désigne une liste non nulle de produits non nuls.

**La requête du client** :

```graphql
query {
  client(id: 1) {
    nom
    commandes { date total lignes { quantite produit { nom } } }
  }
}
```

La réponse a **exactement** cette forme. Pour Awa, cela donne 2 commandes, de totaux **39 000** et **35 000**.

### Apollo Server

```js
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

const resolvers = {
  Query: {
    produits: (_, { categorie }) => categorie
      ? db.query('SELECT * FROM produits WHERE categorie = $1', [categorie]).then((r) => r.rows)
      : db.query('SELECT * FROM produits').then((r) => r.rows),
    client: (_, { id }) => db.query('SELECT * FROM clients WHERE id = $1', [id]).then((r) => r.rows[0]),
  },
  Client: {
    commandes: (client) => db.query('SELECT * FROM commandes WHERE client_id = $1', [client.id]).then((r) => r.rows),
  },
  Commande: {
    total: async (cmd) => (await db.query(
      'SELECT SUM(p.prix * l.quantite)::int AS t FROM lignes l JOIN produits p ON p.id = l.produit_id WHERE l.commande_id = $1',
      [cmd.id])).rows[0].t,
  },
  Mutation: {
    creerProduit: (_, args) => db.query('INSERT INTO produits (nom, prix, categorie) VALUES ($1,$2,$3) RETURNING *',
      [args.nom, args.prix, args.categorie]).then((r) => r.rows[0]),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
startStandaloneServer(server, { listen: { port: 4001 } });   // l'explorateur Apollo Sandbox est sur http://localhost:4001
```

Un **résolveur** est la fonction qui fournit la valeur d'un champ. GraphQL appelle **seulement** ceux des champs demandés.

**Le problème N+1** : pour une liste de 50 clients, le résolveur `commandes` fait 50 requêtes, plus 1 pour la liste, soit 51. **DataLoader** regroupe ces 50 appels en **une** requête `WHERE client_id = ANY($1)`.

## REST ou GraphQL ?

| Critère | REST | GraphQL |
|---|---|---|
| Simplicité, mise en cache HTTP | ✔ | plus complexe |
| Clients variés (web, mobile) aux besoins différents | plusieurs appels | ✔ une requête sur mesure |
| Typage et introspection | avec OpenAPI | ✔ intégré |
| Sécurité | habituelle | limiter la **profondeur** et la **complexité** des requêtes |
| Téléversement de fichiers, API publique simple | ✔ | moins naturel |

La plupart des projets commencent en REST. GraphQL se justifie quand **plusieurs clients** (web, mobile) consomment des données **très reliées**.

## Démonstration

1. On restructure l'API boutique : routeurs, middlewares, Zod, gestion centralisée des erreurs, puis on vérifie que les tests Supertest passent toujours.
2. On ajoute une documentation OpenAPI avec Swagger UI.
3. On crée le serveur GraphQL et on exécute la requête « client avec ses commandes » dans l'Apollo Sandbox.
4. On affiche les requêtes SQL exécutées : le N+1 apparaît, puis on le corrige avec DataLoader.

## Exercice guidé

1. Ajoute un middleware `exigerRole('admin')` qui renvoie 403 si `req.utilisateur.role` est différent, et protège `DELETE /api/produits/:id`.
2. Ajoute au schéma GraphQL une requête `produit(id: ID!): Produit` et son résolveur.

## Exercice autonome

1. Termine la restructuration de ton API : toutes les entrées validées par Zod, toutes les erreurs centralisées, une journalisation, et la documentation OpenAPI.
2. Expose la même logique en GraphQL : produits filtrables, client avec ses commandes et leurs totaux, et la mutation `passerCommande`.
3. Mets en évidence puis corrige le N+1 avec DataLoader. Compte les requêtes SQL avant et après, pour 6 clients.
4. Limite la profondeur des requêtes GraphQL à 5 (`graphql-depth-limit`), et explique la menace évitée.

## Correction

Exercice guidé :

```js
exports.exigerRole = (role) => (req, res, next) =>
  req.utilisateur?.role === role ? next() : res.status(403).json({ erreur: 'Accès refusé' });
router.delete('/:id', auth, exigerRole('admin'), supprimer);
```

```graphql
type Query { produit(id: ID!): Produit }
```

```js
produit: (_, { id }) => db.query('SELECT * FROM produits WHERE id = $1', [id]).then((r) => r.rows[0] ?? null),
```

Exercice autonome :

- Question 3 : sans DataLoader, il y a 1 requête pour les clients et 6 pour leurs commandes, soit **7**. Avec DataLoader, il y en a **2**.
- Question 4 : une requête malveillante très imbriquée, du type `client { commandes { lignes { produit { … } } } }` répété des dizaines de fois, pourrait déclencher des millions de résolutions et saturer le serveur. C'est un **déni de service**, et la limite de profondeur le bloque dès l'analyse de la requête.

## Pour aller plus loin

- **NestJS** (ton framework) intègre REST, GraphQL (`@nestjs/graphql`), la validation et Swagger de façon structurée.
- **tRPC** offre une API typée de bout en bout entre Next.js et Node, sans schéma à écrire.
- **gRPC** est le protocole binaire utilisé entre microservices.
