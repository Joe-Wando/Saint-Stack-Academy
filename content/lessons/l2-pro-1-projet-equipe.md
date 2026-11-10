---
slug: l2-pro-1-projet-equipe
titre: "Conduire un projet informatique en équipe"
domaine: Gestion de projet
duree: 120
difficulte: bases
licence:
  - { niveau: L2, semestre: S4, ue: "Pratiques professionnelles 2" }
ordre: 1
prerequis_cours: [g01-4-git-conflits-pr]
visibilite: public
objectifs:
  - Cadrer un projet (besoin, objectifs, périmètre, livrables, contraintes)
  - Découper le travail en tâches et estimer leur charge
  - Organiser une équipe avec des rôles, des rituels et des outils
  - Suivre l'avancement et gérer les risques
  - Collaborer sur le code avec Git (branches, pull requests, revues) et gérer les désaccords
prerequis:
  - Git, branches, conflits et pull requests
referentiels:
  - Scrum Guide (K. Schwaber et J. Sutherland, 2020)
  - PMI, « PMBOK Guide », septième édition (principes de gestion de projet)
  - ACM/IEEE CS2023, domaine « Software Engineering » (travail en équipe, processus)
quiz:
  - question: "Que décrit le périmètre d'un projet ?"
    choix: ["La taille de l'équipe", "Ce qui est inclus dans le projet, et aussi ce qui est explicitement exclu", "Le budget", "Le planning"]
    reponse: 1
    explication: "Écrire ce qui est hors périmètre évite les demandes qui s'ajoutent sans fin (« scope creep »)."
  - question: "Qu'est-ce qu'un MVP ?"
    choix: ["Le meilleur joueur de l'équipe", "Le produit minimum viable : la plus petite version utile, livrée tôt pour être testée", "Un document de spécifications", "Un logiciel de gestion de projet"]
    reponse: 1
    explication: "On livre d'abord l'essentiel qui fonctionne, puis on ajoute des fonctionnalités."
  - question: "Dans Scrum, à quoi sert la rétrospective ?"
    choix: ["À présenter le produit au client", "À améliorer la façon de travailler de l'équipe à la fin de chaque sprint", "À estimer les tâches", "À corriger les bogues"]
    reponse: 1
    explication: "On se demande ce qui a bien marché, ce qui a moins bien marché, et ce que l'on change au prochain sprint."
  - question: "Pourquoi chaque fonctionnalité est-elle développée dans sa propre branche ?"
    choix: ["Pour ralentir le projet", "Pour travailler en parallèle sans casser la branche principale, et faire relire le code avant de l'intégrer", "Parce que Git l'impose", "Pour cacher le code"]
    reponse: 1
    explication: "La branche main reste toujours fonctionnelle et livrable."
  - question: "Un membre de l'équipe ne livre pas ses tâches. Quelle est la première chose à faire ?"
    choix: ["Le signaler directement à l'enseignant", "Lui parler en privé pour comprendre la situation et chercher une solution ensemble", "Faire son travail sans rien dire", "L'exclure du groupe de discussion"]
    reponse: 1
    explication: "Il peut avoir une difficulté technique ou personnelle. On escalade seulement si le dialogue n'aboutit pas."
---

## L'idée

En entreprise, presque aucun logiciel n'est écrit par une personne seule. Un projet réussi dépend autant de l'**organisation** et de la **communication** que de la qualité du code. Les causes d'échec les plus fréquentes ne sont pas techniques : objectif flou, travail mal réparti, problèmes découverts trop tard, conflits non réglés.

Les projets de groupe de ta licence sont un terrain d'entraînement idéal. Ce cours donne une méthode simple, inspirée de **Scrum** et des pratiques de gestion de projet, adaptée à une équipe de 3 à 6 étudiants sur quelques semaines.

## Cadrer le projet

Avant d'écrire la moindre ligne de code, l'équipe rédige une **note de cadrage** d'une page :

| Rubrique | Question |
|---|---|
| **Besoin** | Quel problème résout-on, pour qui ? |
| **Objectifs** | Que doit-on avoir atteint à la fin, de façon mesurable ? |
| **Périmètre** | Ce qui est inclus, et surtout ce qui est **exclu** |
| **Livrables** | Code, application en ligne, documentation, rapport, soutenance |
| **Contraintes** | Date de rendu, technologies imposées, compétences de l'équipe |
| **Risques** | Ce qui pourrait mal tourner, et comment on s'y prépare |

Définis un **MVP** (*Minimum Viable Product*) : la plus petite version **utile** du produit. On le livre d'abord, puis on ajoute les fonctionnalités secondaires s'il reste du temps. Mieux vaut une application simple qui fonctionne qu'une application ambitieuse inachevée.

## Découper le travail

On transforme le besoin en **user stories** (récits utilisateur) :

> *En tant qu'**étudiant**, je veux **réserver une salle pour un créneau**, afin de **travailler au calme avec mon groupe**.*

Chaque story a des **critères d'acceptation** vérifiables (« la salle n'apparaît plus comme disponible sur ce créneau »). On découpe ensuite chaque story en **tâches** techniques de quelques heures (créer la table, écrire la route d'API, construire le formulaire, écrire les tests).

On **estime** chaque tâche, par exemple en points (1, 2, 3, 5, 8) ou en demi-journées. Les estimations sont toujours imprécises au début : elles s'améliorent au fil des sprints.

## Organiser l'équipe

**Les rôles** (inspirés de Scrum) :

- le **Product Owner** : il connaît le besoin et décide des priorités ;
- le **Scrum Master**, ou coordinateur : il anime les réunions et lève les obstacles ;
- les **développeurs** : toute l'équipe, y compris les deux précédents dans un projet étudiant.

Répartis le travail par **fonctionnalité** plutôt que par couche technique : si une personne ne fait que la base de données, elle est bloquée au début et désœuvrée à la fin. Fais aussi tourner les sujets, pour que chacun apprenne.

**Les rituels**, adaptés à un projet étudiant :

| Rituel | Fréquence | Durée | Objectif |
|---|---|---|---|
| Planification du sprint | début de chaque sprint (1 ou 2 semaines) | 1 h | choisir les stories du sprint |
| Point rapide (*stand-up*) | 2 à 3 fois par semaine | 15 min | qu'ai-je fait ? que vais-je faire ? suis-je bloqué ? |
| Revue de sprint | fin de sprint | 30 min | montrer ce qui fonctionne |
| Rétrospective | fin de sprint | 30 min | améliorer la façon de travailler |

## Les outils

- **Un tableau de tâches** (Kanban) : colonnes *À faire*, *En cours*, *En revue*, *Terminé*. GitHub Projects, Trello ou Jira (voir le cours « Scrum en pratique avec Jira »).
- **Git et GitHub** : une branche par fonctionnalité, une **pull request** relue par un autre membre avant la fusion dans `main`, qui reste toujours fonctionnelle.
- **Un canal de discussion** dédié au projet, et un **document partagé** pour les décisions.
- **L'intégration continue** si possible : les tests se lancent automatiquement à chaque pull request.

**Une règle d'or** : une tâche n'est « terminée » que si elle respecte la **définition de terminé** de l'équipe, par exemple : code relu, testé, fusionné, et documenté si nécessaire.

## Suivre l'avancement et gérer les risques

- Le tableau Kanban montre en un coup d'œil où en est le projet.
- Signale un retard **dès qu'il apparaît**, pas la veille du rendu.
- Tiens un **registre des risques** simple :

| Risque | Probabilité | Impact | Prévention |
|---|---|---|---|
| Un membre tombe malade la dernière semaine | moyenne | fort | chaque fonctionnalité connue par deux personnes |
| L'hébergement ne fonctionne pas le jour de la soutenance | faible | fort | déployer une semaine avant, préparer une vidéo de démonstration |
| Fonctionnalité trop complexe | forte | moyen | commencer par le MVP |

- Garde une **marge** : prévois de terminer le développement plusieurs jours avant la date de rendu, pour les tests, la documentation et les imprévus.

## Communiquer et gérer les désaccords

- **Les décisions sont écrites** (dans le document partagé), avec leur raison.
- **Les désaccords techniques** se règlent par des **arguments** (performances, simplicité, délais), éventuellement par un petit test, puis l'équipe décide et s'y tient.
- **Un membre qui ne participe pas** : on lui parle d'abord **en privé**, sans accuser, pour comprendre (difficulté technique, problème personnel, malentendu sur la tâche). Si rien ne change, on en parle à l'encadrant, avec des faits (tâches attribuées, dates).
- **Reconnais le travail des autres**, en réunion comme dans les revues de code.

## Démonstration

On lance un projet fictif : « une application de covoiturage pour les étudiants de l'école ». En 30 minutes, on rédige la note de cadrage, on définit le MVP (publier un trajet, rechercher un trajet, réserver une place), on écrit 6 user stories, on crée le tableau dans GitHub Projects, et on planifie le premier sprint d'une semaine.

## Exercice guidé

Pour le projet « application de signalement des pannes de matériel dans les salles de TP » :

1. Rédige la note de cadrage.
2. Définis le MVP.
3. Écris 5 user stories avec un critère d'acceptation chacune.

## Exercice autonome

1. Découpe deux de tes user stories en tâches techniques, et estime-les.
2. Propose une organisation pour une équipe de 4 personnes sur 4 semaines : rôles, sprints, rituels, outils, définition de terminé.
3. Établis le registre des risques du projet (au moins 4 risques).

## Correction

Exercice guidé, exemple :

- **Besoin** : les pannes des salles de TP sont signalées oralement et oubliées ; le technicien n'a pas de vue d'ensemble.
- **Objectif** : chaque panne est enregistrée, attribuée et suivie jusqu'à sa résolution.
- **Périmètre** : signalement par les étudiants et les enseignants, suivi par le technicien. **Exclu** : la gestion du stock de pièces et les achats.
- **MVP** : signaler une panne (poste, description, photo facultative) ; voir la liste des pannes ouvertes ; changer le statut (ouverte, en cours, résolue).
- **Stories** : « En tant qu'étudiant, je veux signaler une panne sur un poste, afin qu'elle soit réparée » (critère : la panne apparaît dans la liste du technicien avec le statut *ouverte*) ; « En tant que technicien, je veux filtrer les pannes par salle, afin de planifier mes interventions » ; « En tant que technicien, je veux marquer une panne comme résolue, afin que l'auteur soit informé » ; « En tant qu'enseignant, je veux voir l'état des postes d'une salle avant mon TP » ; « En tant qu'administrateur, je veux ajouter des salles et des postes ».

Exercice autonome, question 2, exemple : 4 sprints d'une semaine ; un Product Owner (en lien avec l'enseignant), un coordinateur, tout le monde développe ; trois stand-ups par semaine ; GitHub Projects et une branche par story ; définition de terminé : code relu par un autre membre, testé, fusionné, déployé sur l'environnement de démonstration.

## Pour aller plus loin

- Le Scrum Guide officiel (scrumguides.org), court et gratuit, disponible en français.
- Le cours « Scrum en pratique avec Jira » de la plateforme, pour l'outil.
- Cours suivant : « Préparer sa soutenance ».
