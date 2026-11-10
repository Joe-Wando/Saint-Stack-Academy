---
slug: g06-1-supertest
titre: Tests d'intégration d'API avec Supertest
domaine: Qualité et tests
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Génie logiciel et qualité" }
parcours:
  - { parcours: web, ordre: 17 }
ordre: 4
prerequis_cours: [g05-4-jest, g05-2-postman]
visibilite: public
objectifs:
  - Distinguer test unitaire et test d'intégration
  - Rendre une application Express ou NestJS testable (séparer app et serveur)
  - Écrire des tests Supertest sur les routes (statut, en-têtes, corps)
  - Tester l'authentification, les droits et les erreurs
  - Isoler les tests avec une base de test et un état connu, puis les lancer en CI
prerequis:
  - Cours « Tests unitaires avec Jest » et « Tester une API avec Postman »
referentiels:
  - ISTQB CTFL v4.0, section 2.2 « Test Levels » (test d'intégration de composants et de systèmes)
  - Documentation Supertest et NestJS, « Testing »
  - OWASP ASVS 4.0, chapitre V4 « Access Control » (tests de droits)
quiz:
  - question: "Que vérifie un test d'intégration d'API que ne vérifie pas un test unitaire ?"
    choix: ["La syntaxe JavaScript", "Que les couches fonctionnent ensemble : route, validation, service, base de données", "La couleur des boutons", "Rien de plus"]
    reponse: 1
    explication: "Le test unitaire isole une fonction avec des mocks ; le test d'intégration traverse la vraie pile."
  - question: "Pourquoi exporter app sans appeler app.listen() dans le même fichier ?"
    choix: ["Pour la performance", "Pour que Supertest puisse lancer l'application en mémoire sans occuper de port", "C'est obligatoire en Express", "Pour la sécurité"]
    reponse: 1
    explication: "request(app) démarre un serveur éphémère ; server.js seul appelle listen en production."
  - question: "Pourquoi utiliser une base de données dédiée aux tests ?"
    choix: ["Pour aller plus vite", "Pour ne jamais toucher aux vraies données et repartir d'un état connu à chaque test", "Parce que Supertest l'exige", "Pour économiser de la mémoire"]
    reponse: 1
    explication: "Des tests qui dépendent de données existantes ou de l'ordre d'exécution deviennent instables."
  - question: "Comment envoyer un jeton dans une requête Supertest ?"
    choix: [".token(jeton)", ".set('Authorization', `Bearer ${jeton}`)", ".auth(jeton)", ".send(jeton)"]
    reponse: 1
    explication: ".set ajoute un en-tête ; .send envoie le corps de la requête."
  - question: "Un test passe seul mais échoue quand toute la suite tourne. Cause probable ?"
    choix: ["Supertest est cassé", "Les tests partagent un état (données laissées par un autre test)", "Le réseau", "Node est trop lent"]
    reponse: 1
    explication: "Chaque test doit préparer ses propres données et nettoyer : beforeEach avec TRUNCATE, ou une transaction annulée."
---

## Où se situe Supertest ?

Jest (voir le cours « Tests unitaires avec Jest ») testait des **fonctions isolées** avec des mocks. Postman testait l'API **à la main**, de l'extérieur. **Supertest** se place entre les deux : il envoie de vraies requêtes HTTP à ton application **depuis le code de test**, et ces requêtes traversent toutes les couches (routes, validation, services, **base réelle**). Les tests sont automatisés, rapides, et exécutés à chaque push en CI.

```
Test Supertest ──HTTP──▶ [ Route ] ─▶ [ Validation ] ─▶ [ Service ] ─▶ [ PostgreSQL de test ]
                              ▲ tout est réel : aucun mock
```

## Rendre l'application testable

Il faut séparer **l'application** du **démarrage du serveur** :

```js
// app.js : construit l'application, sans l'écouter
const express = require('express');
function creerApp(pool) {
  const app = express();
  app.use(express.json());
  app.get('/sante', (req, res) => res.send('ok'));
  app.get('/produits', async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM produits ORDER BY id');
    res.json(rows);
  });
  app.post('/produits', async (req, res) => {
    const { nom, prix } = req.body ?? {};
    if (!nom || !Number.isInteger(prix) || prix <= 0) return res.status(400).json({ erreur: 'nom et prix (> 0) requis' });
    const { rows } = await pool.query('INSERT INTO produits (nom, prix) VALUES ($1, $2) RETURNING *', [nom, prix]);
    res.status(201).json(rows[0]);
  });
  return app;
}
module.exports = { creerApp };
```

```js
// server.js : uniquement en production
const { Pool } = require('pg');
const { creerApp } = require('./app');
creerApp(new Pool({ connectionString: process.env.DATABASE_URL })).listen(3000);
```

L'application reçoit le `pool` en paramètre : c'est de l'**injection de dépendances**, comme avec Jest.

## Le premier test

```bash
npm install -D jest supertest
```

```js
// produits.int.test.js
const request = require('supertest');
const { Pool } = require('pg');
const { creerApp } = require('./app');

const pool = new Pool({ connectionString: process.env.DATABASE_URL_TEST });
const app = creerApp(pool);

beforeAll(async () => {
  await pool.query('CREATE TABLE IF NOT EXISTS produits (id serial PRIMARY KEY, nom text NOT NULL, prix int NOT NULL)');
});
beforeEach(async () => {
  await pool.query('TRUNCATE produits RESTART IDENTITY');      // état connu avant CHAQUE test
});
afterAll(() => pool.end());

describe('POST /produits', () => {
  test('crée un produit et renvoie 201', async () => {
    const res = await request(app)
      .post('/produits')
      .send({ nom: 'Chemise wax', prix: 12000 })
      .expect('Content-Type', /json/)
      .expect(201);

    expect(res.body).toMatchObject({ id: 1, nom: 'Chemise wax', prix: 12000 });
    const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM produits');
    expect(rows[0].n).toBe(1);                                   // vraiment enregistré en base
  });

  test.each([
    [{}, 'corps vide'],
    [{ nom: 'X' }, 'prix manquant'],
    [{ nom: 'X', prix: -5 }, 'prix négatif'],
    [{ nom: 'X', prix: '12000' }, 'prix en texte'],
  ])('refuse %o (%s) avec 400', async (corps) => {
    await request(app).post('/produits').send(corps).expect(400);
  });
});

describe('GET /produits', () => {
  test('renvoie les produits triés', async () => {
    await pool.query("INSERT INTO produits (nom, prix) VALUES ('B', 2), ('A', 1)");
    const res = await request(app).get('/produits').expect(200);
    expect(res.body.map((p) => p.nom)).toEqual(['B', 'A']);     // trié par id
  });
});
```

Supertest enchaîne `.get/.post/.put/.delete`, `.send(corps)`, `.set(en-tête, valeur)`, `.query({...})` et `.expect(statut)`. Le résultat expose `res.status`, `res.body` et `res.headers`.

## Tester l'authentification et les droits

Ce sont les tests les plus **importants** en sécurité : la catégorie A01 de l'OWASP (voir le cours « Sécurité des applications web, OWASP Top 10 »).

```js
async function jetonPour(email, role) {
  // crée l'utilisateur en base puis se connecte via l'API
  await request(app).post('/auth/inscription').send({ email, motDePasse: 'motdepasse123', role });
  const res = await request(app).post('/auth/connexion').send({ email, motDePasse: 'motdepasse123' });
  return res.body.jeton;
}

test('sans jeton : 401', () => request(app).get('/progression').expect(401));

test('apprenant sur une route formateur : 403', async () => {
  const jeton = await jetonPour('awa@test.sn', 'apprenant');
  await request(app).get('/formateur/apercu').set('Authorization', `Bearer ${jeton}`).expect(403);
});

test("un utilisateur ne voit pas les notes d'un autre", async () => {
  const a = await jetonPour('a@test.sn'); const b = await jetonPour('b@test.sn');
  await request(app).put('/notes/cours-1').set('Authorization', `Bearer ${a}`).send({ contenu: 'secret de A' });
  const res = await request(app).get('/notes/cours-1').set('Authorization', `Bearer ${b}`).expect(200);
  expect(res.body.contenu).toBe('');
});
```

## NestJS

NestJS fournit le même outil, intégré :

```ts
const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
const app = moduleRef.createNestApplication();
await app.init();
await request(app.getHttpServer()).get('/api/sante').expect(200);
```

Le dossier `test/` d'un projet NestJS contient déjà un exemple, `app.e2e-spec.ts`.

## La base de test et la CI

En local, on lance une base jetable : `docker run -d --name pg-test -e POSTGRES_PASSWORD=test -p 5435:5432 postgres:16-alpine`, puis on définit `DATABASE_URL_TEST=postgres://postgres:test@localhost:5435/postgres`.

En CI, c'est le `services: postgres` de GitHub Actions (voir le cours « GitHub Actions, tests, matrice, secrets et publication d'une image Docker »).

**Les règles d'isolation :**

- chaque test **prépare ses propres données** ;
- on vide les tables avec `TRUNCATE` dans `beforeEach`, ou on ouvre une transaction annulée après chaque test ;
- les tests ne dépendent **jamais** de leur ordre d'exécution ;
- avec `jest --runInBand`, les fichiers de test s'exécutent un par un, pour éviter qu'ils se marchent dessus sur la même base.

## Démonstration

1. On sépare `app.js` et `server.js` dans l'API boutique.
2. On lance une base de test dans Docker.
3. On écrit les tests de `POST` et de `GET /produits`.
4. On introduit un bug (le contrôle `prix <= 0` est oublié) : le test « prix négatif » échoue.
5. On ajoute les tests à GitHub Actions et on voit le pipeline passer au vert.

## Exercice guidé

Pour l'API boutique, écris les tests de :

1. `GET /produits/:id` : 200 avec le bon produit, et 404 si l'identifiant n'existe pas.
2. `DELETE /produits/:id` : 204, puis un `GET` qui renvoie 404.
3. Un `id` non numérique (`/produits/abc`) : 400, et surtout **pas** 500.

## Exercice autonome

1. Couvre toutes les routes de ton API avec au moins un cas nominal et deux cas d'erreur par route.
2. Ajoute une suite « droits d'accès » : sans jeton, avec un jeton expiré, avec un rôle insuffisant, et en tentant d'accéder à la ressource d'un autre utilisateur.
3. Vérifie aussi les **effets en base** après chaque écriture.
4. Fais tourner la suite en CI avec un service PostgreSQL, puis ajoute le badge au README.
5. Mesure la durée de la suite. Si elle dépasse 30 secondes, propose deux optimisations.

## Correction

Exercice guidé :

```js
app.get('/produits/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ erreur: 'id invalide' });
  const { rows } = await pool.query('SELECT * FROM produits WHERE id = $1', [id]);
  if (!rows.length) return res.status(404).json({ erreur: 'Introuvable' });
  res.json(rows[0]);
});

test('GET /produits/:id renvoie 404 si absent', () => request(app).get('/produits/999').expect(404));
test('GET /produits/abc renvoie 400', () => request(app).get('/produits/abc').expect(400));
test('DELETE puis GET renvoie 404', async () => {
  const { body } = await request(app).post('/produits').send({ nom: 'Sac', prix: 25000 });
  await request(app).delete(`/produits/${body.id}`).expect(204);
  await request(app).get(`/produits/${body.id}`).expect(404);
});
```

Sans la validation de la question 3, PostgreSQL lève une erreur de type sur `'abc'` et l'API répond 500. Une **erreur du client** ne doit jamais produire une **erreur du serveur**.

Exercice autonome, question 5, les optimisations possibles :
- **une seule** connexion à la base pour toute la suite ;
- `TRUNCATE` de plusieurs tables en une seule commande ;
- un facteur de coût bcrypt réduit en test (4 au lieu de 12) ;
- un jeton créé une fois dans `beforeAll` quand c'est possible.

## Pour aller plus loin

- **Testcontainers** démarre automatiquement un conteneur PostgreSQL depuis le code de test.
- Les tests de **contrat** (Pact) vérifient que le frontend et l'API s'entendent sur le format des échanges.
- Cours suivant conseillé : « Next.js, pages, layouts et routage (App Router) », pour construire le frontend que Cypress testera ensuite.
