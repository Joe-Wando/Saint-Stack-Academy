---
slug: g01-1-terminal-linux
titre: Le terminal Linux, se déplacer et manipuler des fichiers
domaine: Systèmes et outils
duree: 120
difficulte: découverte
licence:
  - { niveau: L1, semestre: S2, ue: "Systèmes d'exploitation" }
parcours:
  - { parcours: devops, ordre: 1 }
  - { parcours: systemes, ordre: 1 }
ordre: 1
prerequis_cours: []
visibilite: public
objectifs:
  - Expliquer ce qu'est un shell et pourquoi les métiers DevOps l'utilisent tous les jours
  - Lire et écrire un chemin absolu et un chemin relatif
  - Se déplacer dans l'arborescence avec pwd, ls et cd
  - Créer, copier, déplacer et supprimer des fichiers et des dossiers
  - Lire un fichier et chercher du texte avec cat, less, head, tail et grep
  - Enchaîner deux commandes avec un tube (|) et rediriger une sortie (>, >>)
prerequis:
  - Un terminal Linux disponible (Ubuntu, WSL sous Windows, ou le Terminal de macOS)
referentiels:
  - LPI Linux Essentials (010-160), thème 2 « Trouver son chemin sur un système Linux »
  - CompTIA Linux+ (XK0-005), domaine 1 « System Management »
  - SWEBOK v4, chapitre « Software Engineering Operations »
quiz:
  - question: "Tu es dans /home/ali/projets. Quelle commande t'amène dans /home/ali ?"
    choix: ["cd /", "cd ..", "cd ~/projets", "cd ."]
    reponse: 1
    explication: ".. désigne toujours le dossier parent. « . » est le dossier courant et « / » la racine."
  - question: "Lequel de ces chemins est absolu ?"
    choix: ["docs/notes.txt", "./notes.txt", "/etc/hosts", "../notes.txt"]
    reponse: 2
    explication: "Un chemin absolu commence par / : il part de la racine et ne dépend pas du dossier où tu te trouves."
  - question: "Quelle commande supprime le dossier « vieux » et tout ce qu'il contient ?"
    choix: ["rm vieux", "rmdir vieux", "rm -r vieux", "del vieux"]
    reponse: 2
    explication: "rm -r (récursif) descend dans le dossier. rmdir ne supprime qu'un dossier vide. Attention : il n'y a pas de corbeille."
  - question: "Que fait « ls -l > liste.txt » ?"
    choix: ["Affiche la liste puis la copie dans liste.txt", "Écrit la liste dans liste.txt en écrasant son contenu", "Ajoute la liste à la fin de liste.txt", "Lit liste.txt"]
    reponse: 1
    explication: "> redirige la sortie vers un fichier et l'écrase. >> ajoute à la fin sans écraser."
  - question: "Que fait « cat journal.log | grep ERREUR | wc -l » ?"
    choix: ["Supprime les lignes ERREUR", "Compte les lignes qui contiennent ERREUR", "Affiche les 10 premières erreurs", "Crée un fichier ERREUR"]
    reponse: 1
    explication: "Le tube | passe la sortie d'une commande à la suivante : cat lit, grep filtre, wc -l compte les lignes."
---

## Pourquoi le terminal ?

Un serveur de production n'a ni écran ni souris. On s'y connecte à distance et on lui parle **en texte**. Docker, Git, Kubernetes, les pipelines CI/CD : tous s'utilisent d'abord en ligne de commande. Savoir utiliser le terminal est donc la première compétence d'un développeur ou d'un ingénieur DevOps.

Trois mots à distinguer :

| Terme | Ce que c'est | Exemple |
|---|---|---|
| **Terminal** | La fenêtre dans laquelle on tape | GNOME Terminal, Windows Terminal |
| **Shell** | Le programme qui lit ta commande et l'exécute | `bash`, `zsh` |
| **Commande** | Un programme que le shell lance | `ls`, `cd`, `grep` |

> Analogie : le terminal est le téléphone, le shell est l'interlocuteur à l'autre bout, et la commande est ta phrase.

## Anatomie d'une commande

```
ls  -l  -a  /etc
│   └─┬──┘  └─ argument : sur quoi agir
│     └─ options : comment agir (souvent précédées de -)
└─ commande : quoi faire
```

Les options courtes peuvent se combiner : `ls -la` revient à `ls -l -a`. Pour lire l'aide d'une commande : `man ls` (on quitte avec `q`) ou `ls --help`.

## L'arborescence et les chemins

Sous Linux, tout part d'une seule racine notée `/`. Il n'y a pas de `C:` ni de `D:`.

```
/
├── etc/        fichiers de configuration
├── home/
│   └── ali/    ton dossier personnel, noté ~
├── var/log/    journaux du système
└── tmp/        fichiers temporaires
```

- **Chemin absolu** : il commence par `/`, par exemple `/home/ali/projets`. Il est valable où que tu sois.
- **Chemin relatif** : il part du dossier courant, par exemple `projets/api`.
- Raccourcis : `.` (ici), `..` (le parent), `~` (ton dossier personnel).

## Se déplacer : pwd, ls, cd

| Commande | Rôle |
|---|---|
| `pwd` | *print working directory* : affiche où je suis |
| `ls` | liste le contenu du dossier ; `ls -l` en détail, `ls -a` avec les fichiers cachés (ceux qui commencent par un point) |
| `cd chemin` | change de dossier ; `cd` seul ramène à `~`, `cd -` revient au dossier précédent |

Astuce indispensable : la touche **Tab** complète les noms. Appuie dessus deux fois pour voir toutes les possibilités. Les flèches haut et bas parcourent l'historique des commandes.

## Créer, copier, déplacer, supprimer

| Commande | Rôle | Exemple |
|---|---|---|
| `mkdir` | crée un dossier ; `-p` crée aussi les parents | `mkdir -p site/css` |
| `touch` | crée un fichier vide | `touch index.html` |
| `cp` | copie ; `-r` pour un dossier | `cp index.html sauvegarde.html` |
| `mv` | déplace **ou** renomme | `mv sauvegarde.html old.html` |
| `rm` | supprime ; `-r` pour un dossier | `rm old.html` |

> Attention : `rm` ne passe pas par une corbeille. Ce qui est supprimé est perdu. Prends l'habitude de faire `ls` avant `rm`, et n'utilise jamais `rm -rf` sans avoir relu la commande.

## Lire et chercher

| Commande | Rôle |
|---|---|
| `cat f` | affiche tout le fichier |
| `less f` | affiche page par page (espace pour avancer, `/mot` pour chercher, `q` pour quitter) |
| `head -n 5 f` / `tail -n 5 f` | les 5 premières ou les 5 dernières lignes |
| `tail -f f` | suit un fichier en direct ; c'est ainsi qu'on surveille un journal |
| `grep motif f` | affiche les lignes qui contiennent le motif ; `-i` ignore la casse, `-r` cherche dans un dossier entier |
| `wc -l f` | compte les lignes |

## Rediriger et enchaîner

Chaque commande a une **sortie standard**, c'est-à-dire ce qu'elle affiche à l'écran. On peut la détourner.

- `commande > fichier` écrit la sortie dans le fichier (et **écrase** son contenu).
- `commande >> fichier` ajoute la sortie à la fin du fichier.
- `commande1 | commande2` : le **tube** donne la sortie de la première commande en entrée à la seconde.

Exemple chiffré. Un fichier `acces.log` contient 1 000 lignes, dont 37 contiennent `404` :

```bash
grep 404 acces.log | wc -l      # affiche 37
grep 404 acces.log > erreurs.txt  # erreurs.txt contient les 37 lignes
```

C'est la philosophie Unix : de petits outils qui font une seule chose et que l'on combine.

## Démonstration

Reproduis chaque ligne et observe le résultat avant de passer à la suivante.

```bash
cd ~                          # je pars de mon dossier personnel
mkdir -p atelier/site/css     # je crée trois niveaux d'un coup
cd atelier/site
pwd                           # /home/<toi>/atelier/site
touch index.html css/style.css
ls -l                         # index.html et le dossier css
echo "<h1>Bonjour</h1>" > index.html
echo "<p>Saint Stack</p>" >> index.html
cat index.html                # deux lignes
cp index.html accueil.html
mv accueil.html css/          # déplacé dans css
ls css                        # accueil.html  style.css
grep -r "Bonjour" .           # cherche dans tout le dossier courant
cd ../..                      # je remonte de deux niveaux
rm -r atelier                 # je nettoie
```

## Exercice guidé

On prépare l'arborescence d'un projet d'API.

1. Depuis `~`, crée en une seule commande `api-boutique/src/routes` et `api-boutique/tests`.
2. Dans `api-boutique`, crée les fichiers vides `README.md`, `src/main.js` et `src/routes/produits.js`.
3. Écris la ligne `# API Boutique` dans `README.md`, puis ajoute la ligne `Projet d'entraînement` sans écraser la première.
4. Copie `src/routes/produits.js` en `src/routes/clients.js`.
5. Affiche l'arborescence avec `ls -R`.

Indice pour l'étape 1 : `mkdir -p` accepte plusieurs chemins à la suite.

## Exercice autonome

Télécharge un journal d'exemple puis réponds aux questions **avec une seule commande chacune** :

```bash
curl -sL https://raw.githubusercontent.com/elastic/examples/master/Common%20Data%20Formats/apache_logs/apache_logs -o acces.log
```

Si le téléchargement échoue, crée ce fichier avec quelques lignes contenant `GET`, `POST` et `404`.

1. Combien de lignes le fichier contient-il ?
2. Affiche les 3 dernières lignes.
3. Combien de requêtes ont reçu un code `404` ?
4. Enregistre toutes les lignes contenant `POST` dans `post.txt`.
5. Combien de lignes contiennent `Chrome`, sans tenir compte de la casse ?

## Correction

Exercice guidé :

```bash
cd ~
mkdir -p api-boutique/src/routes api-boutique/tests
cd api-boutique
touch README.md src/main.js src/routes/produits.js
echo "# API Boutique" > README.md
echo "Projet d'entraînement" >> README.md
cp src/routes/produits.js src/routes/clients.js
ls -R
```

Exercice autonome :

```bash
wc -l acces.log                    # 1. environ 10 000 lignes dans le fichier d'exemple
tail -n 3 acces.log                # 2.
grep " 404 " acces.log | wc -l     # 3. les espaces évitent de compter « 404 » ailleurs, par exemple dans une taille
grep POST acces.log > post.txt     # 4.
grep -i chrome acces.log | wc -l   # 5.
```

Remarque pour la question 3 : `grep -c " 404 " acces.log` donne le même résultat en une seule commande, car `-c` compte les lignes trouvées.

## Pour aller plus loin

- `find . -name "*.js"` : trouver des fichiers par leur nom.
- `history | grep docker` : retrouver une ancienne commande.
- Le jeu en ligne *OverTheWire Bandit* (niveaux 0 à 10) entraîne exactement ces commandes.
- Cours suivant conseillé : « Linux, utilisateurs, groupes et droits d'accès », qui aborde les droits (`chmod`, `chown`) et les utilisateurs.
