---
slug: l1-com-1-ecrits-professionnels
titre: "Écrire un e-mail et un rapport professionnels"
domaine: Métiers et compétences
duree: 90
difficulte: découverte
licence:
  - { niveau: L1, semestre: S1, ue: "Communication et expression" }
ordre: 1
prerequis_cours: []
visibilite: public
objectifs:
  - Rédiger un e-mail professionnel clair, avec un objet précis et une demande explicite
  - Adapter le niveau de langue au destinataire
  - Structurer un rapport technique (introduction, développement, conclusion)
  - Écrire des phrases courtes et précises, sans ambiguïté
  - Relire et corriger ses écrits avant de les envoyer
prerequis:
  - Aucun
referentiels:
  - Cadre européen commun de référence pour les langues (CECRL), production écrite
  - Référentiel e-CF, compétence transversale « communication »
  - Google Technical Writing One (developers.google.com/tech-writing)
quiz:
  - question: "Quel est le meilleur objet pour un e-mail à un enseignant ?"
    choix: ["Bonjour", "Question", "L1 Groupe B, demande de report du TP de C du 12 mars", "URGENT !!!"]
    reponse: 2
    explication: "L'objet doit permettre de comprendre le sujet sans ouvrir l'e-mail, et de le retrouver plus tard."
  - question: "Où place-t-on la demande principale dans un e-mail professionnel ?"
    choix: ["À la fin, après toutes les explications", "Dès le début, puis on donne le contexte utile", "Dans l'objet seulement", "Dans une pièce jointe"]
    reponse: 1
    explication: "Le lecteur doit comprendre en deux lignes ce qu'on attend de lui. C'est la règle de la pyramide inversée."
  - question: "Quelle formule de politesse convient pour écrire à un directeur que l'on ne connaît pas ?"
    choix: ["Bisous", "Bien à vous, ou Je vous prie d'agréer mes salutations distinguées", "À+", "Cordialement bro"]
    reponse: 1
    explication: "On reste sobre et formel avec un destinataire que l'on ne connaît pas."
  - question: "Dans un rapport, que doit contenir la conclusion ?"
    choix: ["De nouvelles informations", "La réponse à la question posée en introduction, le bilan et les perspectives", "Les remerciements", "La table des matières"]
    reponse: 1
    explication: "La conclusion ne présente pas d'idée nouvelle : elle répond à la problématique et ouvre sur la suite."
  - question: "Pourquoi éviter les tournures vagues comme « ça ne marche pas » dans un rapport technique ?"
    choix: ["Parce qu'elles sont trop longues", "Parce qu'elles ne permettent pas au lecteur de comprendre ni de reproduire le problème", "Parce qu'elles sont en français", "Elles sont acceptables"]
    reponse: 1
    explication: "On décrit précisément : ce qu'on a fait, ce qu'on attendait, ce qu'on a obtenu (message d'erreur exact)."
---

## L'idée

Un informaticien écrit beaucoup : des e-mails à des clients et à des collègues, des tickets de bogue, de la documentation, des rapports de stage, des messages de commit. Un code excellent mal expliqué est un code mal utilisé. Et un e-mail confus fait perdre du temps à tout le monde.

L'écrit professionnel obéit à une règle simple : **le lecteur est pressé**. Il doit comprendre vite ce que tu veux dire et ce que tu attends de lui.

## Les trois questions avant d'écrire

1. **À qui j'écris ?** Un enseignant, un recruteur, un client, un collègue : le ton et le vocabulaire changent.
2. **Que dois-je obtenir ?** Une réponse, une décision, une information transmise.
3. **Que doit-il savoir pour agir ?** Seulement le contexte utile, pas toute l'histoire.

## La structure d'un e-mail professionnel

| Élément | Règle | Exemple |
|---|---|---|
| **Objet** | Précis, informatif, sans majuscules agressives | « Stage développeur web : candidature d'Awa Diop » |
| **Salutation** | Adaptée au destinataire | « Bonjour Madame Ndiaye, » |
| **Première phrase** | Qui tu es (si besoin) et ce que tu demandes | « Je suis étudiante en L1 informatique et je souhaite... » |
| **Corps** | Le contexte utile, en paragraphes courts | 2 à 3 paragraphes de 2 à 3 lignes |
| **Demande** | Explicite, avec une échéance si besoin | « Pourriez-vous me répondre d'ici vendredi ? » |
| **Formule finale** | Sobre | « Bien cordialement, » |
| **Signature** | Nom, formation, téléphone | « Awa Diop, L1 Informatique, +221 ... » |

Règles pratiques :

- **Un e-mail, un sujet.** Deux sujets différents méritent deux e-mails.
- **La pyramide inversée** : l'essentiel au début, les détails ensuite.
- **Les pièces jointes** : mentionne-les dans le texte et donne-leur un nom clair (`CV_Awa_Diop.pdf`, pas `document(3).pdf`).
- **Les destinataires** : « À » pour ceux qui doivent agir, « Cc » pour ceux qui sont informés, « Cci » pour masquer les adresses dans un envoi groupé.
- **Une adresse professionnelle** : prenom.nom@..., pas une adresse fantaisiste.

## Le niveau de langue

| Destinataire | Salutation | Formule finale |
|---|---|---|
| Inconnu, hiérarchie, recruteur | « Madame, Monsieur, » ou « Bonjour Monsieur Diallo, » | « Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées. » ou « Bien à vous, » |
| Enseignant, client connu | « Bonjour Madame Sow, » | « Bien cordialement, » |
| Collègue proche | « Bonjour Moussa, » | « Merci, à bientôt » |

On évite dans tous les cas : le langage SMS, les émoticônes, les points d'exclamation multiples, et le tutoiement non proposé.

## Écrire clairement

- **Des phrases courtes** : une idée par phrase, 20 mots au maximum.
- **Des verbes actifs** : « Le serveur a rejeté la requête » plutôt que « La requête a fait l'objet d'un rejet de la part du serveur ».
- **Des mots précis** : « La page met 8 secondes à se charger sur mobile » plutôt que « Le site est lent ».
- **Des chiffres et des faits**, pas des impressions.
- **Des listes** pour les étapes ou les éléments multiples.

Pour signaler un problème technique, utilise la structure **attendu / obtenu** : « J'ai lancé `docker compose up`. J'attendais le démarrage des trois services. J'obtiens l'erreur `container db is unhealthy`. Capture d'écran jointe. »

## La structure d'un rapport technique

Un rapport (de TP, de projet, de stage) suit un plan fixe :

1. **Page de titre** : titre, auteur, formation, date, encadrant.
2. **Introduction** : le contexte, la **problématique** (la question à laquelle le rapport répond), l'annonce du plan.
3. **Développement**, en parties titrées et numérotées : l'analyse, la solution choisie et pourquoi, la réalisation, les tests et les résultats.
4. **Conclusion** : la réponse à la problématique, le bilan (réussites et limites), les perspectives.
5. **Annexes** : code, captures, schémas détaillés.

Chaque figure et chaque tableau a un **numéro** et une **légende** (« Figure 3 : architecture de l'application »), et il est cité dans le texte. Les sources sont citées : documentation officielle, articles, livres.

## Relire avant d'envoyer

- **Relis à voix haute** : les phrases trop longues se repèrent tout de suite.
- **Vérifie l'orthographe** avec le correcteur du traitement de texte ou un outil comme LanguageTool.
- **Vérifie les noms, les dates et les chiffres**.
- **Vérifie la pièce jointe** : c'est l'oubli le plus fréquent.
- Pour un e-mail important, **attends quelques minutes** avant de l'envoyer, et relis-le une dernière fois.

## Démonstration

Voici un e-mail à corriger :

> Objet : stage
> slt, jvoulais savoir si vous preniez des stagiaires svp car je cherche un stage. je suis en informatique. merci

Version corrigée :

> Objet : Candidature à un stage de développement web (juin à août 2027)
>
> Bonjour Madame Ba,
>
> Étudiant en première année de licence informatique, je souhaiterais effectuer un stage de développement web de deux mois au sein de votre entreprise, entre juin et août 2027.
>
> J'ai réalisé plusieurs projets en HTML, CSS et JavaScript, visibles sur mon portfolio : https://exemple.github.io. Votre application de livraison m'intéresse particulièrement, car elle est très utilisée à Dakar.
>
> Vous trouverez mon CV en pièce jointe. Je serais heureux d'échanger avec vous à ce sujet, à votre convenance.
>
> Bien cordialement,
> Ibrahima Faye
> L1 Informatique
> +221 77 000 00 00

On compare : objet précis, demande dès la première phrase, preuve concrète (le portfolio), personnalisation (l'entreprise est citée), pièce jointe annoncée, signature complète.

## Exercice guidé

Réécris ces deux messages de façon professionnelle :

1. À ton enseignant : « jai pas pu venir au TP hier jetais malade est-ce que je peux le rattraper »
2. À un camarade de projet : « ton code marche pas ça plante »

## Exercice autonome

1. Rédige l'e-mail qui accompagne ton premier rapport de TP, envoyé à ton enseignant.
2. Rédige le plan détaillé (titres des parties et une phrase par partie) d'un rapport sur le thème : « Choisir un ordinateur portable pour un étudiant en informatique ».
3. Écris un rapport de bogue sur un problème réel que tu as rencontré (logiciel, site, application), avec la structure attendu / obtenu.

## Correction

Exercice guidé :

1. *Objet : L1 Groupe B, absence au TP de C du 11 mars. Bonjour Monsieur Gueye, j'ai été absent au TP de langage C d'hier pour raison de santé ; je tiens mon certificat médical à votre disposition. Serait-il possible de rattraper ce TP, ou de récupérer le sujet pour le faire seul ? Je vous remercie par avance. Bien cordialement, [Prénom Nom], L1 Groupe B.*
2. *Salut Fatou, j'ai lancé ta branche `formulaire` : la page d'inscription plante quand on valide le formulaire avec un e-mail vide. L'erreur dans la console est `TypeError: email is undefined`, ligne 42 de `inscription.js`. Tu peux regarder ? Je peux t'aider si tu veux.* Le ton est amical, mais le message est **précis** : où, quand, quelle erreur, et une proposition d'aide.

Exercice autonome, question 2, exemple : 1. Les besoins d'un étudiant en informatique (logiciels, virtualisation, mobilité) ; 2. Les critères techniques (processeur, RAM, stockage, autonomie) ; 3. Comparaison de trois modèles disponibles et de leur prix ; 4. Recommandation selon le budget. Conclusion : le modèle conseillé et les points de vigilance.

## Pour aller plus loin

- Le cours gratuit « Technical Writing One » de Google, en anglais : la référence de l'écriture technique.
- Le cours « Rédiger son rapport de stage », au semestre 2.
- Cours suivant : « Présenter à l'oral ».
