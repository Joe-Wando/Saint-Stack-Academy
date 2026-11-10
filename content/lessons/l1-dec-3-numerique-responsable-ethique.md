---
slug: l1-dec-3-numerique-responsable-ethique
titre: "Numérique responsable, données personnelles et éthique"
domaine: Métiers et compétences
duree: 90
difficulte: découverte
licence:
  - { niveau: L1, semestre: S1, ue: "Découverte de l'informatique et de ses métiers" }
ordre: 3
prerequis_cours: [l1-dec-1-panorama-informatique]
visibilite: public
objectifs:
  - Expliquer ce qu'est une donnée personnelle et les principes de sa protection
  - Connaître les obligations de la loi sénégalaise de 2008 et du RGPD européen
  - Adopter les bonnes pratiques de sécurité personnelle (mots de passe, double authentification, hameçonnage)
  - Mesurer l'impact environnemental du numérique et les gestes pour le réduire
  - Identifier les grandes questions éthiques (biais des algorithmes, propriété intellectuelle, intelligence artificielle)
prerequis:
  - Aucun
referentiels:
  - Loi sénégalaise n° 2008-12 sur la protection des données à caractère personnel
  - Règlement général sur la protection des données (RGPD, Union européenne, 2016)
  - Code d'éthique et de conduite professionnelle de l'ACM (2018)
  - Cisco Networking Academy, « Introduction to Cybersecurity »
quiz:
  - question: "Laquelle de ces informations est une donnée personnelle ?"
    choix: ["La température moyenne à Dakar", "Le numéro de téléphone d'un étudiant", "Le nombre total d'inscrits d'une école", "Le prix d'un ordinateur"]
    reponse: 1
    explication: "Une donnée personnelle permet d'identifier une personne, directement ou indirectement."
  - question: "Quelle autorité contrôle la protection des données personnelles au Sénégal ?"
    choix: ["L'ARTP", "La CDP (Commission de protection des données personnelles)", "La BCEAO", "L'UNESCO"]
    reponse: 1
    explication: "La CDP a été créée par la loi n° 2008-12. On peut lui adresser une plainte."
  - question: "Tu reçois un SMS : « Votre compte sera bloqué, confirmez votre code secret sur ce lien ». Que fais-tu ?"
    choix: ["Je clique et je saisis mon code", "Je ne clique pas : c'est très probablement de l'hameçonnage. Je contacte l'opérateur par son canal officiel", "Je transfère le SMS à mes amis", "Je réponds avec mon code"]
    reponse: 1
    explication: "Aucun service sérieux ne demande un code secret par SMS ou par e-mail."
  - question: "Quelle est la plus grande part de l'impact environnemental du numérique pour un utilisateur ?"
    choix: ["L'envoi d'e-mails", "La fabrication des équipements (téléphones, ordinateurs, écrans)", "La lecture de pages web", "Le Wi-Fi"]
    reponse: 1
    explication: "Extraire les métaux et fabriquer les appareils pèse le plus. Garder son matériel plus longtemps est le geste le plus efficace."
  - question: "Pourquoi un algorithme de recrutement entraîné sur des données passées peut-il être injuste ?"
    choix: ["Parce que les ordinateurs n'aiment pas les humains", "Parce qu'il reproduit les biais présents dans les données, par exemple des discriminations passées", "Parce qu'il est trop lent", "Il ne peut jamais l'être"]
    reponse: 1
    explication: "Un modèle apprend ce que contiennent les données, y compris leurs injustices. Il faut auditer les données et les résultats."
---

## L'idée

Le numérique donne un pouvoir considérable : collecter des millions de données, automatiser des décisions, toucher toute une population. Un informaticien est donc responsable de ce qu'il construit : respecter la **vie privée** des utilisateurs, **sécuriser** leurs données, limiter l'**impact environnemental**, et éviter que ses programmes ne soient **injustes**.

Ce n'est pas seulement une question de morale : c'est aussi la **loi**, et une exigence des employeurs.

## Les données personnelles

Une **donnée personnelle** est toute information qui permet d'identifier une personne, **directement** (nom, photo, numéro de téléphone) ou **indirectement** (numéro de matricule, adresse IP, localisation, combinaison âge + quartier + école).

Certaines données sont dites **sensibles** : santé, opinions politiques ou religieuses, origine, vie sexuelle, données biométriques. Elles demandent une protection renforcée.

## La loi : au Sénégal et ailleurs

Le Sénégal a adopté dès 2008 la **loi n° 2008-12** sur la protection des données à caractère personnel, contrôlée par la **CDP** (Commission de protection des données personnelles). L'Union européenne applique le **RGPD** depuis 2018, et il concerne aussi les entreprises africaines qui traitent les données de résidents européens. Les principes sont proches :

| Principe | Signification |
|---|---|
| **Finalité** | On collecte pour un objectif précis, annoncé à l'avance. |
| **Minimisation** | On ne collecte que ce qui est nécessaire. |
| **Consentement** ou base légale | La personne est informée et, souvent, donne son accord. |
| **Durée limitée** | On ne garde pas les données indéfiniment. |
| **Sécurité** | On protège les données contre la perte, le vol et l'accès non autorisé. |
| **Droits des personnes** | Accès, rectification, opposition, suppression. |

Pour un développeur, cela se traduit concrètement : pas de champ de formulaire inutile, des mots de passe **hachés** et jamais stockés en clair, une page de confidentialité, et une fonction pour exporter ou supprimer son compte. La plateforme Saint Stack Academy applique ces principes : tu peux le vérifier sur sa page « Confidentialité ».

## Ta sécurité personnelle

- **Des mots de passe longs et uniques** : une phrase de passe de plusieurs mots vaut mieux qu'un mot court avec des symboles. Un **gestionnaire de mots de passe** (Bitwarden, par exemple) les retient pour toi.
- **La double authentification** (2FA) : un code envoyé par une application en plus du mot de passe. Active-la sur ta messagerie, tes réseaux sociaux et GitHub.
- **L'hameçonnage** (*phishing*) : un message qui imite une banque, un opérateur ou une école pour voler un code ou de l'argent. Signes : urgence, menace, lien bizarre, fautes. Aucun service sérieux ne te demandera ton code secret.
- **Les mises à jour** de ton téléphone et de ton ordinateur.
- **Les sauvegardes** de tes cours et projets.

## L'impact environnemental du numérique

Le numérique n'est pas immatériel. Il consomme de l'électricité, de l'eau pour refroidir les datacenters, et surtout des **métaux** extraits pour fabriquer les appareils.

- La **fabrication** des équipements représente la plus grande part de l'impact d'un utilisateur, devant l'usage.
- Les **déchets électroniques** sont en forte hausse dans le monde ; une partie finit en Afrique de l'Ouest, dans des décharges où le recyclage informel expose les travailleurs à des produits toxiques.

Les gestes les plus efficaces :

1. **Garder ses appareils plus longtemps**, les réparer, acheter reconditionné.
2. Préférer le Wi-Fi à la 4G pour les gros téléchargements, et baisser la qualité vidéo quand elle n'est pas utile.
3. En tant que développeur : écrire du code **sobre**, compresser les images, éviter les pages trop lourdes. Une page légère se charge aussi plus vite sur une connexion lente.

## Les grandes questions éthiques

- **Les biais des algorithmes** : un modèle entraîné sur des données passées en reproduit les injustices. Des systèmes de reconnaissance faciale se sont montrés beaucoup moins fiables sur les peaux foncées, parce que leurs données d'entraînement étaient déséquilibrées.
- **La propriété intellectuelle** : copier du code ou une image sans respecter sa **licence** est illégal. Les licences libres (MIT, GPL, Creative Commons) précisent ce qui est permis.
- **L'intelligence artificielle** : qui est responsable d'une erreur ? Comment citer un texte produit par une IA ? Utiliser une IA pour apprendre, c'est bien ; lui faire faire ses exercices à sa place, c'est se priver de l'apprentissage.
- **L'accessibilité** : un site doit être utilisable par les personnes malvoyantes ou malentendantes. Les règles WCAG décrivent comment.

Le **code d'éthique de l'ACM** résume les devoirs du professionnel : contribuer au bien-être de la société, éviter de nuire, être honnête, respecter la vie privée et la confidentialité.

## Démonstration

1. On lit la politique de confidentialité d'une application populaire et on repère : les données collectées, la finalité, la durée de conservation, les droits.
2. On vérifie si une adresse e-mail a fuité dans une base piratée sur le site « Have I Been Pwned ».
3. On active la double authentification sur un compte GitHub.

## Exercice guidé

On veut créer un formulaire d'inscription à un club d'informatique. Pour chaque champ proposé, dis s'il est nécessaire, et pourquoi : nom, prénom, e-mail, téléphone, date de naissance, adresse complète, religion, photo, niveau d'études, numéro de carte d'identité.

## Exercice autonome

1. Rédige une politique de confidentialité courte (10 lignes) pour le formulaire du club : données collectées, finalité, durée, droits, contact.
2. Analyse un message d'hameçonnage réel ou inventé : relève au moins 4 indices.
3. Fais l'inventaire de tes appareils numériques : âge, état, et ce que tu pourrais faire pour prolonger leur durée de vie.

## Correction

Exercice guidé : **nécessaires** : nom, prénom, e-mail (pour communiquer), niveau d'études (si le club est réservé à certains niveaux). **Facultatif** : téléphone (pour un groupe de discussion, avec l'accord de la personne). **Non nécessaires, à ne pas collecter** : date de naissance complète, adresse complète, photo, numéro de carte d'identité. **Interdit sans raison légitime** : la religion, qui est une donnée sensible. C'est le principe de **minimisation**.

Exercice autonome, question 1, exemple : *« Le club collecte ton nom, ton prénom, ton e-mail et ton niveau d'études, uniquement pour gérer les inscriptions et t'envoyer les informations du club. Ces données sont accessibles aux seuls membres du bureau et supprimées un an après ton départ du club. Tu peux demander à les consulter, les corriger ou les supprimer en écrivant à l'adresse du club. Elles ne sont jamais vendues ni transmises. »*

Question 2, indices courants : sentiment d'urgence ou menace ; adresse d'expéditeur ou lien qui ne correspond pas au vrai site ; demande d'un code ou d'un mot de passe ; fautes d'orthographe ; formule impersonnelle (« Cher client »).

## Pour aller plus loin

- Le site de la CDP (cdp.sn) et le texte de la loi n° 2008-12.
- Le code d'éthique de l'ACM (acm.org/code-of-ethics).
- Le cours gratuit « Introduction to Cybersecurity » de Cisco NetAcad, avec son badge.
- Fin de l'UE « Découverte de l'informatique et de ses métiers ».
