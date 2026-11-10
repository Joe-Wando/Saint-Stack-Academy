---
slug: l2-pro-2-preparer-soutenance
titre: "Préparer sa soutenance de projet ou de stage"
domaine: Métiers et compétences
duree: 90
difficulte: bases
licence:
  - { niveau: L2, semestre: S4, ue: "Pratiques professionnelles 2" }
ordre: 2
prerequis_cours: [l1-com-2-presenter-oral, l1-pro-2-rapport-stage]
visibilite: public
objectifs:
  - Comprendre ce qu'un jury évalue lors d'une soutenance
  - Construire un support de soutenance adapté au temps imparti
  - Préparer une démonstration fiable, avec un plan de secours
  - Anticiper les questions du jury et y répondre avec méthode
  - Organiser une soutenance à plusieurs et répéter efficacement
prerequis:
  - Avoir suivi « Présenter à l'oral » et « Rédiger son rapport de stage »
referentiels:
  - CECRL, production orale en continu et interaction
  - Référentiel e-CF, compétences transversales (communication, argumentation)
quiz:
  - question: "Qu'évalue principalement un jury de soutenance ?"
    choix: ["La beauté des diapositives", "La compréhension du sujet, la démarche, les résultats, la capacité à prendre du recul et à répondre aux questions", "La longueur de la présentation", "Le nombre de technologies utilisées"]
    reponse: 1
    explication: "Le jury veut s'assurer que tu as compris ce que tu as fait, et pourquoi tu l'as fait ainsi."
  - question: "Pour une soutenance de 15 minutes, combien de diapositives prévoir environ ?"
    choix: ["3", "10 à 15", "40", "60"]
    reponse: 1
    explication: "Environ une minute par diapositive. Au-delà, on va trop vite et le jury décroche."
  - question: "Le jury pose une question sur une limite de ton projet. Quelle attitude adopter ?"
    choix: ["Nier la limite", "La reconnaître, expliquer pourquoi elle existe, et proposer une amélioration", "Changer de sujet", "Accuser un coéquipier"]
    reponse: 1
    explication: "Reconnaître une limite avec une piste d'amélioration montre de la maturité professionnelle."
  - question: "Que préparer en plus d'une démonstration en direct ?"
    choix: ["Rien", "Une vidéo ou des captures de la démonstration, en cas de panne de réseau ou d'application", "Un deuxième ordinateur seulement", "Un discours plus long"]
    reponse: 1
    explication: "Le plan de secours permet de continuer sereinement quoi qu'il arrive."
  - question: "Combien de fois faut-il répéter une soutenance en conditions réelles ?"
    choix: ["Jamais, il faut rester spontané", "Au moins deux ou trois fois, chronométrées, idéalement devant quelqu'un", "Une seule fois, la veille au soir", "Vingt fois"]
    reponse: 1
    explication: "La répétition permet d'ajuster le temps, de fluidifier les transitions et de réduire le stress."
---

## L'idée

La soutenance est le moment où ton travail de plusieurs semaines est évalué en **15 à 30 minutes**. Un bon projet peut être sous-évalué s'il est mal présenté ; à l'inverse, une soutenance claire met en valeur un travail même modeste.

Ce cours approfondit le cours « Présenter à l'oral » de L1, appliqué à la situation particulière de la soutenance : un **jury** qui évalue, un **temps** strict, une **démonstration** technique, et une **séance de questions**.

## Ce que le jury évalue

Renseigne-toi sur la **grille d'évaluation** de ton établissement. On y retrouve presque toujours :

| Critère | Ce que le jury veut voir |
|---|---|
| Compréhension | Tu maîtrises le sujet et les technologies utilisées |
| Démarche | Tu sais expliquer tes choix, les alternatives envisagées, et pourquoi tu les as écartées |
| Résultats | Ce qui fonctionne réellement, avec des preuves (démonstration, chiffres, tests) |
| Recul | Tu identifies les limites et les améliorations possibles |
| Communication | Clarté, structure, respect du temps, qualité du support |
| Questions | Tu réponds avec précision et honnêteté |

## Construire le déroulé

Pour une soutenance de projet de 15 minutes :

| Partie | Durée | Contenu |
|---|---|---|
| Introduction | 1 min 30 | Contexte, problème, objectifs, plan |
| Analyse et conception | 3 min | Besoins, cas d'utilisation, architecture, modèle de données |
| Réalisation | 3 min | Choix techniques et justification, points difficiles |
| Démonstration | 4 min | Le parcours principal, en direct |
| Bilan | 2 min | Résultats, tests, limites, améliorations |
| Conclusion | 1 min 30 | Réponse aux objectifs, apports personnels, perspectives |

Pour une soutenance de **stage**, la partie centrale porte sur l'entreprise (brièvement), puis les missions, puis le bilan personnel, comme dans le rapport.

**Ne raconte pas tout.** Choisis les 2 ou 3 éléments les plus intéressants : un problème technique difficile et comment tu l'as résolu intéresse davantage le jury qu'une liste de toutes les pages de l'application.

## Le support

- **Environ une diapositive par minute.**
- Un **schéma d'architecture** (les composants et leurs échanges) et un **modèle de données** simplifié sont presque toujours attendus pour un projet informatique.
- Des **captures d'écran** de l'application, si la démonstration en direct n'est pas possible.
- Peu de texte, de grandes polices, une charte cohérente (voir le cours « Présenter à l'oral »).
- Une diapositive de **plan**, et un rappel discret de la partie en cours.
- Des **numéros de diapositives** : le jury pourra dire « revenez à la diapositive 7 ».
- Des diapositives **de réserve** après la conclusion, pour répondre aux questions prévisibles (détail d'un algorithme, résultats de tests).

## La démonstration

La démonstration est souvent le moment le plus convaincant, et le plus risqué.

1. **Écris un scénario** : les étapes exactes, avec des données de test réalistes déjà créées (pas « test test 123 »).
2. **Montre le parcours principal** de l'utilisateur, du début à la fin, plutôt que toutes les fonctionnalités.
3. **Prépare l'environnement** : application déjà lancée, compte déjà créé, onglets ouverts, notifications coupées, zoom à 125 % ou 150 %.
4. **Prévois un plan de secours** : une **vidéo** de la démonstration enregistrée à l'avance, et des captures dans les diapositives de réserve.
5. **Déploie en ligne** si possible (voir les cours sur le déploiement) : le jury peut ensuite tester par lui-même.

Si quelque chose plante en direct, reste calme : « Je vais vous montrer la vidéo de ce passage », puis continue. Le jury sait que les démonstrations sont fragiles ; il évalue ta réaction.

## Les questions du jury

Prépare la **liste des questions probables**, et tes réponses :

- *Pourquoi avoir choisi cette technologie plutôt qu'une autre ?*
- *Comment avez-vous testé l'application ?*
- *Comment l'application gère-t-elle la sécurité des mots de passe ? les données personnelles ?*
- *Que se passe-t-il si 1 000 utilisateurs se connectent en même temps ?*
- *Quelle a été votre contribution personnelle ?*
- *Que feriez-vous différemment ?*
- *Quelle est la principale limite de votre solution ?*

Méthode de réponse :

1. **Écoute** la question jusqu'au bout, sans interrompre.
2. **Reformule** si elle est complexe : « Si je comprends bien, vous me demandez si... ».
3. **Réponds directement**, puis justifie brièvement.
4. **Ne bluffe pas** : « Je n'ai pas testé ce cas, mais je pense que... et je le vérifierais en... ».
5. Une **critique** n'est pas une attaque : « C'est une bonne remarque ; nous avons fait ce choix à cause du délai, et la prochaine étape serait de... ».

## La soutenance à plusieurs

- **Chacun présente la partie qu'il a réalisée**, et chacun doit pouvoir répondre sur l'ensemble du projet : le jury interroge souvent un membre sur la partie d'un autre.
- Le temps de parole est **équilibré**.
- Les **transitions** sont préparées : « Maintenant, Ibrahima va vous présenter l'architecture ».
- On se tient **ensemble**, face au jury ; ceux qui ne parlent pas restent attentifs.
- On ne se **contredit** pas devant le jury, et l'on ne rejette pas la faute sur un coéquipier.

## Répéter

- **Au moins deux ou trois répétitions complètes**, chronométrées, avec le vrai support et la vraie démonstration.
- Une répétition **devant quelqu'un** (camarade, famille) qui pose des questions.
- Un **enregistrement vidéo** pour repérer les tics, la vitesse et la posture.
- La veille : vérifie le matériel (adaptateur HDMI, chargeur, clé USB avec le support en PDF), et **dors**.

## Démonstration

On regarde deux soutenances de 5 minutes sur le même projet. La première lit des diapositives chargées et lance une démonstration qui échoue sans plan B. La seconde suit le déroulé de ce cours, avec un schéma d'architecture, une démonstration courte et une vidéo de secours. Le groupe les évalue avec la grille du jury, puis on simule une séance de questions.

## Exercice guidé

Pour ton projet de groupe ou ton stage, construis le **déroulé** de ta soutenance : les parties, leur durée et le titre de chaque diapositive.

## Exercice autonome

1. Rédige le **scénario de démonstration** (étapes, données de test, phrases d'accompagnement) et enregistre la vidéo de secours.
2. Écris les **10 questions** les plus probables du jury, avec tes réponses en 2 ou 3 phrases.
3. Fais une **répétition chronométrée** devant un camarade, qui te pose 3 questions et remplit la grille d'évaluation.

## Correction

Exercice guidé, exemple pour l'application de signalement des pannes (15 minutes) :

1. *Titre et équipe* ; 2. *Les pannes signalées oralement sont oubliées* (le problème, avec un chiffre) ; 3. *Objectifs et plan* ; 4. *Trois acteurs, six cas d'utilisation* ; 5. *Une architecture en trois services* (schéma) ; 6. *Le modèle de données* ; 7. *Pourquoi NestJS et PostgreSQL* ; 8. *Le défi : notifier le technicien en temps réel* ; 9. *Démonstration* ; 10. *Tests : 42 tests, 85 % de couverture* ; 11. *Limites et améliorations* ; 12. *Ce que le projet nous a appris* ; puis les diapositives de réserve.

Exercice autonome, question 2, exemple de réponse : *« Que se passe-t-il si 1 000 utilisateurs se connectent en même temps ? »* — « Nous ne l'avons pas mesuré. L'API est sans état, on pourrait donc lancer plusieurs instances derrière un répartiteur de charge, et la base PostgreSQL supporte facilement ce volume pour des requêtes simples. Pour le vérifier, nous ferions un test de charge, par exemple avec l'outil k6. »

## Pour aller plus loin

- Le mode **Présenter** des cours de la plateforme, pour s'entraîner à exposer un chapitre.
- Le cours « Conduire un projet informatique en équipe » pour organiser le travail en amont.
- Fin de l'UE « Pratiques professionnelles 2 ».
