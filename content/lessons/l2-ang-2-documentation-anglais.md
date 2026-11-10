---
slug: l2-ang-2-documentation-anglais
titre: "Anglais : écrire un README, un ticket et des messages de commit"
domaine: Métiers et compétences
duree: 90
difficulte: bases
licence:
  - { niveau: L2, semestre: S3, ue: "Langues et outils 2" }
  - { niveau: L2, semestre: S3, ue: "Bases de données et versionnement" }
ordre: 2
prerequis_cours: [l1-out-1-anglais-technique, g01-3-git-branches]
visibilite: public
objectifs:
  - Rédiger le README d'un projet en anglais (description, installation, utilisation)
  - Écrire des messages de commit clairs, au format Conventional Commits
  - Rédiger un ticket de bogue (issue) reproductible
  - Décrire une pull request et faire une revue de code courtoise
  - Appliquer les règles de l'anglais technique simple (phrases courtes, impératif, voix active)
prerequis:
  - Lire de l'anglais technique
  - Utiliser Git et GitHub (commits, branches)
referentiels:
  - Google, « Technical Writing One » et « Technical Writing Two »
  - Spécification Conventional Commits 1.0.0
  - GitHub Docs, « About READMEs » et « About issues »
quiz:
  - question: "Quel est le meilleur message de commit ?"
    choix: ["update", "fixed stuff", "fix(auth): reject expired reset tokens", "J'ai corrigé un bug dans le fichier auth"]
    reponse: 2
    explication: "Le format Conventional Commits indique le type, la portée et un résumé à l'impératif, en moins de 72 caractères."
  - question: "À quel mode écrit-on le résumé d'un commit en anglais ?"
    choix: ["Au passé : added login", "À l'impératif : add login", "Au futur : will add login", "Au gérondif : adding login"]
    reponse: 1
    explication: "Convention de Git : le message complète la phrase « If applied, this commit will... add login »."
  - question: "Que doit absolument contenir un ticket de bogue ?"
    choix: ["L'opinion de l'auteur sur le code", "Les étapes pour reproduire, le comportement attendu, le comportement observé et l'environnement", "Seulement le titre", "Une capture d'écran sans texte"]
    reponse: 1
    explication: "Un bogue qu'on ne peut pas reproduire est très difficile à corriger."
  - question: "Quelle section d'un README permet à un nouveau développeur de lancer le projet ?"
    choix: ["License", "Getting started (prerequisites, installation, usage)", "Acknowledgments", "Changelog"]
    reponse: 1
    explication: "Elle liste les prérequis et les commandes exactes, à copier-coller."
  - question: "Quelle formulation de revue de code est la plus constructive ?"
    choix: ["This code is bad.", "Why would you do this?", "Nit: could we extract this into a helper function? It would make it easier to test.", "Rewrite everything."]
    reponse: 2
    explication: "On propose, on explique pourquoi, et on distingue les remarques mineures (« nit ») des problèmes bloquants."
---

## L'idée

Ton code sera lu par d'autres : tes coéquipiers, les recruteurs qui visitent ton GitHub, des contributeurs du monde entier si ton projet est open source, et toi-même dans six mois. Dans la plupart des équipes, ces écrits sont en **anglais** : le README, les messages de commit, les tickets, les pull requests, les commentaires.

Bonne nouvelle : l'anglais technique demande des phrases **courtes**, un vocabulaire **simple** et des **formats** standard. Inutile d'être bilingue : il suffit d'appliquer quelques règles.

## Les règles de l'anglais technique simple

1. **Phrases courtes** : une idée par phrase.
2. **Voix active** : *The API returns a token* plutôt que *A token is returned by the API*.
3. **Impératif pour les instructions** : *Run*, *Open*, *Install*, *Click*.
4. **Mots simples** : *use* plutôt que *utilize*, *start* plutôt que *commence*.
5. **Termes constants** : si tu écris *user*, n'alterne pas avec *customer* et *client*.
6. **Pas d'humour ni d'idiomes** : ton lecteur n'est peut-être pas anglophone de naissance.

## Le README

Le README est la **vitrine** du projet : c'est la première chose que voit un recruteur sur GitHub. Structure type :

```markdown
# Room Booking

A web app to book study rooms at school, built with React, NestJS and PostgreSQL.

![Screenshot of the booking page](docs/screenshot.png)

## Features

- Browse available rooms by date
- Book and cancel a time slot
- Admin dashboard to manage rooms

## Getting started

### Prerequisites

- Docker and Docker Compose
- Node.js 22 (for local development only)

### Installation

1. Clone the repository: `git clone https://github.com/awa221/room-booking.git`
2. Copy the environment file: `cp .env.example .env`
3. Start the app: `docker compose up -d`
4. Open http://localhost:3000

## Usage

Log in with the demo account `demo@example.com` / `demo1234`, then choose a date.

## Tech stack

React, NestJS, PostgreSQL, Docker.

## License

MIT
```

Les commandes sont **exactes** et dans l'ordre : un nouveau développeur doit pouvoir lancer le projet en copiant-collant, sans deviner.

## Les messages de commit

Un bon historique Git se lit comme un journal du projet. Le format **Conventional Commits** est très répandu :

```text
<type>(<portée facultative>): <résumé à l'impératif>

<corps facultatif : pourquoi ce changement>
```

| Type | Usage |
|---|---|
| `feat` | nouvelle fonctionnalité |
| `fix` | correction de bogue |
| `docs` | documentation |
| `refactor` | restructuration sans changement de comportement |
| `test` | ajout ou correction de tests |
| `chore` | maintenance (dépendances, configuration) |

Exemples :

```text
feat(booking): allow users to cancel a reservation
fix(auth): reject expired password reset tokens
docs: add installation steps to README
refactor(api): extract room availability check into a service
```

Règles : résumé à l'**impératif** (*add*, pas *added*), moins de **72 caractères**, sans point final. Un commit = **un** changement logique.

## Le ticket de bogue (issue)

```markdown
**Title:** Booking form crashes when the date field is empty

**Steps to reproduce**
1. Log in as a student
2. Go to "Book a room"
3. Leave the date empty and click "Book"

**Expected behavior**
An error message asks the user to choose a date.

**Actual behavior**
The page goes blank. The console shows:
`TypeError: Cannot read properties of undefined (reading 'toISOString')`

**Environment**
Chrome 130, Windows 11, version 1.2.0 (commit a1b2c3d)
```

Le **titre** décrit le problème, pas la solution. Les **étapes** permettent de le reproduire. On sépare toujours ce qui était **attendu** de ce qui a été **observé**, et on copie les messages d'erreur **en texte**, pas seulement en capture.

## La pull request et la revue de code

Une **pull request** (PR) propose d'intégrer une branche. Sa description explique **quoi** et **pourquoi** :

```markdown
## What
Add the ability to cancel a booking from the "My bookings" page.

## Why
Students asked for it: they had to contact an admin to cancel. Closes #42.

## How to test
1. Book a room
2. Go to "My bookings" and click "Cancel"
3. The slot is available again on the booking page

## Notes
I added a confirmation dialog to avoid accidental cancellations.
```

`Closes #42` ferme automatiquement le ticket 42 quand la PR est fusionnée.

Pour **commenter** le code des autres, reste courtois et précis :

| Intention | Formulation |
|---|---|
| Suggérer | *What do you think about...? / Could we...?* |
| Expliquer | *... because it would make it easier to test.* |
| Remarque mineure | *Nit: typo in the variable name.* |
| Problème bloquant | *Blocking: this query is vulnerable to SQL injection. Could we use a parameterized query?* |
| Féliciter | *Nice, this is much clearer than before!* |

On commente le **code**, jamais la **personne**.

## Les commentaires dans le code

Un bon commentaire explique le **pourquoi**, pas le **quoi** (le code le dit déjà) :

```python
# Bad: increment i
i += 1

# Good: the API is 1-indexed, unlike our arrays
page = index + 1
```

## Démonstration

On reprend un dépôt d'étudiant avec un README vide et un historique de commits du type « update », « fix », « final version 2 ». On écrit ensemble le README, on rédige un ticket pour un vrai bogue, puis on ouvre une pull request avec une description complète, et on fait une revue de code en anglais.

## Exercice guidé

Réécris ces messages de commit au format Conventional Commits :

1. « j'ai ajouté la page de connexion »
2. « correction bug »
3. « maj readme »
4. « changé le nom des variables dans user.service »

## Exercice autonome

1. Écris le README en anglais d'un de tes projets (un programme C, un site web ou une API), avec au moins : description, fonctionnalités, installation, utilisation.
2. Rédige un ticket de bogue en anglais pour un problème réel rencontré dans un logiciel ou un site.
3. Rédige trois commentaires de revue de code en anglais pour cet extrait, en distinguant remarque mineure et problème bloquant :

```python
def get_user(id):
    q = "SELECT * FROM users WHERE id = " + id
    return db.execute(q)
```

## Correction

Exercice guidé :

1. `feat(auth): add login page`
2. Trop vague : il faut dire quel bogue, par exemple `fix(cart): prevent negative quantities`.
3. `docs: update README with installation steps`
4. `refactor(user): rename variables in user service for clarity`

Exercice autonome, question 3 :

- *Blocking: this query is vulnerable to SQL injection because `id` is concatenated into the SQL string. Could we use a parameterized query instead, like `db.execute("SELECT * FROM users WHERE id = %s", (id,))`?*
- *Nit: `id` shadows a Python built-in function. Maybe rename it `user_id`?*
- *Suggestion: could we select only the columns we need instead of `SELECT *`? It would avoid returning the password hash.*

## Pour aller plus loin

- Les cours gratuits « Technical Writing One » et « Two » de Google.
- La spécification Conventional Commits (conventionalcommits.org).
- Le guide « How to write a Git commit message » de Chris Beams.
- Fin de l'UE « Langues et outils 2 ».
