---
slug: g05-3-jira-scrum
titre: Scrum en pratique avec Jira
domaine: Gestion de projet
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Génie logiciel et qualité" }
parcours:
  - { parcours: devops, ordre: 19 }
  - { parcours: web, ordre: 18 }
ordre: 2
prerequis_cours: []
visibilite: public
objectifs:
  - Expliquer les valeurs agiles et le cadre Scrum (rôles, événements, artefacts)
  - Rédiger des user stories avec critères d'acceptation et les estimer en points
  - Créer un projet Scrum dans Jira, alimenter le backlog et planifier un sprint
  - Suivre un sprint (tableau, burndown, vélocité) et relier Jira à GitHub
  - Animer une revue et une rétrospective
prerequis:
  - Aucun ; un compte Atlassian gratuit (Jira Cloud, jusqu'à 10 utilisateurs)
referentiels:
  - Scrum Guide 2020 (Schwaber et Sutherland)
  - Professional Scrum Master I (PSM I, Scrum.org)
  - Manifeste agile (2001)
  - Chapitre DIT 2 « La méthode agile SCRUM »
quiz:
  - question: "Qui est responsable de l'ordre des éléments du Product Backlog ?"
    choix: ["Le Scrum Master", "Le Product Owner", "Les développeurs", "Le client directement"]
    reponse: 1
    explication: "Le Product Owner maximise la valeur du produit : il ordonne le backlog. Le Scrum Master, lui, aide l'équipe à appliquer Scrum."
  - question: "Combien de temps dure au maximum un sprint selon le Scrum Guide ?"
    choix: ["1 semaine", "1 mois", "3 mois", "Sans limite"]
    reponse: 1
    explication: "Un mois maximum, durée fixe ; la plupart des équipes choisissent 1 ou 2 semaines."
  - question: "Que signifie le critère INVEST pour une user story ?"
    choix: ["Investir de l'argent", "Indépendante, Négociable, de Valeur, Estimable, Small (petite), Testable", "Une méthode de test", "Le nom d'un outil"]
    reponse: 1
    explication: "Une story qui ne respecte pas INVEST est souvent trop grosse ou trop floue pour tenir dans un sprint."
  - question: "Une équipe a livré 21, 18 et 24 points sur ses trois derniers sprints. Quelle charge prévoir ?"
    choix: ["30 points", "Environ 21 points (la vélocité moyenne)", "63 points", "10 points"]
    reponse: 1
    explication: "(21 + 18 + 24) / 3 = 21. La vélocité sert à prévoir, pas à comparer les équipes entre elles."
  - question: "À quoi sert la Definition of Done ?"
    choix: ["À lister les bugs", "À définir les critères communs qu'un élément doit remplir pour être considéré terminé", "À fixer la date de fin du projet", "À noter les développeurs"]
    reponse: 1
    explication: "Par exemple : code relu, tests passants, CI verte, déployé en test, documentation à jour."
---

## Pourquoi l'agilité ?

Dans un projet classique « en cascade », on spécifie tout, puis on développe pendant des mois, et on découvre à la fin que ce n'était pas ce que le client voulait. L'**agilité** livre de **petits morceaux utiles**, **souvent**, et ajuste la direction au fil des retours.

**Le Manifeste agile** (2001) privilégie :

- les individus et leurs interactions, plutôt que les processus et les outils ;
- un logiciel qui fonctionne, plutôt qu'une documentation exhaustive ;
- la collaboration avec le client, plutôt que la négociation contractuelle ;
- l'adaptation au changement, plutôt que le suivi d'un plan.

**Scrum** est le cadre agile le plus répandu (voir le chapitre 2 du DIT). DevOps prolonge cette logique jusqu'à la production.

## Le cadre Scrum

```
 Product Backlog ──Sprint Planning──▶ Sprint Backlog ──▶ ┌─── Sprint (1 à 4 semaines) ───┐ ──▶ Incrément
 (ordonné par le PO)                                      │  Daily Scrum (15 min/jour)    │      livrable
                                                          └───────────────────────────────┘
                                              Sprint Review (on montre) ──▶ Rétrospective (on s'améliore)
```

**Les 3 responsabilités :**

| Rôle | Mission |
|---|---|
| **Product Owner** (PO) | maximiser la valeur : il ordonne le backlog et accepte le travail |
| **Scrum Master** | aider l'équipe à appliquer Scrum et lever les obstacles. Ce n'est pas un chef |
| **Développeurs** | réaliser l'incrément ; l'équipe s'organise elle-même, entre 3 et 9 personnes au total |

**Les 5 événements :**

| Événement | Durée maximale (sprint d'un mois) | Question |
|---|---|---|
| Sprint | 1 mois | le conteneur des autres événements |
| Sprint Planning | 8 h | quoi faire dans ce sprint, et comment ? |
| Daily Scrum | 15 min | où en est-on vers l'objectif du sprint ? |
| Sprint Review | 4 h | qu'a-t-on livré, et que fait-on ensuite ? |
| Rétrospective | 3 h | comment mieux travailler ensemble ? |

**Les 3 artefacts et leurs engagements :**

| Artefact | Engagement associé |
|---|---|
| Product Backlog | objectif de produit |
| Sprint Backlog | objectif de sprint |
| Incrément | **Definition of Done** |

## Les user stories

**Le format :** « **En tant que** <rôle>, **je veux** <action> **afin de** <bénéfice>. »

> En tant qu'apprenant, je veux voir ma moyenne aux quiz par domaine, afin de savoir quelles matières réviser.

**Les critères d'acceptation**, au format Gherkin (Étant donné, Quand, Alors) :

```
Étant donné que j'ai passé 2 quiz DevOps (4/5 et 3/5)
Quand j'ouvre mon tableau de bord
Alors la ligne DevOps affiche « 70 % »
```

Le calcul : (4/5 + 3/5) / 2 = (0,8 + 0,6) / 2 = 0,70, soit **70 %**.

**La grille INVEST** : une bonne story est **I**ndépendante, **N**égociable, porteuse de **V**aleur, **E**stimable, **S**mall (petite) et **T**estable.

**Le découpage**, du plus gros au plus fin : un **Epic** (« Suivi de progression ») contient des **Stories**, qui se découpent en **Sous-tâches** (API, interface, tests).

## L'estimation en points

On estime l'**effort relatif** (complexité, volume, incertitude) en **points**, selon une suite proche de Fibonacci : 1, 2, 3, 5, 8, 13. Au-delà de 13, la story est trop grosse et doit être découpée.

Le **Planning Poker** : chacun montre sa carte en même temps. Si les estimations divergent (2 et 13, par exemple), ceux qui sont aux extrêmes expliquent leur raisonnement, puis on revote.

La **vélocité** est le nombre de points **terminés** par sprint. Elle sert à **prévoir**.

Exemple chiffré : des vélocités de 21, 18 et 24 donnent une moyenne de **21**. Pour un backlog restant de 84 points, il faut prévoir environ 84 / 21 = **4 sprints**.

## Jira

Jira (Atlassian) est l'outil de gestion de projet agile le plus utilisé en entreprise.

1. **Créer le projet** : *Projects*, *Create project*, modèle **Scrum**, de type *team-managed*.
2. **Le backlog** : créer les Epics et les Stories, ajouter les critères d'acceptation dans la description, estimer avec le champ *Story points*, puis ordonner par glisser-déposer.
3. **Le sprint** : *Create sprint*, y faire glisser les stories jusqu'à la vélocité, fixer l'**objectif du sprint**, puis *Start sprint*.
4. **Le tableau** : colonnes *To Do*, *In Progress*, *In Review* et *Done*. Chaque développeur déplace ses tickets.
5. **Les rapports** : le **burndown chart** (le travail restant jour après jour) et le **velocity chart**.

**L'intégration avec GitHub** (application « GitHub for Jira ») : mettre la clé du ticket dans la branche, le commit ou la PR, par exemple `feature/SSA-12-moyenne-quiz`. Jira affiche alors les commits, les PR et l'état de la CI dans le ticket.

**JQL**, le langage de recherche de Jira :

```
project = SSA AND sprint in openSprints() AND assignee = currentUser() AND status != Done
```

**La Definition of Done** de notre groupe, par exemple :

- [ ] le code est relu et approuvé dans une PR ;
- [ ] les tests sont écrits et passent, et la CI est verte ;
- [ ] la fonctionnalité est déployée sur l'environnement de test ;
- [ ] les critères d'acceptation ont été vérifiés par le PO.

## La revue et la rétrospective

- **La Sprint Review** est une démonstration de ce qui est **réellement terminé**, au sens de la Definition of Done. On recueille les retours et on ajuste le backlog. Ce n'est pas une présentation de diapositives.
- **La rétrospective** suit le format « **Garder, Arrêter, Commencer** » ou « Ce qui a bien marché, ce qui peut s'améliorer, les actions ». On choisit **une ou deux actions concrètes**, avec un responsable, à mener pendant le sprint suivant.

## Démonstration

On crée le projet Jira **SSA** (Saint Stack Academy) :

1. Un Epic « Tableau de bord », découpé en 4 stories avec leurs critères d'acceptation.
2. Un Planning Poker en groupe.
3. Un sprint d'une semaine.
4. On relie Jira au dépôt GitHub, puis une branche `feature/SSA-3-...` apparaît dans le ticket.

## Exercice guidé

Rédige trois user stories pour une application de réservation de terrains de football à Dakar, avec, pour chacune, deux critères d'acceptation au format Étant donné, Quand, Alors. Vérifie-les avec la grille INVEST.

## Exercice autonome

En groupe, avec un Product Owner désigné et le formateur dans le rôle de Scrum Master :

1. Choisissez un mini-projet commun, par exemple un annuaire des membres du groupe en Next.js.
2. Créez le projet Jira, 2 Epics et au moins 8 stories estimées.
3. Fixez une Definition of Done.
4. Planifiez un sprint d'une semaine selon votre capacité réelle (4 soirées de 2 h).
5. Reliez Jira à GitHub et respectez la convention de nommage des branches.
6. À la fin du sprint : une revue de 15 minutes et une rétrospective de 15 minutes, avec 2 actions.

## Correction

Exercice guidé, un exemple :

> **En tant que** joueur, **je veux** voir les créneaux libres d'un terrain pour une date, **afin de** choisir une heure sans téléphoner.
>
> 1. Étant donné que le terrain de Sacré-Cœur est réservé le samedi de 18 h à 19 h, quand je consulte le samedi, alors le créneau de 18 h apparaît « indisponible » et celui de 19 h « libre ».
> 2. Étant donné une date passée, quand je la sélectionne, alors un message indique qu'on ne peut pas réserver dans le passé.

La vérification INVEST :
- la story est **indépendante** (elle ne dépend pas du paiement) et **testable** (les critères sont précis) ;
- elle est **petite**, environ 3 points ;
- une story comme « Gérer les réservations » serait au contraire un Epic à découper.

Exercice autonome : la qualité se juge à trois signes. Le **burndown** descend régulièrement, et pas tout d'un coup le dernier jour. Les stories « terminées » respectent **vraiment** la Definition of Done. Les actions de la rétrospective sont **précises**, par exemple « faire relire toute PR en moins de 24 h » plutôt que « mieux communiquer ».

## Pour aller plus loin

- La certification **PSM I** (Scrum.org) est accessible après une bonne lecture du Scrum Guide, qui ne fait que 13 pages.
- **Kanban** est une alternative sans sprints, avec une limite du travail en cours par colonne. Elle est très utilisée par les équipes d'exploitation.
- Le modèle de **Spotify** (squads, tribes) montre une façon d'organiser l'agilité à grande échelle.
