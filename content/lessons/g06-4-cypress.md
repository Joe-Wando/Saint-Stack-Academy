---
slug: g06-4-cypress
titre: Tests de bout en bout avec Cypress
domaine: Qualité et tests
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Génie logiciel et qualité" }
parcours:
  - { parcours: web, ordre: 16 }
ordre: 5
prerequis_cours: []
visibilite: public
objectifs:
  - Expliquer le rôle et les limites des tests de bout en bout (E2E)
  - Installer Cypress et écrire un premier scénario (visit, get, click, type, should)
  - Choisir des sélecteurs robustes (data-cy, rôles accessibles)
  - Préparer l'état (cy.request, fixtures, intercept) et factoriser avec des commandes personnalisées
  - Exécuter les tests sans interface en CI et exploiter captures et vidéos
prerequis:
  - Séances Next.js et la pyramide des tests (Jest, Supertest)
referentiels:
  - ISTQB CTFL v4.0, section 2.2 (test système et test d'acceptation)
  - ISTQB Certified Tester Test Automation Engineer (CTAL-TAE)
  - Documentation Cypress, « Best Practices »
quiz:
  - question: "Pourquoi les tests E2E sont-ils au sommet de la pyramide (peu nombreux) ?"
    choix: ["Ils sont inutiles", "Ils sont lents, plus fragiles et coûteux à maintenir, mais vérifient le parcours réel de l'utilisateur", "Ils ne trouvent jamais de bug", "Ils remplacent les tests unitaires"]
    reponse: 1
    explication: "On réserve l'E2E aux parcours critiques (inscription, connexion, paiement) ; le détail des règles est testé plus bas."
  - question: "Quel sélecteur est le plus robuste ?"
    choix: ["cy.get('.btn.btn-primary.mt-4')", "cy.get('div > form > button:nth-child(3)')", "cy.get('[data-cy=valider]')", "cy.get('button').eq(2)"]
    reponse: 2
    explication: "Un attribut dédié aux tests ne change pas quand on modifie le style ou la structure de la page."
  - question: "Pourquoi éviter cy.wait(3000) ?"
    choix: ["C'est trop court", "Une attente fixe est soit trop longue (lenteur) soit trop courte (échec aléatoire) ; Cypress réessaie automatiquement les assertions", "Cypress l'interdit", "Ça plante le navigateur"]
    reponse: 1
    explication: "On attend un état : cy.contains('Bienvenue').should('be.visible'), ou une requête interceptée avec cy.wait('@alias')."
  - question: "À quoi sert cy.intercept ?"
    choix: ["À bloquer Cypress", "À observer ou simuler les requêtes réseau de l'application", "À intercepter les clics", "À capturer l'écran"]
    reponse: 1
    explication: "On peut attendre une requête, vérifier son contenu, ou renvoyer une réponse simulée (par exemple une erreur 500)."
  - question: "Comment se connecter rapidement avant chaque test sans repasser par le formulaire ?"
    choix: ["Ce n'est pas possible", "Avec cy.request vers l'API de connexion (ou cy.session) dans une commande personnalisée", "En désactivant l'authentification", "Avec cy.wait"]
    reponse: 1
    explication: "On teste le formulaire de connexion une fois ; ailleurs on prépare la session par l'API, beaucoup plus vite."
---

## Le dernier étage de la pyramide

```
            ▲   E2E : Cypress          ← aujourd'hui : le vrai navigateur, comme un utilisateur
           ▲▲▲  Intégration : Supertest
         ▲▲▲▲▲▲▲ Unitaires : Jest
```

Un **test de bout en bout** pilote un **vrai navigateur** : il ouvre la page, clique, tape au clavier et vérifie ce qui s'affiche, comme le ferait un utilisateur. Il valide que **toutes** les pièces fonctionnent ensemble : frontend, API, base et configuration.

| Avantage | Limite |
|---|---|
| teste le parcours réel | lent (plusieurs secondes par test) |
| détecte les erreurs d'intégration | plus fragile, avec des échecs aléatoires si le test est mal écrit |
| sert de documentation des parcours | plus coûteux à maintenir |

**Ce qu'on teste en E2E** : les **parcours critiques**, comme l'inscription, la connexion, l'ajout au panier et la commande, ou le passage d'un quiz. On ne vérifie pas chaque règle de calcul, qui relève des tests unitaires.

## L'installation

```bash
npm install -D cypress
npx cypress open        # interface graphique : choisir « E2E Testing » puis un navigateur
```

```ts
// cypress.config.ts
import { defineConfig } from 'cypress';
export default defineConfig({
  e2e: { baseUrl: 'http://localhost:3000', video: true, viewportWidth: 1280, viewportHeight: 800 },
});
```

Les tests se placent dans `cypress/e2e/*.cy.ts`.

## Le premier scénario

```ts
// cypress/e2e/produits.cy.ts
describe('Catalogue', () => {
  it('affiche les produits et ouvre une fiche', () => {
    cy.visit('/produits');
    cy.get('[data-cy=carte-produit]').should('have.length.at.least', 1);
    cy.contains('[data-cy=carte-produit]', 'Chemise wax').click();
    cy.url().should('match', /\/produits\/\d+$/);
    cy.get('h1').should('have.text', 'Chemise wax');
    cy.contains('12 000 FCFA').should('be.visible');
  });
});
```

| Commande | Rôle |
|---|---|
| `cy.visit(url)` | ouvrir une page |
| `cy.get(sélecteur)` | trouver des éléments |
| `cy.contains(texte)` | trouver un élément par son texte |
| `.click()`, `.type('texte')`, `.clear()`, `.check()`, `.select('valeur')` | agir |
| `.should('be.visible')`, `.should('have.text', …)`, `.should('have.length', n)` | vérifier |
| `cy.url()`, `cy.title()` | vérifier l'adresse et le titre |

**La réessai automatique** : Cypress réessaie une assertion jusqu'à 4 secondes par défaut, jusqu'à ce qu'elle passe. On n'écrit donc **jamais** `cy.wait(3000)`. On attend un **état**, par exemple `cy.contains('Produit créé').should('be.visible')`.

## Des sélecteurs robustes

```tsx
<button data-cy="valider-commande" className="rounded bg-emerald-700 ...">Valider</button>
```

| Sélecteur | Robustesse |
|---|---|
| `.bg-emerald-700.mt-4` | **fragile** : il casse si on change le style |
| `form > div:nth-child(3) > button` | **fragile** : il casse si on change la structure |
| `[data-cy=valider-commande]` | **robuste** : un attribut prévu pour les tests |
| `cy.contains('button', 'Valider')` | bon : c'est ce que voit l'utilisateur |

L'extension *Testing Library for Cypress* permet aussi de sélectionner par **rôle accessible** (`cy.findByRole('button', { name: 'Valider' })`). Elle a un double bénéfice : les tests sont robustes, et l'accessibilité de la page est vérifiée au passage.

## Préparer l'état

Un test doit partir d'un état **connu**, comme avec Supertest.

```ts
beforeEach(() => {
  cy.request('POST', 'http://localhost:4000/api/test/reinitialiser');   // route qui n'existe qu'en environnement de test
  cy.fixture('produits.json').then((produits) => {
    produits.forEach((p) => cy.request('POST', '/api/produits', p));
  });
});
```

**Les commandes personnalisées** factorisent les étapes répétées, comme la connexion :

```ts
// cypress/support/commands.ts
Cypress.Commands.add('connexion', (email: string, motDePasse: string) => {
  cy.session([email], () => {                         // la session est mise en cache entre les tests
    cy.request('POST', 'http://localhost:4000/api/auth/connexion', { email, motDePasse }).then(({ body }) => {
      window.localStorage.setItem('ssa-session', JSON.stringify(body));
    });
  });
});
// dans un test :
cy.connexion('awa@test.sn', 'motdepasse123');
cy.visit('/tableau-de-bord');
```

On teste le **formulaire** de connexion une seule fois, dans son propre scénario. Partout ailleurs, on se connecte **par l'API**, ce qui est beaucoup plus rapide.

## Observer et simuler le réseau

```ts
it("affiche un message si l'API est en panne", () => {
  cy.intercept('GET', '/api/produits*', { statusCode: 500, body: { erreur: 'panne' } }).as('produits');
  cy.visit('/produits');
  cy.wait('@produits');
  cy.contains('Impossible de charger les produits').should('be.visible');
});

it('envoie le bon corps à la création', () => {
  cy.intercept('POST', '/api/produits').as('creation');
  // … remplir et envoyer le formulaire …
  cy.wait('@creation').its('request.body').should('deep.equal', { nom: 'Sac', prix: 25000 });
});
```

`cy.intercept` permet de tester des cas difficiles à provoquer autrement : une panne, une lenteur, une liste vide.

## En CI

```bash
npx cypress run                    # sans interface, toutes les specs
```

```yaml
# GitHub Actions
      - run: docker compose up -d --wait
      - uses: cypress-io/github-action@v6
        with:
          build: npm run build
          start: npm start
          wait-on: 'http://localhost:3000'
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: captures-cypress, path: cypress/screenshots }
```

En cas d'échec, Cypress enregistre une **capture** au moment de l'erreur et une **vidéo** du scénario. On les télécharge comme artefacts (semaine 3).

## Démonstration

Sur la boutique Next.js de jeudi :

1. On ajoute des attributs `data-cy`.
2. Un scénario « parcourir le catalogue ».
3. Un scénario « créer un produit » : on remplit le formulaire, on vérifie la redirection et l'apparition du produit dans la liste.
4. Un scénario « l'API est en panne », avec `intercept`.
5. On exécute `cypress run`, puis on regarde la vidéo produite.

## Exercice guidé

Sur la plateforme Saint Stack Academy, lancée en local, écris le scénario « un apprenant passe un quiz » :

1. Il se connecte en passant par le **formulaire**.
2. Il ouvre le programme, puis le cours « Le terminal Linux ».
3. Il répond aux 5 questions, puis valide.
4. Vérifie que le score s'affiche au format « x / 5 ».

## Exercice autonome

Pour le mini-projet « annuaire » du groupe :

1. Un scénario d'inscription d'un membre : succès, puis pseudo déjà pris (message d'erreur).
2. Un scénario de recherche dans la liste.
3. Un scénario « le profil d'un membre inexistant affiche la page 404 ».
4. Une commande personnalisée `cy.ajouterMembre(...)` qui passe par l'API.
5. Un cas réseau simulé avec `intercept` (liste vide, puis erreur 500).
6. L'exécution en CI dans GitHub Actions, avec les captures en artefact si un test échoue.
7. Un bilan sur ta feuille : combien de tests unitaires, d'intégration et E2E as-tu maintenant ? La pyramide est-elle respectée ?

## Correction

Exercice guidé :

```ts
describe('Quiz', () => {
  it("un apprenant passe le quiz du terminal Linux", () => {
    cy.visit('/connexion');
    cy.get('input[type=email]').type('awa@test.sn');
    cy.get('input[type=password]').type('motdepasse123');
    cy.contains('button', /connexion|se connecter/i).click();
    cy.url().should('include', '/tableau-de-bord');
    cy.contains('a', 'Programme').click();
    cy.contains('Le terminal Linux').click();
    cy.get('.quiz fieldset').should('have.length', 5).each(($q) => {
      cy.wrap($q).find('input[type=radio]').first().check();
    });
    cy.contains('button', 'Valider mes réponses').click();
    cy.get('.score strong').invoke('text').should('match', /^\d \/ 5$/);
  });
});
```

Une amélioration : ajouter des attributs `data-cy` (`data-cy="quiz-question"`, `data-cy="quiz-valider"`) aux composants de la plateforme, au lieu de dépendre des classes CSS. C'est une bonne première contribution à la plateforme.

Exercice autonome, question 7 : une répartition saine donne par exemple 40 tests unitaires, 15 tests d'intégration et 4 à 6 tests E2E. Si tu as plus de tests E2E que de tests unitaires, la pyramide est **inversée** (on parle de « cornet de glace ») : la suite sera lente et instable.

## Pour aller plus loin

- **Playwright** (Microsoft) est l'alternative principale à Cypress : multi-navigateurs, onglets multiples, très rapide.
- `cypress-axe` vérifie automatiquement l'accessibilité de chaque page pendant les tests.
- Le bilan de la semaine : unitaires, intégration, E2E, Postman et sécurité. Tu as maintenant toute la chaîne qualité d'une équipe professionnelle.
