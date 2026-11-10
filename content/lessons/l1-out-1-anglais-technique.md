---
slug: l1-out-1-anglais-technique
titre: "Anglais technique : lire une documentation et un message d'erreur"
domaine: Métiers et compétences
duree: 90
difficulte: découverte
licence:
  - { niveau: L1, semestre: S1, ue: "Langues et outils" }
ordre: 1
prerequis_cours: []
visibilite: public
objectifs:
  - Reconnaître le vocabulaire informatique de base en anglais
  - Lire une page de documentation officielle et en extraire l'information utile
  - Comprendre un message d'erreur et le rechercher efficacement
  - Utiliser les outils de traduction avec discernement
  - Écrire une question technique simple en anglais
prerequis:
  - Notions d'anglais de l'enseignement secondaire
referentiels:
  - Cadre européen commun de référence pour les langues (CECRL), niveaux A2 à B1, compréhension écrite
  - Référentiel e-CF, compétence transversale « communication »
quiz:
  - question: "Que signifie « deprecated » dans une documentation ?"
    choix: ["Gratuit", "Obsolète : encore disponible, mais déconseillé et appelé à disparaître", "Interdit", "Nouveau"]
    reponse: 1
    explication: "Une fonction deprecated fonctionne encore, mais il faut migrer vers l'alternative indiquée."
  - question: "Le message « Permission denied » indique quel problème ?"
    choix: ["Le fichier n'existe pas", "L'utilisateur n'a pas les droits nécessaires", "Le réseau est coupé", "Le programme est trop lent"]
    reponse: 1
    explication: "On vérifie les droits du fichier, ou on utilise un compte qui a les droits (par exemple avec sudo, si c'est justifié)."
  - question: "Quel est le faux ami à connaître : « actually » signifie..."
    choix: ["Actuellement", "En fait, en réalité", "Activement", "Exactement"]
    reponse: 1
    explication: "« Actuellement » se dit « currently » ou « at the moment »."
  - question: "Pour rechercher une erreur sur le web, que faut-il copier ?"
    choix: ["Tout le terminal, avec le nom de ses fichiers personnels", "La partie générique du message d'erreur, sans les chemins et les noms propres à ton projet", "Seulement le premier mot", "Rien : il faut décrire l'erreur de mémoire"]
    reponse: 1
    explication: "Le message exact, entre guillemets, retrouve les personnes qui ont eu la même erreur."
  - question: "Dans une documentation, quelle section consulter en premier pour installer un outil ?"
    choix: ["Changelog", "Getting started, ou Installation", "License", "Contributing"]
    reponse: 1
    explication: "Getting started guide l'installation et le premier usage. Le changelog liste les changements entre versions."
---

## L'idée

La documentation des langages, des frameworks et des outils est presque toujours en **anglais**. Les messages d'erreur sont en anglais. Les meilleures réponses sur les forums sont en anglais. Lire l'anglais technique n'est donc pas une option : c'est un outil de travail quotidien, au même titre que le clavier.

Bonne nouvelle : l'anglais technique est **plus simple** que l'anglais littéraire. Les phrases sont courtes, le vocabulaire est limité et très répétitif. En quelques semaines de pratique régulière, on lit une documentation sans difficulté.

## Le vocabulaire de base

| Anglais | Français | Anglais | Français |
|---|---|---|---|
| file / folder | fichier / dossier | to run | exécuter |
| to install / to update | installer / mettre à jour | to build | compiler, construire |
| to download / to upload | télécharger / téléverser | to deploy | déployer |
| to save / to load | enregistrer / charger | to debug | déboguer |
| path | chemin | branch / merge | branche / fusionner |
| setting | paramètre, réglage | request / response | requête / réponse |
| user / password | utilisateur / mot de passe | to fetch | récupérer |
| default | par défaut | to handle | gérer, traiter |
| required / optional | obligatoire / facultatif | to throw / to catch | lever / attraper (une exception) |
| feature | fonctionnalité | bug / issue | bogue / ticket |

Les verbes des documentations sont souvent à l'**impératif** : *Run the following command*, *Open the file*, *Make sure that...* (assure-toi que...).

## Les faux amis

| Anglais | Ne signifie pas | Signifie |
|---|---|---|
| actually | actuellement | en fait |
| eventually | éventuellement | finalement |
| library | librairie | bibliothèque (de code) |
| to control | contrôler (vérifier) | commander, piloter |
| to support | supporter | prendre en charge, être compatible avec |
| sensible | sensible | raisonnable |
| achieve | achever | atteindre, réussir |

## Lire une documentation officielle

Les documentations suivent souvent le même plan :

| Section | Contenu |
|---|---|
| **Overview / Introduction** | À quoi sert l'outil |
| **Getting started / Quickstart** | Installation et premier exemple |
| **Guides / Tutorials** | Explications pas à pas par thème |
| **API reference** | La liste exhaustive des fonctions, de leurs paramètres et de leur valeur de retour |
| **FAQ / Troubleshooting** | Les problèmes fréquents et leurs solutions |
| **Changelog / Release notes** | Ce qui change d'une version à l'autre |

Méthode de lecture :

1. **Repère ton objectif** : installer ? comprendre une fonction ? corriger une erreur ?
2. **Survole** : titres, exemples de code, tableaux. Le code est universel.
3. **Lis en détail** seulement la partie utile.
4. **Repère les mots-signaux** : *Note*, *Warning* (attention), *Important*, *Deprecated* (obsolète), *Required* (obligatoire).

## Lire la page de référence d'une fonction

Exemple simplifié de la référence de `strlen` en C :

> **strlen**
> `size_t strlen(const char *str);`
> Returns the length of the given null-terminated byte string, that is, the number of characters in a character array whose first element is pointed to by `str` up to and not including the first null character.
> The behavior is undefined if `str` is not a pointer to a null-terminated byte string.

Ce qu'on en retire : la fonction **renvoie** (*returns*) la **longueur** de la chaîne, **sans compter** (*not including*) le caractère nul ; le **comportement est indéfini** (*the behavior is undefined*) si la chaîne n'est pas terminée par ce caractère.

## Comprendre un message d'erreur

| Message | Sens | Piste |
|---|---|---|
| `command not found` | La commande n'existe pas ou n'est pas installée | Faute de frappe ? Outil installé ? |
| `No such file or directory` | Le fichier ou le dossier n'existe pas à ce chemin | Vérifier le chemin et le dossier courant |
| `Permission denied` | Droits insuffisants | Vérifier les droits du fichier |
| `Connection refused` | Le serveur refuse la connexion | Le service est-il démarré ? Le bon port ? |
| `undefined reference to ...` | Le compilateur ne trouve pas une fonction | Bibliothèque oubliée à la compilation (par exemple `-lm`) |
| `Segmentation fault` | Le programme a accédé à une zone mémoire interdite | Indice de tableau, pointeur invalide |
| `expected ';' before ...` | Il manque un point-virgule | Regarder la ligne indiquée, ou celle juste avant |

Lis toujours le message **jusqu'au bout**, et repère le **fichier** et la **ligne** indiqués.

## Rechercher efficacement

1. Copie la partie **générique** du message, sans tes chemins personnels, et mets-la entre guillemets : `"undefined reference to sqrt"`.
2. Ajoute le nom de l'outil ou du langage : `gcc`, `docker`, `react`.
3. Privilégie la **documentation officielle**, puis les questions bien notées sur **Stack Overflow**, puis les **issues GitHub** du projet.
4. Vérifie la **date** et la **version** : une réponse de 2015 peut être obsolète.

## Les outils de traduction

Les traducteurs automatiques (DeepL, Google Traduction) et les assistants d'IA sont utiles pour un paragraphe difficile. Mais :

- ils traduisent parfois les **noms de commandes** ou le **code**, qu'il ne faut jamais traduire ;
- ils ne t'apprennent rien si tu les utilises pour tout.

Méthode recommandée : lis d'abord en anglais, essaie de comprendre, puis vérifie seulement les mots ou les phrases qui bloquent. Tiens un **carnet de vocabulaire** : en quelques semaines, tu n'en auras plus besoin.

## Démonstration

On ouvre la page « Get started » de la documentation de Git (git-scm.com/book) et on lit ensemble la première section. On relève les mots inconnus, puis on exécute les commandes indiquées.

Puis on compile volontairement un programme qui utilise `sqrt` sans l'option `-lm` : on lit le message `undefined reference to 'sqrt'`, on le recherche, on trouve la solution.

## Exercice guidé

Traduis et explique ces phrases tirées de documentations :

1. *Make sure Docker is running before you execute this command.*
2. *This parameter is optional. If omitted, the default value is used.*
3. *This method is deprecated and will be removed in a future release. Use `fetchAll()` instead.*
4. *Warning: running this command will permanently delete all your data.*

## Exercice autonome

1. Ouvre la page de référence de `printf` sur cppreference.com et résume en français, en 5 lignes, ce que fait `printf` et ce que renvoie la fonction.
2. Explique en français les messages : `fatal: not a git repository` et `error: failed to push some refs`. Cherche leur cause la plus fréquente.
3. Écris en anglais, en 4 à 5 phrases simples, une question pour un forum : ton programme C affiche une moyenne fausse. Indique ce que tu as fait, ce que tu attendais et ce que tu as obtenu.

## Correction

Exercice guidé :

1. « Assure-toi que Docker est lancé avant d'exécuter cette commande. »
2. « Ce paramètre est facultatif. S'il est omis, la valeur par défaut est utilisée. »
3. « Cette méthode est obsolète et sera supprimée dans une prochaine version. Utilise `fetchAll()` à la place. »
4. « Attention : exécuter cette commande supprimera définitivement toutes tes données. »

Exercice autonome :

1. `printf` écrit du texte formaté sur la sortie standard, en remplaçant les spécificateurs (`%d`, `%f`...) par les arguments. Elle renvoie le **nombre de caractères écrits**, ou une valeur négative en cas d'erreur.
2. `not a git repository` : on lance une commande Git hors d'un dépôt ; il faut se placer dans le bon dossier, ou faire `git init`. `failed to push some refs` : le dépôt distant contient des commits que l'on n'a pas en local ; il faut d'abord récupérer les changements avec `git pull`.
3. Exemple : *I wrote a C program that calculates the average of 5 grades. I expected 12.4, but the program prints 12.000000. I use int variables for the sum. Here is my code. What am I doing wrong?* (La cause : la division entière.)

## Pour aller plus loin

- Lis chaque jour un court extrait de documentation, par exemple sur developer.mozilla.org (MDN), qui existe aussi en français pour comparer.
- Le cours « Anglais : réussir un entretien d'embauche technique », en L2.
- Cours suivant : « Traitement de texte : produire un document professionnel ».
