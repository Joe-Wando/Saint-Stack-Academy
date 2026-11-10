---
slug: g05-2-postman
titre: Tester une API avec Postman
domaine: Qualité et tests
duree: 120
difficulte: bases
licence:
  - { niveau: L2, semestre: S4, ue: "Développement back-end" }
parcours:
  - { parcours: web, ordre: 13 }
ordre: 1
prerequis_cours: []
visibilite: public
objectifs:
  - Envoyer des requêtes GET, POST, PUT, DELETE avec paramètres, en-têtes et corps JSON
  - Organiser ses requêtes en collections et utiliser des environnements et des variables
  - Automatiser l'authentification (récupérer un jeton et le réutiliser)
  - Écrire des tests automatiques sur les réponses (statut, temps, contenu, schéma)
  - Exécuter une collection en ligne de commande avec Newman dans une CI
prerequis:
  - Cours « Les réseaux pour développeurs, IP, ports, DNS et HTTP » (HTTP)
  - Une API qui tourne en local (par exemple l'API boutique)
referentiels:
  - ISTQB Certified Tester Foundation Level (CTFL v4.0), chapitre 4 « Test Analysis and Design »
  - Postman API Fundamentals Student Expert
  - OpenAPI Specification 3.1
quiz:
  - question: "À quoi sert un environnement Postman ?"
    choix: ["À installer Postman", "À stocker des variables (URL, jetons) différentes selon le contexte : local, test, production", "À créer une base de données", "À dessiner l'interface"]
    reponse: 1
    explication: "{{baseUrl}} vaut http://localhost:4000 en local et https://api.exemple.sn en test ; on bascule en un clic."
  - question: "Dans quel onglet écrit-on les vérifications sur la réponse ?"
    choix: ["Headers", "Body", "Scripts > Post-response (Tests)", "Params"]
    reponse: 2
    explication: "Le script post-réponse s'exécute après réception : pm.test(...) et pm.expect(...)."
  - question: "Comment réutiliser automatiquement le jeton obtenu à la connexion ?"
    choix: ["Le recopier à la main dans chaque requête", "Le stocker dans une variable avec pm.environment.set puis l'utiliser via {{jeton}}", "L'écrire dans l'URL", "Ce n'est pas possible"]
    reponse: 1
    explication: "Le test de la requête de connexion enregistre le jeton ; l'onglet Authorization de la collection utilise Bearer {{jeton}}."
  - question: "Qu'est-ce que Newman ?"
    choix: ["Un concurrent de Postman", "L'outil en ligne de commande qui exécute une collection Postman, par exemple dans une CI", "Un plugin de navigateur", "Un serveur de mock"]
    reponse: 1
    explication: "npx newman run collection.json -e env.json : les tests deviennent une étape du pipeline."
  - question: "Un test vérifie seulement que le statut vaut 200. Que lui manque-t-il souvent ?"
    choix: ["Rien", "Vérifier le contenu (champs, types, valeurs) et les cas d'erreur (400, 401, 404)", "Vérifier la couleur", "Vérifier l'heure"]
    reponse: 1
    explication: "Une API peut répondre 200 avec un corps faux. Les cas négatifs sont aussi importants que le cas nominal."
---

## Pourquoi Postman ?

Tu as construit une API. Avant même d'avoir un frontend, il faut pouvoir l'**appeler**, l'**explorer** et vérifier qu'elle se comporte comme prévu, y compris quand on lui envoie n'importe quoi. Postman est l'outil le plus répandu pour cela. Il sert aussi de **documentation vivante**, partagée avec l'équipe frontend ou mobile.

> `curl` (voir le cours « Les réseaux pour développeurs, IP, ports, DNS et HTTP ») fait la même chose en ligne de commande. Postman ajoute l'organisation, les variables, les tests et le partage.

Des alternatives libres existent : **Bruno** et **Insomnia**, ou les fichiers `.http` de VS Code.

## Envoyer une requête

| Zone | Contenu |
|---|---|
| Méthode et URL | `POST {{baseUrl}}/api/auth/connexion` |
| **Params** | paramètres de requête (`?page=2&limite=10`) |
| **Authorization** | type *Bearer Token*, *Basic*, *API Key* |
| **Headers** | `Content-Type: application/json`… |
| **Body** | *raw* puis *JSON* : `{ "email": "awa@test.sn", "motDePasse": "..." }` |

La réponse affiche le **statut**, le **temps**, la **taille**, le **corps** et les **en-têtes**.

## Collections et environnements

Une **collection** regroupe les requêtes d'une API, rangées en dossiers :

```
API Cours en ligne
├── Auth
│   ├── Inscription
│   ├── Connexion
│   └── Moi
├── Cours
│   ├── Liste des cours
│   └── Détail d'un cours
└── Progression
    ├── Ma progression
    ├── Changer le statut
    └── Soumettre un quiz
```

Un **environnement** contient des variables qui changent selon le contexte :

| Variable | Local | Test |
|---|---|---|
| `baseUrl` | `http://localhost:4000/api` | `https://api-test.saintstack.sn/api` |
| `email` | `awa@test.sn` | `testeur@saintstack.sn` |
| `jeton` | (rempli automatiquement) | (rempli automatiquement) |

On écrit ensuite `{{baseUrl}}/programme` dans l'URL.

Les **portées** des variables, de la plus large à la plus précise : globale, collection, environnement, puis locale. Les valeurs secrètes se mettent en type *secret* et ne se partagent pas.

## Automatiser l'authentification

Dans la requête **Connexion**, onglet *Scripts*, partie *Post-response* :

```js
pm.test("Connexion réussie", () => pm.response.to.have.status(200));
const corps = pm.response.json();
pm.environment.set("jeton", corps.jeton);
```

Ensuite, dans la collection, onglet *Authorization*, on choisit le type *Bearer Token* avec la valeur `{{jeton}}`. Les requêtes héritent de cette configuration (*Inherit auth from parent*).

## Écrire des tests

```js
pm.test("Statut 200", () => pm.response.to.have.status(200));

pm.test("Répond en moins de 500 ms", () => pm.expect(pm.response.responseTime).to.be.below(500));

pm.test("Renvoie une liste de cours", () => {
  const cours = pm.response.json();
  pm.expect(cours).to.be.an("array").that.is.not.empty;
  pm.expect(cours[0]).to.include.all.keys("slug", "titre", "domaine", "duree", "difficulte", "nbQuestions");
});

pm.test("Un apprenant ne voit aucun cours privé", () => {
  const cours = pm.response.json();
  pm.expect(cours.every(c => c.visibilite !== "prive")).to.be.true;
});
```

**La validation de schéma** vérifie d'un coup la forme de la réponse :

```js
const schema = {
  type: "object",
  required: ["score", "total", "detail"],
  properties: { score: { type: "integer", minimum: 0 }, total: { type: "integer" }, detail: { type: "array" } },
};
pm.test("Schéma du résultat de quiz", () => pm.response.to.have.jsonSchema(schema));
```

### Les cas à couvrir (techniques ISTQB)

| Cas | Exemple | Attendu |
|---|---|---|
| Nominal | connexion correcte | 200 et un jeton |
| Données invalides | e-mail sans @ | 400 |
| Non authentifié | `/progression` sans jeton | 401 |
| Interdit | un apprenant demande `/formateur/apercu` | 403 |
| Introuvable | `/cours/nexiste-pas` | 404 |
| Valeurs limites | mot de passe de 7 caractères (refusé) et de 8 (accepté) | 400, puis 201 |

L'**analyse des valeurs limites** teste juste avant, sur et juste après chaque seuil. C'est là que se cachent la plupart des bugs, comme écrire `>` au lieu de `>=`.

## Le lanceur de collection et Newman

Le *Collection Runner* exécute toute la collection dans l'ordre et affiche un rapport. En **ligne de commande**, c'est Newman :

```bash
npm install -g newman
newman run saint-stack.postman_collection.json -e local.postman_environment.json --reporters cli,junit
```

Dans GitHub Actions (voir le cours « Intégration continue avec GitHub Actions, premier workflow ») :

```yaml
      - run: docker compose up -d --wait        # l'API et sa base
      - run: npx newman run tests/api.postman_collection.json -e tests/ci.postman_environment.json
```

## Démonstration

Sur l'API d'une plateforme de cours en ligne, lancée en local :

1. On crée l'environnement `local` et la collection, avec trois dossiers.
2. Inscription puis connexion : le jeton est enregistré automatiquement.
3. On fait des tests sur `/cours` : statut, temps et filtre par rôle.
4. Les cas d'erreur : 401 sans jeton, 403 pour un apprenant sur `/admin/statistiques`, 404 pour un cours inexistant ou privé.
5. On exporte la collection et on l'exécute avec Newman.

## Exercice guidé

Avec l'API publique `https://jsonplaceholder.typicode.com` :

1. Crée un environnement contenant la variable `baseUrl`.
2. `GET {{baseUrl}}/posts?userId=1` : vérifie le statut 200, que la réponse est un tableau de 10 éléments et que tous ont `userId` égal à 1.
3. `POST {{baseUrl}}/posts` avec un titre et un corps : vérifie le statut 201 et enregistre l'`id` reçu dans une variable.
4. `GET {{baseUrl}}/posts/{{idCree}}` : quel statut obtiens-tu, et pourquoi ?

## Exercice autonome

Construis la collection de test complète de **ton** API (ou de celle de la boutique) :

1. Au moins 12 requêtes, dont 5 cas d'erreur (400, 401, 403, 404, 409).
2. Une authentification automatique avec la variable `{{jeton}}`.
3. Au moins 2 tests par requête, dont un sur le **contenu**, et une validation de schéma sur une requête.
4. Un scénario enchaîné : créer, lire, modifier, relire, supprimer, puis vérifier que la ressource renvoie bien 404.
5. Une exécution avec Newman, puis l'ajout à ton workflow GitHub Actions.

## Correction

Exercice guidé :

```js
// 2.
pm.test("200", () => pm.response.to.have.status(200));
const posts = pm.response.json();
pm.test("10 articles de l'utilisateur 1", () => {
  pm.expect(posts).to.have.lengthOf(10);
  pm.expect(posts.every(p => p.userId === 1)).to.be.true;
});
// 3.
pm.test("201", () => pm.response.to.have.status(201));
pm.environment.set("idCree", pm.response.json().id);     // 101
```

Question 4 : on obtient un **404**. JSONPlaceholder **simule** la création sans rien enregistrer réellement : c'est une fausse API. Il faut toujours vérifier qu'une écriture a vraiment été persistée en relisant la ressource.

Exercice autonome, l'enchaînement : dans la requête de création, `pm.collectionVariables.set("idProduit", pm.response.json().id)`. Toutes les requêtes suivantes utilisent ensuite `{{idProduit}}`, et la dernière vérifie `pm.response.to.have.status(404)`.

## Pour aller plus loin

- Postman peut importer une spécification **OpenAPI** (Swagger) et générer la collection automatiquement. NestJS produit ce fichier avec `@nestjs/swagger`.
- Les **Mock Servers** simulent une API qui n'existe pas encore, pour que le frontend avance en parallèle.
- Cours suivants conseillés : « Scrum en pratique avec Jira » et « Tests unitaires avec Jest ».
