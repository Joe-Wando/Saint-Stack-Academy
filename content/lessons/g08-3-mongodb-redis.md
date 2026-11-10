---
slug: g08-3-mongodb-redis
titre: NoSQL, MongoDB et Redis
piste: groupe
semaine: 8
date: 2026-12-31
domaine: Bases de données
duree: 120
niveau: découverte
objectifs:
  - Situer les familles NoSQL (document, clé-valeur, colonnes, graphe) par rapport au relationnel
  - Manipuler des documents MongoDB (insertOne, find, updateOne, deleteOne) avec des filtres et des projections
  - Choisir entre imbriquer et référencer, et écrire un pipeline d'agrégation
  - Utiliser Redis pour le cache, les compteurs et l'expiration (TTL)
  - Choisir la bonne base selon le besoin
prerequis:
  - Séances SQL et PostgreSQL ; Docker
referentiels:
  - MongoDB Associate Developer (certification MongoDB), domaines « CRUD », « Data Modeling » et « Aggregation »
  - Redis University, RU101 « Introduction to Redis Data Structures »
  - Théorème CAP (Eric Brewer, 2000)
quiz:
  - question: "Comment MongoDB stocke-t-il les données ?"
    choix: ["Dans des tables à colonnes fixes", "Dans des documents JSON (BSON) regroupés en collections", "Dans des fichiers CSV", "Dans un graphe"]
    reponse: 1
    explication: "Un document peut contenir des objets et des tableaux imbriqués ; deux documents d'une collection peuvent avoir des champs différents."
  - question: "Quel filtre MongoDB trouve les produits dont le prix est supérieur à 10 000 ?"
    choix: ["{ prix > 10000 }", "{ prix: { $gt: 10000 } }", "WHERE prix > 10000", "{ $prix: 10000 }"]
    reponse: 1
    explication: "Les opérateurs commencent par $ : $gt, $gte, $lt, $in, $ne, $and, $or…"
  - question: "Quand imbriquer des données dans un document plutôt que les référencer ?"
    choix: ["Toujours", "Quand elles sont lues ensemble, appartiennent au document parent et restent de taille limitée (les lignes d'une commande)", "Jamais", "Quand elles sont partagées par des milliers de documents"]
    reponse: 1
    explication: "Les lignes d'une commande sont imbriquées ; le client, partagé par de nombreuses commandes, est référencé."
  - question: "À quoi sert principalement Redis dans une application web ?"
    choix: ["Remplacer la base principale pour tout", "Cache, sessions, compteurs, files d'attente : des données en mémoire, très rapides, souvent temporaires", "Stocker des fichiers vidéo", "Faire des jointures"]
    reponse: 1
    explication: "Redis répond en moins d'une milliseconde ; on y met ce qui doit être rapide et peut être recalculé."
  - question: "Que fait SET produit:12 \"...\" EX 60 dans Redis ?"
    choix: ["Il enregistre la valeur pour toujours", "Il enregistre la valeur avec une expiration de 60 secondes", "Il attend 60 secondes", "Il crée 60 copies"]
    reponse: 1
    explication: "Le TTL (time to live) fait disparaître la clé automatiquement : idéal pour un cache."
---

## Pourquoi « NoSQL » ?

Les bases relationnelles comme PostgreSQL sont excellentes et doivent rester ton choix **par défaut**. Mais certains besoins s'y prêtent mal :

- des données dont la **structure varie** beaucoup (un catalogue où un téléphone n'a pas les mêmes attributs qu'une chemise) ;
- un **débit énorme** d'écritures simples ;
- des réponses en **moins d'une milliseconde** (cache, sessions) ;
- des **relations** très riches à parcourir (réseau social, recommandations).

Le terme **NoSQL** (*Not only SQL*) regroupe plusieurs familles :

| Famille | Modèle | Exemples | Usage typique |
|---|---|---|---|
| **Document** | documents JSON | MongoDB, Firestore | catalogues, contenus, profils |
| **Clé-valeur** | une clé, une valeur | **Redis**, DynamoDB | cache, sessions, compteurs |
| **Colonnes larges** | lignes avec colonnes variables | Cassandra, HBase | séries temporelles massives, IoT |
| **Graphe** | nœuds et relations | Neo4j | réseaux sociaux, détection de fraude |

## MongoDB

### Le vocabulaire

| SQL | MongoDB |
|---|---|
| base | base |
| table | **collection** |
| ligne | **document** (JSON, stocké en BSON) |
| colonne | champ |
| `JOIN` | imbrication, ou `$lookup` |
| clé primaire `id` | `_id` (ObjectId généré automatiquement) |

```bash
docker run -d --name mongo -p 27017:27017 mongo:8
docker exec -it mongo mongosh
```

Pour une interface graphique : MongoDB Compass (gratuit).

### Le CRUD

```js
use boutique

db.produits.insertMany([
  { nom: "Chemise wax", categorie: "Vêtements", prix: 12000, tailles: ["M", "L", "XL"], stock: 14 },
  { nom: "Sac en cuir", categorie: "Accessoires", prix: 25000, couleur: "marron", stock: 3 },
  { nom: "Téléphone X", categorie: "Électronique", prix: 95000, specs: { ram_go: 8, stockage_go: 128 }, stock: 0 },
])

db.produits.find({ prix: { $gt: 10000 } })                              // filtre
db.produits.find({ categorie: { $in: ["Vêtements", "Accessoires"] } }, { nom: 1, prix: 1, _id: 0 })  // projection
db.produits.find({ tailles: "L" })                                      // cherche dans un tableau
db.produits.find({ "specs.ram_go": { $gte: 8 } })                       // champ imbriqué
db.produits.find().sort({ prix: -1 }).limit(2)

db.produits.updateOne({ nom: "Sac en cuir" }, { $inc: { stock: -1 }, $set: { promo: true } })
db.produits.deleteMany({ stock: 0 })
```

Les documents **n'ont pas tous les mêmes champs** : la chemise a des `tailles`, le téléphone des `specs`. C'est le **schéma flexible**. C'est un avantage, et un risque : on peut ajouter une **validation de schéma** (`$jsonSchema`) pour éviter les incohérences.

### Imbriquer ou référencer

```js
// Une commande : les lignes sont IMBRIQUÉES, le client est RÉFÉRENCÉ
{
  _id: ObjectId("..."),
  client_id: ObjectId("..."),                  // référence : le client est partagé par de nombreuses commandes
  date: ISODate("2026-12-31"),
  statut: "livrée",
  lignes: [                                    // imbrication : lues avec la commande, et lui appartiennent
    { produit: "Chemise wax", prix: 12000, quantite: 2 },
    { produit: "Bracelet", prix: 5000, quantite: 3 }
  ]
}
```

| On imbrique quand… | On référence quand… |
|---|---|
| les données sont **lues ensemble** | les données sont **partagées** (un client a 1 000 commandes) |
| elles **appartiennent** au parent | elles évoluent **indépendamment** |
| leur taille est **limitée** (un document fait au plus 16 Mo) | la liste peut grandir **sans limite** |

La règle de MongoDB : **on modélise selon les requêtes de l'application**, et non selon les entités comme en SQL.

### Le pipeline d'agrégation

C'est l'équivalent de `GROUP BY` : des **étapes** que les documents traversent, comme un tube Unix.

```js
db.commandes.aggregate([
  { $match: { statut: "livrée" } },                                  // WHERE
  { $unwind: "$lignes" },                                            // une ligne par article
  { $group: {                                                        // GROUP BY
      _id: "$lignes.produit",
      ca: { $sum: { $multiply: ["$lignes.prix", "$lignes.quantite"] } },
      quantite: { $sum: "$lignes.quantite" } } },
  { $sort: { ca: -1 } },                                             // ORDER BY
  { $limit: 5 }
])
```

Pour la commande d'exemple, la chemise rapporte 2 × 12 000 = 24 000 et le bracelet 3 × 5 000 = 15 000.

**Les index** existent aussi, avec la même logique que PostgreSQL mardi : `db.produits.createIndex({ categorie: 1, prix: -1 })`, puis on vérifie avec `.explain("executionStats")`.

## Redis

Redis est une base **clé-valeur en mémoire**, qui répond en **moins d'une milliseconde**. Elle sert rarement de base principale. On l'utilise à côté de PostgreSQL ou de MongoDB.

```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
docker exec -it redis redis-cli
```

```
SET bienvenue "Bonjour Dakar"
GET bienvenue
SET produit:12 '{"nom":"Chemise wax","prix":12000}' EX 60     # expire dans 60 secondes
TTL produit:12                                                # secondes restantes
INCR visites:2026-12-31                                       # compteur atomique
HSET session:abc utilisateur awa role apprenant               # hash : un petit objet
HGETALL session:abc
LPUSH file:emails "awa@test.sn"                               # liste : file d'attente
RPOP file:emails
ZADD classement 74000 "Awa" 70000 "Ibrahima" 67000 "Fatou"    # ensemble trié
ZREVRANGE classement 0 2 WITHSCORES                           # top 3
```

### Le cache (*cache-aside*)

```js
async function produit(id) {
  const cle = `produit:${id}`;
  const enCache = await redis.get(cle);
  if (enCache) return JSON.parse(enCache);                         // 1. succès de cache : moins d'une ms
  const { rows } = await pool.query('SELECT * FROM produits WHERE id = $1', [id]);   // 2. échec : on lit la base
  await redis.set(cle, JSON.stringify(rows[0]), { EX: 300 });      // 3. on garde 5 minutes
  return rows[0];
}
// À chaque modification du produit : await redis.del(`produit:${id}`)  (invalidation)
```

Exemple chiffré : 1 000 lectures par minute d'un même produit. Sans cache, la base reçoit 1 000 requêtes par minute. Avec un cache de 5 minutes, elle en reçoit **une** toutes les 5 minutes, soit **0,2** par minute.

## Quelle base choisir ?

| Besoin | Choix |
|---|---|
| Données structurées, relations, transactions (commandes, paiements, comptes) | **PostgreSQL** |
| Structure variable, documents lus d'un bloc, développement rapide | **MongoDB** (ou une colonne `jsonb` dans PostgreSQL) |
| Cache, sessions, compteurs, classements, files simples | **Redis** |
| Analyse sur de gros volumes | un entrepôt (BigQuery, Snowflake), voir la séance solo du 29 décembre |

Le **théorème CAP** dit qu'en cas de coupure réseau, un système distribué choisit entre **cohérence** (refuser de répondre plutôt que répondre faux) et **disponibilité** (répondre, quitte à donner une donnée périmée).

Beaucoup d'applications combinent plusieurs bases : PostgreSQL et Redis, c'est la **persistance polyglotte**.

## Démonstration

1. On lance MongoDB et Redis avec Docker Compose (révision de la semaine 2).
2. On fait le CRUD du catalogue MongoDB avec des produits de structures différentes.
3. On écrit le pipeline d'agrégation du CA par produit et on le compare au SQL de la semaine 7.
4. On ajoute un cache Redis devant l'API boutique, puis on mesure le temps de réponse avant et après avec `curl -w "%{time_total}"`.

## Exercice guidé

Dans MongoDB :

1. Insère 5 commandes contenant des lignes imbriquées, et 3 clients.
2. Trouve les commandes livrées qui contiennent une « Chemise wax ».
3. Calcule le nombre de commandes par statut avec `aggregate`.

## Exercice autonome

1. Modélise en MongoDB un blog : articles, auteur, commentaires et tags. Justifie chaque choix entre imbriquer et référencer.
2. Écris les requêtes suivantes : les articles d'un tag, les 5 articles les plus commentés (agrégation), et l'ajout d'un commentaire.
3. Ajoute à ton API un cache Redis de 2 minutes sur la route la plus lue, avec invalidation lors des modifications.
4. Ajoute un compteur de vues par article avec `INCR`, et un classement des articles les plus vus avec `ZINCRBY`.
5. Pour chacun de ces cas, PostgreSQL, MongoDB ou Redis ? Un portefeuille de paiement mobile ; le panier d'un visiteur non connecté ; un catalogue de 200 types de produits aux attributs très différents ; le nombre de joueurs en ligne en ce moment.

## Correction

Exercice guidé :

```js
db.commandes.find({ statut: "livrée", "lignes.produit": "Chemise wax" })
db.commandes.aggregate([{ $group: { _id: "$statut", nb: { $sum: 1 } } }, { $sort: { nb: -1 } }])
```

Exercice autonome :

- **Question 1** : l'**auteur** est référencé, car il est partagé entre ses articles. Les **tags** sont imbriqués sous forme de tableau de chaînes, petits et lus avec l'article. Les **commentaires** sont imbriqués s'ils restent peu nombreux. S'ils peuvent être des milliers, on les met dans une collection séparée, pour ne pas dépasser 16 Mo par document.
- **Question 5** :
  - le portefeuille de paiement mobile va dans **PostgreSQL**, car il faut des transactions ACID ;
  - le panier d'un visiteur non connecté va dans **Redis**, car il est temporaire, avec un TTL ;
  - le catalogue aux attributs hétérogènes va dans **MongoDB**, ou dans PostgreSQL avec `jsonb` ;
  - les joueurs en ligne vont dans **Redis**, avec un compteur ou un ensemble à expiration.

## Pour aller plus loin

- **MongoDB Atlas** propose un cluster gratuit dans le cloud.
- Le complément **MySQL et Redis** (28 décembre) approfondit Redis : persistance, publication et abonnement, Streams.
- **Le bilan du parcours de groupe** : en 8 semaines, vous avez couvert le terminal, les réseaux, Git, Docker, la CI/CD, Kubernetes, la supervision, la sécurité, les tests, Next.js, SQL, PostgreSQL et NoSQL. C'est le socle d'un développeur DevOps. En janvier, viennent le mobile et le cloud.
