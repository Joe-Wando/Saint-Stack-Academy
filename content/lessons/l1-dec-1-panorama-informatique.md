---
slug: l1-dec-1-panorama-informatique
titre: "Panorama et histoire de l'informatique"
domaine: Métiers et compétences
duree: 90
difficulte: découverte
licence:
  - { niveau: L1, semestre: S1, ue: "Découverte de l'informatique et de ses métiers" }
ordre: 1
prerequis_cours: []
visibilite: public
objectifs:
  - Définir l'informatique et distinguer ses grands domaines
  - Situer les grandes étapes de son histoire, des calculateurs mécaniques à l'intelligence artificielle
  - Distinguer matériel, logiciel, système d'exploitation, application et réseau
  - Expliquer ce qui se passe quand on ouvre une page web
  - Situer le numérique en Afrique et au Sénégal
prerequis:
  - Aucun
referentiels:
  - ACM/IEEE CS2023 et ACM IT2017 (définition des domaines de l'informatique)
  - ACM, « Computing Curricula 2020 » (CC2020), panorama des disciplines
  - Cisco Networking Academy, « Introduction to IoT and Digital Transformation »
quiz:
  - question: "Qui est considérée comme l'auteure du premier programme informatique, au XIXᵉ siècle ?"
    choix: ["Grace Hopper", "Ada Lovelace", "Marie Curie", "Katherine Johnson"]
    reponse: 1
    explication: "En 1843, Ada Lovelace décrit un algorithme destiné à la machine analytique de Charles Babbage."
  - question: "Quelle est la différence entre un système d'exploitation et une application ?"
    choix: ["Il n'y en a aucune", "Le système d'exploitation gère le matériel et sert de base aux applications ; une application répond à un besoin de l'utilisateur", "Une application est toujours gratuite", "Le système d'exploitation est un matériel"]
    reponse: 1
    explication: "Windows, Linux et Android sont des systèmes d'exploitation ; un navigateur ou WhatsApp sont des applications."
  - question: "Qu'est-ce qu'un algorithme ?"
    choix: ["Un ordinateur très puissant", "Une suite finie d'instructions précises qui résout un problème", "Un langage de programmation", "Un virus"]
    reponse: 1
    explication: "Une recette de cuisine est un algorithme. Un programme est un algorithme écrit dans un langage que la machine peut exécuter."
  - question: "Quand on tape une adresse web, quel service traduit le nom de domaine en adresse IP ?"
    choix: ["HTTP", "Le DNS", "Le Wi-Fi", "Le navigateur seul"]
    reponse: 1
    explication: "Le DNS (Domain Name System) fonctionne comme un annuaire : il associe un nom lisible à l'adresse IP du serveur."
  - question: "Quel service financier par téléphone, lancé au Kenya en 2007, est devenu un exemple mondial d'innovation numérique africaine ?"
    choix: ["PayPal", "M-Pesa", "Visa", "Stripe"]
    reponse: 1
    explication: "M-Pesa a ouvert la voie au mobile money. Au Sénégal, Wave et Orange Money en sont des héritiers."
---

## L'idée

L'informatique est la **science du traitement automatique de l'information**. Elle étudie comment représenter l'information (nombres, textes, images), comment écrire des **algorithmes** pour la transformer, et comment construire des **machines** et des **réseaux** pour les exécuter.

Elle n'est pas seulement l'usage d'un ordinateur : c'est une discipline scientifique, avec ses théories, et un ensemble de métiers techniques qui transforment tous les secteurs, de la santé à l'agriculture, de la banque à l'éducation.

## Les grands domaines

L'ACM, l'association internationale de référence, distingue plusieurs disciplines :

| Domaine | Question centrale | Exemples |
|---|---|---|
| **Informatique fondamentale** (*Computer Science*) | Que peut-on calculer, et comment, efficacement ? | Algorithmes, langages, IA |
| **Génie logiciel** (*Software Engineering*) | Comment construire des logiciels fiables, en équipe ? | Applications web et mobiles |
| **Technologies de l'information** (*Information Technology*) | Comment déployer et exploiter les systèmes d'une organisation ? | Réseaux, serveurs, support |
| **Systèmes d'information** | Comment l'informatique sert-elle les objectifs d'une entreprise ? | ERP, gestion, décisionnel |
| **Cybersécurité** | Comment protéger les systèmes et les données ? | Audit, défense, réponse aux incidents |
| **Science des données** | Comment tirer des connaissances des données ? | Statistiques, apprentissage automatique |

Ta licence, et cette plateforme, couvrent ces domaines : la L1 pose les bases communes, la L2 les approfondit, la L3 te spécialise.

## Une brève histoire

| Période | Étape |
|---|---|
| Antiquité | Le boulier, l'algorithme d'Euclide (vers −300) |
| IXᵉ siècle | Al-Khwârizmî, mathématicien de Bagdad, dont le nom a donné le mot « algorithme » |
| 1642 | La Pascaline, machine à calculer mécanique de Blaise Pascal |
| 1843 | Ada Lovelace écrit le premier programme, pour la machine analytique de Charles Babbage |
| 1936 | Alan Turing définit mathématiquement ce qu'est un calcul : la machine de Turing |
| 1945 | Architecture de von Neumann ; l'ENIAC, l'un des premiers ordinateurs électroniques, pèse 27 tonnes |
| 1947 | Invention du transistor |
| 1969 | ARPANET, ancêtre d'Internet ; début du système Unix |
| 1971 | Premier microprocesseur, l'Intel 4004 |
| 1981 | L'ordinateur personnel (PC) se démocratise |
| 1991 | Tim Berners-Lee invente le World Wide Web ; Linus Torvalds publie Linux |
| 2007 | Le smartphone moderne ; M-Pesa au Kenya |
| Années 2010 | Le cloud, le big data, l'apprentissage profond |
| Années 2020 | L'intelligence artificielle générative |

Retiens une tendance : la **loi de Moore**. Le nombre de transistors sur une puce a doublé environ tous les deux ans pendant des décennies. Ton téléphone est des millions de fois plus puissant que l'ordinateur qui a guidé Apollo 11 vers la Lune en 1969.

## Matériel, logiciel et réseau

- Le **matériel** (*hardware*) : ce que l'on peut toucher. Processeur, mémoire, disque, écran, câbles.
- Le **logiciel** (*software*) : les programmes.
  - Le **système d'exploitation** (Windows, Linux, macOS, Android, iOS) gère le matériel et sert de base aux autres programmes.
  - Les **applications** répondent aux besoins de l'utilisateur : navigateur, traitement de texte, jeu, WhatsApp.
- Le **réseau** relie les machines entre elles. **Internet** est le réseau mondial des réseaux ; le **Web** n'est qu'un des services qui l'utilisent, comme l'e-mail ou la visioconférence.

## Les données, les algorithmes et les programmes

- Une **donnée** est une information représentée de façon à être traitée : une note, un nom, une photo.
- Un **algorithme** est une suite finie d'instructions précises qui résout un problème. Une recette de cuisine, un itinéraire, une méthode de calcul posé sont des algorithmes.
- Un **programme** est un algorithme écrit dans un **langage de programmation** (C, Python, JavaScript...) pour être exécuté par une machine.

## Que se passe-t-il quand on ouvre une page web ?

Tu tapes `www.example.com` dans ton navigateur :

1. Le navigateur demande au **DNS** l'adresse IP du serveur, par exemple `203.0.113.10`.
2. Il ouvre une connexion avec ce serveur, chiffrée avec **HTTPS**.
3. Il envoie une **requête HTTP** : « donne-moi la page d'accueil ».
4. Le serveur exécute du code (back-end), interroge éventuellement une **base de données**, et renvoie une réponse : du HTML, du CSS, du JavaScript.
5. Le navigateur **affiche** la page et exécute le JavaScript (front-end).

Le tout prend une fraction de seconde, et traverse parfois des câbles sous-marins sur des milliers de kilomètres. Presque chaque cours de ta licence explique l'une de ces étapes.

## Le numérique en Afrique et au Sénégal

- Le **mobile money**, né avec M-Pesa au Kenya, a fait de l'Afrique un leader mondial du paiement par téléphone. Au Sénégal, Wave et Orange Money font partie du quotidien.
- Plusieurs **câbles sous-marins** arrivent à Dakar, et des **datacenters** se sont installés dans le pays, notamment le datacenter national de Diamniadio.
- Le Sénégal s'est doté d'une loi sur la protection des données personnelles dès 2008, et d'une autorité de contrôle, la **CDP**.
- Des écosystèmes de start-up se développent à Dakar, Lagos, Nairobi, Kigali ou Abidjan, et l'Afrique a la population la plus jeune du monde : les besoins en compétences numériques sont considérables.

## Démonstration

On observe le trajet d'une page web avec les outils du navigateur :

1. Ouvre un site, puis appuie sur **F12** et va dans l'onglet **Réseau** (*Network*).
2. Recharge la page : chaque ligne est une requête. Observe le code de réponse (200 = succès), le type de fichier, la taille et le temps.
3. Dans un terminal, tape `nslookup www.example.com` (ou `ping`) pour voir l'adresse IP obtenue par le DNS.

## Exercice guidé

1. Classe les éléments suivants en matériel, système d'exploitation, application ou réseau : Android, un routeur, Excel, une barrette de RAM, Linux, Google Chrome, un câble Ethernet, WhatsApp.
2. Écris l'algorithme, en français et en étapes numérotées, pour préparer un thé à la menthe, ou pour retirer de l'argent à un distributeur.

## Exercice autonome

1. Choisis une personnalité de l'histoire de l'informatique (Al-Khwârizmî, Ada Lovelace, Alan Turing, Grace Hopper, Katherine Johnson, Tim Berners-Lee, Linus Torvalds) et rédige une fiche de 10 lignes : époque, contribution, héritage aujourd'hui.
2. Décris en 5 étapes ce qui se passe quand tu envoies un paiement avec une application de mobile money.
3. Choisis un secteur au Sénégal (santé, agriculture, transport, éducation) et décris une application concrète du numérique.

## Correction

Exercice guidé, question 1 :

| Matériel | Système d'exploitation | Application | Réseau |
|---|---|---|---|
| Barrette de RAM | Android, Linux | Excel, Google Chrome, WhatsApp | Routeur, câble Ethernet |

Le routeur et le câble sont aussi du matériel, mais leur rôle est le réseau.

Question 2, exemple pour le distributeur : 1. insérer la carte ; 2. saisir le code ; 3. si le code est faux, recommencer (3 essais au maximum, sinon la carte est retenue) ; 4. choisir le montant ; 5. si le solde est suffisant, prendre les billets, sinon afficher un message ; 6. reprendre la carte et le ticket. Remarque les **conditions** et la **boucle** : ce sont les structures que tu programmeras en C.

Exercice autonome, question 2, éléments attendus : saisie du numéro et du montant dans l'application ; envoi de la demande chiffrée aux serveurs de l'opérateur ; vérification de l'identité (code) et du solde dans une base de données ; débit et crédit des deux comptes dans une même transaction ; notification aux deux personnes.

## Pour aller plus loin

- Le documentaire « The Imitation Game » (fiction) sur Alan Turing, et le livre « Les Figures de l'ombre » sur Katherine Johnson.
- Le site « Computer History Museum » (computerhistory.org) pour une chronologie illustrée.
- Cours suivant : « Les métiers de l'informatique et les parcours ».
