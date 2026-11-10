---
slug: l2-ang-1-entretien-anglais
titre: "Anglais : réussir un entretien d'embauche technique"
domaine: Métiers et compétences
duree: 90
difficulte: bases
licence:
  - { niveau: L2, semestre: S3, ue: "Langues et outils 2" }
ordre: 1
prerequis_cours: [l1-out-1-anglais-technique]
visibilite: public
objectifs:
  - Se présenter en anglais en deux minutes (« Tell me about yourself »)
  - Décrire un projet technique en anglais, avec le vocabulaire adapté
  - Répondre aux questions comportementales avec la méthode STAR
  - Expliquer son raisonnement à voix haute pendant un exercice technique
  - Poser des questions et conclure poliment un entretien
prerequis:
  - Avoir suivi « Anglais technique : lire une documentation et un message d'erreur »
referentiels:
  - Cadre européen commun de référence pour les langues (CECRL), niveau B1 à B2, production et interaction orales
  - Référentiel e-CF, compétence transversale « communication »
quiz:
  - question: "Comment commencer une réponse à « Tell me about yourself » ?"
    choix: ["Par sa date de naissance et sa famille", "Par sa situation actuelle, puis son parcours et ses projets clés, puis ce que l'on cherche", "Par ses défauts", "Par le salaire souhaité"]
    reponse: 1
    explication: "Présent, passé, futur : « I'm currently a second-year computer science student... »."
  - question: "Que signifie STAR dans la méthode de réponse aux questions comportementales ?"
    choix: ["Start, Talk, Answer, Repeat", "Situation, Task, Action, Result", "Skills, Talent, Ambition, Results", "Speak, Think, Act, Rest"]
    reponse: 1
    explication: "On décrit le contexte, sa responsabilité, ce que l'on a fait, et le résultat obtenu."
  - question: "Quelle phrase utiliser si l'on n'a pas compris une question ?"
    choix: ["What?", "Could you please rephrase the question?", "I don't care", "Next question"]
    reponse: 1
    explication: "Demander une reformulation est normal et apprécié. « Sorry, could you repeat that? » convient aussi."
  - question: "Pendant un exercice de code en entretien, que faut-il faire ?"
    choix: ["Coder en silence le plus vite possible", "Penser à voix haute : reformuler le problème, expliquer son approche, puis coder et tester", "Refuser l'exercice", "Chercher la réponse sur Internet"]
    reponse: 1
    explication: "Le recruteur évalue surtout la démarche. « Let me think out loud » est une phrase utile."
  - question: "Comment dit-on « j'ai développé une application » en anglais d'entretien ?"
    choix: ["I have developed an app, or I built an app", "I am developing an app yesterday", "I develop an app last year", "I did developing an app"]
    reponse: 0
    explication: "Pour une action terminée à un moment précis, on utilise le prétérit : « Last year, I built a booking app. »"
---

## L'idée

De nombreuses entreprises du numérique, en Afrique comme ailleurs, recrutent en **anglais** : start-up financées par des investisseurs étrangers, entreprises internationales, travail à distance pour des clients d'autres continents. Un entretien technique en anglais n'exige pas un anglais parfait, mais un anglais **clair**, avec le **vocabulaire** du métier et des réponses **structurées**.

La préparation fait toute la différence : les questions d'entretien sont très prévisibles, et l'on peut préparer la plupart des réponses à l'avance.

## Se présenter : « Tell me about yourself »

C'est presque toujours la première question. Réponds en **1 à 2 minutes**, en suivant l'ordre **présent, passé, futur** :

> *I'm currently a second-year computer science student at [school] in Dakar. I've been focusing on web development: I built a course platform with Next.js and NestJS, deployed with Docker. Last summer, I did a six-week internship in an IT support team, where I learned how to troubleshoot real users' problems. I'm now looking for an internship where I can work on a production web application and learn from experienced developers.*

| Partie | Phrases utiles |
|---|---|
| Présent | *I'm currently a ... student at ...* / *I'm passionate about ...* |
| Passé | *I've worked on ...* / *I built ...* / *During my internship at ..., I ...* |
| Futur | *I'm looking for ...* / *I'd like to ...* / *That's why I applied for this position.* |

## Le vocabulaire du métier

| Français | Anglais |
|---|---|
| un stage | an internship |
| un stagiaire | an intern |
| un poste | a position, a role |
| les compétences | skills |
| mettre en place, implémenter | to implement |
| déployer, mettre en production | to deploy, to ship |
| corriger un bogue | to fix a bug |
| tester | to test |
| la maintenance | maintenance |
| une équipe | a team |
| un chef de projet | a project manager |
| les délais | deadlines |
| un point d'équipe quotidien | a daily stand-up |
| une revue de code | a code review |

Attention aux temps : **prétérit** pour une action terminée à un moment précis (*Last year, I built...*), **present perfect** pour une expérience sans date ou qui dure encore (*I've worked with React for two years*).

## Décrire un projet

Structure en quatre temps : **le but**, **la technique**, **ton rôle**, **le résultat**.

> *The goal was to help students book study rooms. I built the frontend with React and the backend API with NestJS and PostgreSQL. I was in charge of the booking logic and the database design. We deployed it on a VPS with Docker, and about a hundred students used it during the exam period.*

Prépare-toi aux relances : *Why did you choose PostgreSQL? What was the hardest part? What would you improve?*

## Les questions comportementales et la méthode STAR

Les questions qui commencent par *Tell me about a time when...* (« Parlez-moi d'une fois où... ») évaluent ton comportement. Réponds avec **STAR** :

- **S**ituation : le contexte, en une phrase ;
- **T**ask : ta responsabilité ;
- **A**ction : ce que **tu** as fait (dis *I*, pas seulement *we*) ;
- **R**esult : le résultat, chiffré si possible, et ce que tu as appris.

> *Tell me about a time you faced a difficult bug.*
> *(S) Two days before a project deadline, our app crashed when users submitted the form. (T) I was responsible for the backend. (A) I reproduced the bug, read the logs, and found that an empty field was not validated. I added validation and a test for that case. (R) We delivered on time, and since then I always write tests for edge cases.*

Questions fréquentes : *a conflict in your team*, *a mistake you made*, *a time you learned something quickly*, *a project you're proud of*.

## L'exercice technique

Beaucoup d'entretiens comportent un exercice : un petit algorithme, une requête SQL, la lecture d'un code. Ce que le recruteur évalue avant tout, c'est ta **démarche**. Pense **à voix haute** :

1. **Reformule** : *So, if I understand correctly, I need to return the two numbers that add up to the target.*
2. **Pose des questions** : *Can the array be empty? Can there be negative numbers?*
3. **Annonce l'approche** : *A simple approach would be to check every pair, which is O(n²). Then I could improve it with a hash map.*
4. **Code**, en commentant ce que tu fais.
5. **Teste** avec un exemple : *Let me test it with this input...*

Phrases utiles : *Let me think about it for a moment.* / *I'm not sure, but my guess would be...* / *I haven't used that tool, but I've used a similar one: ...*

## Les phrases de survie

| Situation | Phrase |
|---|---|
| Tu n'as pas compris | *Sorry, could you please repeat / rephrase the question?* |
| Tu as besoin de temps | *That's a good question. Let me think for a second.* |
| Tu ne sais pas | *I don't know yet, but here's how I would find out: ...* |
| Tu veux vérifier | *Do you mean ... ?* |
| Tu cherches un mot | *I'm not sure of the exact word, but it's the tool that ...* |

## Poser ses questions et conclure

À la fin, on te demandera : *Do you have any questions for us?* Réponds toujours **oui** :

- *What does a typical day look like for an intern on your team?*
- *What technologies does the team use?*
- *How do you give feedback to interns?*
- *What are the next steps in the process?*

Pour conclure : *Thank you very much for your time. I really enjoyed learning more about the team, and I'm very interested in this position.* Puis un court e-mail de remerciement, en anglais, le jour même.

## Démonstration

On simule un entretien de 10 minutes en anglais, en visioconférence : présentation, une question sur un projet, une question STAR, un mini-exercice (« écrire une fonction qui inverse une chaîne »), puis les questions du candidat. On réécoute l'enregistrement et on relève les phrases à améliorer.

## Exercice guidé

1. Écris ta réponse à *Tell me about yourself* (120 à 150 mots), selon la structure présent, passé, futur.
2. Écris la description d'un de tes projets en quatre temps : but, technique, rôle, résultat.

## Exercice autonome

1. Prépare deux réponses STAR, en anglais, aux questions : *Tell me about a time you worked in a team* et *Tell me about a mistake you made*.
2. Enregistre-toi en répondant aux trois questions, puis réécoute : note ta vitesse, tes hésitations et tes erreurs de temps.
3. Résous à voix haute, en anglais, l'exercice suivant : *Write a function that returns True if a word is a palindrome.*

## Correction

Exercice autonome, question 1, exemple :

> *Tell me about a time you worked in a team.*
> *(S) In my second year, we had to build a web app in a team of four in three weeks. (T) I was in charge of the database and the API. (A) At the beginning, we often worked on the same files and had Git conflicts, so I suggested we use one branch per feature and short daily meetings. (R) We had fewer conflicts, delivered on time, and got one of the best grades. I learned that good organization is as important as good code.*

Question 3, exemple de raisonnement à voix haute : *So I need to check if a word reads the same backwards. Should I ignore uppercase letters? Let's say yes. My approach: convert to lowercase, then compare the word with its reverse. In Python, that's `word.lower() == word.lower()[::-1]`. Let me test: "Kayak" gives True, "Dakar" gives False. The complexity is O(n).*

## Pour aller plus loin

- Les vidéos d'entretiens simulés (*mock interviews*) disponibles en ligne, et les plateformes d'entraînement à deux, comme Pramp.
- Le site « LeetCode » ou « HackerRank » pour s'entraîner aux exercices d'algorithmique, en anglais.
- Cours suivant : « Anglais : écrire un README, un ticket et des messages de commit ».
