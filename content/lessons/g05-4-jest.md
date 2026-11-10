---
slug: g05-4-jest
titre: Tests unitaires avec Jest
domaine: Qualité et tests
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Génie logiciel et qualité" }
parcours:
  - { parcours: web, ordre: 16 }
ordre: 3
prerequis_cours: [g05-2-postman]
visibilite: public
objectifs:
  - Situer les tests unitaires dans la pyramide des tests
  - Écrire des tests Jest lisibles avec describe, test et expect (structure AAA)
  - Tester les cas nominaux, les cas limites et les erreurs, y compris le code asynchrone
  - Isoler une dépendance avec des mocks (jest.fn, jest.mock)
  - Mesurer la couverture et intégrer les tests en CI, en pratiquant le TDD
prerequis:
  - JavaScript ou TypeScript (fonctions, async/await)
  - Cours « Tester une API avec Postman »
referentiels:
  - ISTQB CTFL v4.0, chapitres 2 « Testing Throughout the SDLC » et 4 « Test Analysis and Design »
  - Documentation officielle Jest
  - Kent Beck, « Test-Driven Development by Example »
quiz:
  - question: "Pourquoi la base de la pyramide des tests est-elle constituée de tests unitaires ?"
    choix: ["Ils sont plus jolis", "Ils sont rapides, nombreux, peu coûteux et localisent précisément l'erreur", "Ils testent l'interface", "Ils remplacent tous les autres tests"]
    reponse: 1
    explication: "Des milliers de tests unitaires tournent en quelques secondes ; les tests de bout en bout, lents et fragiles, sont moins nombreux."
  - question: "Quel matcher pour comparer deux objets par leur contenu ?"
    choix: ["toBe", "toEqual", "toBeTruthy", "toContain"]
    reponse: 1
    explication: "toBe compare l'identité (===) : deux objets identiques en contenu mais distincts échouent. toEqual compare récursivement le contenu."
  - question: "Comment tester qu'une fonction lève une erreur ?"
    choix: ["expect(f()).toThrow()", "expect(() => f()).toThrow('message')", "try { f() } catch {}", "expect(f).toBe(Error)"]
    reponse: 1
    explication: "Il faut passer une fonction à expect, sinon l'erreur est levée avant que Jest puisse l'attraper."
  - question: "À quoi sert un mock ?"
    choix: ["À se moquer du code", "À remplacer une dépendance (base, API, horloge) par une version contrôlée pour tester l'unité isolément", "À accélérer Node", "À mesurer la couverture"]
    reponse: 1
    explication: "Le test ne dépend plus d'une base ou d'un réseau : il est rapide, déterministe, et on vérifie aussi comment la dépendance a été appelée."
  - question: "Quel est le cycle du TDD ?"
    choix: ["Coder, tester, livrer", "Rouge (test qui échoue), Vert (code minimal qui passe), Refactor (améliorer)", "Planifier, coder, déployer", "Tester en production"]
    reponse: 1
    explication: "On écrit d'abord le test : il définit le comportement attendu et garantit que chaque ligne de code a une raison d'exister."
---

## Pourquoi tester automatiquement ?

Postman vérifie l'API **de l'extérieur**, requête par requête. Les **tests unitaires** vérifient chaque **fonction** du code, en quelques millisecondes, à chaque modification. Ils servent à :

- détecter une régression **avant** la fusion, grâce à la CI (voir le cours « Intégration continue avec GitHub Actions, premier workflow ») ;
- **modifier sans peur** : on peut réécrire une fonction et savoir immédiatement si on a cassé quelque chose ;
- **documenter** : un test décrit précisément le comportement attendu.

## La pyramide des tests

```
            ▲   E2E (Cypress)          peu nombreux, lents, réalistes
           ▲▲▲  Intégration (Supertest) API et base réelles
         ▲▲▲▲▲▲▲ Unitaires (Jest)       nombreux, rapides, isolés
```

| Niveau | Teste | Vitesse | Cours |
|---|---|---|---|
| Unitaire | une fonction ou une classe isolée | quelques ms | aujourd'hui |
| Intégration | plusieurs modules ensemble (API et base) | quelques centaines de ms | Supertest |
| De bout en bout (E2E) | l'application complète, dans un navigateur | plusieurs secondes | Cypress |

## Installer Jest

```bash
npm install -D jest
# pour TypeScript :
npm install -D jest ts-jest @types/jest && npx ts-jest config:init
```

`package.json` : `"scripts": { "test": "jest", "test:watch": "jest --watch", "test:cov": "jest --coverage" }`

Jest trouve automatiquement les fichiers `*.test.js` et `*.spec.ts`. NestJS génère d'ailleurs un fichier `.spec.ts` pour chaque service.

## Le premier test et la structure AAA

```js
// panier.js
function totalPanier(lignes, remisePct = 0) {
  if (remisePct < 0 || remisePct > 100) throw new Error('Remise invalide');
  const brut = lignes.reduce((s, l) => s + l.prix * l.quantite, 0);
  return Math.round(brut * (1 - remisePct / 100));
}
module.exports = { totalPanier };
```

```js
// panier.test.js
const { totalPanier } = require('./panier');

describe('totalPanier', () => {
  test('additionne prix × quantité', () => {
    // Arrange (préparer)
    const lignes = [{ prix: 12000, quantite: 2 }, { prix: 5000, quantite: 3 }];
    // Act (agir)
    const total = totalPanier(lignes);
    // Assert (vérifier)
    expect(total).toBe(39000);
  });

  test('applique une remise de 10 %', () => {
    expect(totalPanier([{ prix: 10000, quantite: 1 }], 10)).toBe(9000);
  });

  test('un panier vide vaut 0', () => {
    expect(totalPanier([])).toBe(0);
  });

  test.each([-1, 101])('refuse une remise de %i %%', (remise) => {
    expect(() => totalPanier([], remise)).toThrow('Remise invalide');
  });
});
```

Le calcul du premier test : 2 × 12 000 + 3 × 5 000 = 24 000 + 15 000 = **39 000**. Pour le deuxième : 10 000 × (1 − 0,10) = **9 000**.

**Les cas à couvrir** : le cas nominal, les **valeurs limites** (0, 100, −1, 101), les entrées vides et les erreurs. Un test ne vérifie qu'**une seule idée**, et son nom dit **ce qu'il vérifie**.

## Les matchers essentiels

| Matcher | Usage |
|---|---|
| `toBe(x)` | égalité stricte (nombres, chaînes, booléens) |
| `toEqual(obj)` | même contenu (objets, tableaux) |
| `toBeNull()`, `toBeUndefined()`, `toBeTruthy()` | valeurs spéciales |
| `toBeGreaterThan(n)`, `toBeCloseTo(0.3)` | nombres (`toBeCloseTo` pour les décimaux) |
| `toContain(x)`, `toHaveLength(n)` | tableaux et chaînes |
| `toMatch(/regex/)` | chaînes |
| `toThrow('msg')` | erreurs |
| `toHaveBeenCalledWith(...)` | mocks |

`0.1 + 0.2` ne vaut pas exactement `0.3` en virgule flottante. Pour les décimaux, on utilise donc `toBeCloseTo(0.3)`.

## Le code asynchrone

```js
test('charge un utilisateur', async () => {
  const u = await chargerUtilisateur(1);
  expect(u.nom).toBe('Awa');
});

test('rejette si introuvable', async () => {
  await expect(chargerUtilisateur(999)).rejects.toThrow('Introuvable');
});
```

## Les mocks : isoler la dépendance

On veut tester la **logique** de `inscrire()` sans vraie base de données ni vrai envoi d'e-mail :

```js
// inscription.js
async function inscrire({ email }, depot, mailer) {
  if (await depot.trouverParEmail(email)) throw new Error('E-mail déjà utilisé');
  const u = await depot.creer({ email });
  await mailer.envoyer(email, 'Bienvenue sur Saint Stack');
  return u;
}
```

```js
test("envoie un e-mail de bienvenue après la création", async () => {
  const depot = { trouverParEmail: jest.fn().mockResolvedValue(null), creer: jest.fn().mockResolvedValue({ id: 7 }) };
  const mailer = { envoyer: jest.fn() };

  const u = await inscrire({ email: 'awa@test.sn' }, depot, mailer);

  expect(u.id).toBe(7);
  expect(depot.creer).toHaveBeenCalledWith({ email: 'awa@test.sn' });
  expect(mailer.envoyer).toHaveBeenCalledTimes(1);
});

test("refuse un e-mail déjà utilisé et n'envoie rien", async () => {
  const depot = { trouverParEmail: jest.fn().mockResolvedValue({ id: 1 }), creer: jest.fn() };
  const mailer = { envoyer: jest.fn() };
  await expect(inscrire({ email: 'awa@test.sn' }, depot, mailer)).rejects.toThrow('déjà utilisé');
  expect(depot.creer).not.toHaveBeenCalled();
  expect(mailer.envoyer).not.toHaveBeenCalled();
});
```

Passer les dépendances en paramètres (**injection de dépendances**) rend le code testable. C'est exactement ce que fait NestJS avec ses constructeurs. `jest.mock('./module')` remplace un module entier, et `jest.useFakeTimers()` contrôle l'horloge.

## La couverture

```bash
npx jest --coverage
```

Le rapport indique le pourcentage de **lignes**, de **branches** (chaque `if` et `else`) et de **fonctions** exécutées par les tests.

Exemple chiffré : si 45 lignes sur 60 sont exécutées, la couverture des lignes vaut 45 / 60 = **75 %**.

La couverture montre ce qui n'est **pas** testé. Une couverture de 100 % ne garantit pas l'absence de bugs, car un test peut tout exécuter sans rien vérifier. Un objectif raisonnable se situe entre 70 et 80 %, et les branches sont plus parlantes que les lignes.

Pour imposer un seuil en CI, dans `jest.config.js` : `coverageThreshold: { global: { branches: 70, lines: 80 } }`.

## Le TDD (Test-Driven Development)

```
 ┌──▶ ROUGE : écrire un test qui échoue (la fonctionnalité n'existe pas encore)
 │     │
 │     ▼
 │    VERT : écrire le code MINIMAL pour que le test passe
 │     │
 │     ▼
 └─── REFACTOR : améliorer le code, les tests restent verts
```

## Démonstration

En TDD, en direct, on développe `calculerNiveau(termines, total, moyenneQuiz)`, la règle des niveaux d'une plateforme de cours : Découverte, Bases, Opérationnel.

1. On écrit les tests des seuils : 50 % des cours et 60 % aux quiz, puis 90 % et 80 %.
2. On écrit le code minimal pour que les tests passent.
3. On réécrit le code proprement, sans casser les tests.
4. On ajoute les tests à la CI GitHub Actions avec un seuil de couverture.

## Exercice guidé

Écris les tests de cette fonction, en couvrant au moins 6 cas, dont les limites :

```js
// Frais de livraison : gratuits à partir de 50 000 FCFA ; 2 000 à Dakar ; 3 500 ailleurs ; erreur si montant négatif
function fraisLivraison(montant, ville) { /* … */ }
```

Écris d'abord les tests, puis la fonction.

## Exercice autonome

1. Ajoute Jest à ton API, ou à l'API boutique, et teste toute la logique métier : calculs, validations, règles.
2. Teste un service qui dépend de la base, en simulant le dépôt (*repository*) avec des mocks.
3. Atteins 80 % de couverture des branches sur le dossier `src/metier`.
4. Ajoute `npm run test:cov` à la CI avec un seuil qui fait échouer le pipeline en dessous de 70 %.
5. Implémente en TDD une nouvelle règle : un code promo `SAINT10` donne 10 % de remise, et seulement au-delà de 20 000 FCFA.

## Correction

Exercice guidé :

```js
function fraisLivraison(montant, ville) {
  if (montant < 0) throw new Error('Montant invalide');
  if (montant >= 50000) return 0;
  return ville === 'Dakar' ? 2000 : 3500;
}

describe('fraisLivraison', () => {
  test.each([
    [10000, 'Dakar', 2000],
    [10000, 'Thiès', 3500],
    [49999, 'Dakar', 2000],     // juste sous le seuil
    [50000, 'Dakar', 0],        // pile sur le seuil
    [50001, 'Thiès', 0],        // juste au-dessus
    [0, 'Dakar', 2000],
  ])('%i FCFA à %s coûte %i', (montant, ville, attendu) => {
    expect(fraisLivraison(montant, ville)).toBe(attendu);
  });
  test('refuse un montant négatif', () => expect(() => fraisLivraison(-1, 'Dakar')).toThrow());
});
```

Les trois valeurs autour de 50 000 détectent l'erreur classique d'avoir écrit `>` au lieu de `>=`.

Exercice autonome, question 5, les tests à écrire en premier :
- 25 000 avec `SAINT10` donne 22 500 ;
- 20 000 avec `SAINT10` donne 20 000, car la remise ne s'applique qu'**au-delà** du seuil ;
- un code inconnu ne change pas le montant ;
- un code en minuscules (`saint10`) : à préciser avec le PO, puis à tester.

## Pour aller plus loin

- **Vitest** a une syntaxe compatible avec Jest et est plus rapide dans les projets Vite.
- Les tests par mutation (Stryker) modifient ton code pour vérifier que tes tests détectent bien les changements.
- Cours suivant conseillé : « Tests d'intégration d'API avec Supertest » : tester l'API entière avec une vraie base de données.
