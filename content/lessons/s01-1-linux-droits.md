---
slug: s01-1-linux-droits
titre: Linux, utilisateurs, groupes et droits d'accès
piste: solo
semaine: 1
date: 2026-11-10
domaine: Systèmes
duree: 120
niveau: bases
objectifs:
  - Lire la ligne de droits produite par ls -l
  - Modifier les droits avec chmod, en notation symbolique et en notation octale
  - Changer le propriétaire et le groupe d'un fichier avec chown et chgrp
  - Créer des utilisateurs et des groupes, et utiliser sudo à bon escient
  - Expliquer umask, le setgid sur un dossier et le sticky bit
prerequis:
  - Séance « Le terminal Linux »
referentiels:
  - LPI Linux Essentials (010-160), thème 5 « Sécurité et droits sur les fichiers »
  - LPIC-1 (101-500), objectif 104.5 « Gérer les permissions et la propriété des fichiers »
  - CompTIA Linux+ (XK0-005), domaine 3 « Security »
quiz:
  - question: "Que signifie -rwxr-x--- ?"
    choix: ["Tout le monde peut tout faire", "Propriétaire rwx, groupe r-x, autres aucun droit", "Propriétaire r-x, groupe rwx", "C'est un dossier"]
    reponse: 1
    explication: "On lit par blocs de trois : propriétaire (rwx), groupe (r-x), autres (---). Le premier caractère - indique un fichier ordinaire."
  - question: "Quelle valeur octale correspond à rw-r--r-- ?"
    choix: ["755", "644", "600", "777"]
    reponse: 1
    explication: "rw- = 4+2 = 6 ; r-- = 4 ; r-- = 4. Cela donne 644, la valeur habituelle d'un fichier texte."
  - question: "Pour entrer dans un dossier avec cd, quel droit faut-il ?"
    choix: ["r", "w", "x", "Aucun"]
    reponse: 2
    explication: "Sur un dossier, x permet de le traverser, r d'en lister le contenu et w d'y créer ou d'y supprimer des fichiers."
  - question: "Avec umask 027, quels sont les droits d'un nouveau fichier ?"
    choix: ["640", "750", "644", "027"]
    reponse: 0
    explication: "Un fichier part de 666, dont on retire les bits du masque : 666 sans 027 donne 640. Un dossier part de 777 et donne 750."
  - question: "À quoi sert le sticky bit sur /tmp ?"
    choix: ["À rendre le dossier plus rapide", "À empêcher un utilisateur de supprimer les fichiers des autres", "À exécuter les fichiers en root", "À cacher les fichiers"]
    reponse: 1
    explication: "Dans un dossier partagé en écriture, le sticky bit (t) limite la suppression d'un fichier à son propriétaire."
---

## L'idée

Linux est **multi-utilisateur** : sur un serveur, l'utilisateur `www-data` fait tourner le site web, `postgres` la base de données, et toi ton propre compte. Chacun ne doit toucher qu'à ce qui le concerne. Les **droits** sont le premier rempart de sécurité. Une mauvaise configuration, comme `chmod 777` partout ou une clé SSH lisible par tous, est une faille classique.

## Utilisateurs et groupes

- Chaque utilisateur a un identifiant numérique, l'**UID**. `root`, l'administrateur, a l'UID 0.
- Un utilisateur appartient à un **groupe principal** et éventuellement à des groupes secondaires.
- Ces informations sont stockées dans `/etc/passwd` (les comptes), `/etc/group` (les groupes) et `/etc/shadow` (les mots de passe hachés, lisibles par root seulement).

```bash
whoami            # qui suis-je ?
id                # mon UID, mon groupe principal, mes groupes
sudo adduser awa                  # créer un utilisateur (Debian et Ubuntu)
sudo groupadd devs                # créer un groupe
sudo usermod -aG devs awa         # ajouter awa au groupe devs ; -a est indispensable, sinon ses autres groupes sont retirés
su - awa                          # devenir awa
```

`sudo` exécute **une** commande avec les droits de root. On ne travaille jamais connecté en root : on élève ses droits seulement quand il le faut. C'est le **principe du moindre privilège**.

## Lire les droits

```
$ ls -l
-rw-r--r-- 1 ali devs  1024 nov 10 09:12 rapport.txt
drwxr-x--- 2 ali devs  4096 nov 10 09:15 projets
│└┬┘└┬┘└┬┘   │   │
│ │  │  │    │   └ groupe propriétaire
│ │  │  │    └ utilisateur propriétaire
│ │  │  └ droits des autres (o)
│ │  └ droits du groupe (g)
│ └ droits du propriétaire (u)
└ type : - fichier, d dossier, l lien
```

| Droit | Sur un fichier | Sur un dossier |
|---|---|---|
| `r` (read) | lire le contenu | lister les noms (`ls`) |
| `w` (write) | modifier | créer, renommer, supprimer des fichiers dedans |
| `x` (execute) | exécuter comme programme | traverser (`cd`) |

## chmod, la notation symbolique

`chmod [qui][opération][droits] fichier`

- **qui** : `u` (propriétaire), `g` (groupe), `o` (autres), `a` (tous) ;
- **opération** : `+` (ajouter), `-` (retirer), `=` (fixer exactement) ;
- **droits** : `r`, `w`, `x`.

```bash
chmod u+x deploy.sh        # rendre le script exécutable par moi
chmod go-w rapport.txt     # retirer l'écriture au groupe et aux autres
chmod o= secret.txt        # aucun droit pour les autres
```

## chmod, la notation octale

Chaque droit a une valeur : **r = 4, w = 2, x = 1**. On additionne pour chaque bloc.

| Bloc | Calcul | Chiffre |
|---|---|---|
| `rwx` | 4 + 2 + 1 | 7 |
| `rw-` | 4 + 2 | 6 |
| `r-x` | 4 + 1 | 5 |
| `r--` | 4 | 4 |
| `---` | 0 | 0 |

Exemple chiffré : `chmod 750 projets` donne `rwx` (7) au propriétaire, `r-x` (5) au groupe et `---` (0) aux autres.

Les valeurs à retenir :

| Valeur | Usage |
|---|---|
| `644` | fichier ordinaire |
| `755` | script ou dossier public |
| `600` | fichier secret, comme `~/.ssh/id_ed25519` |
| `700` | dossier privé, comme `~/.ssh` |

## Propriétaire et groupe

```bash
sudo chown awa rapport.txt          # nouveau propriétaire
sudo chown awa:devs rapport.txt     # propriétaire et groupe
sudo chgrp devs rapport.txt         # groupe seulement
sudo chown -R www-data:www-data /var/www/site   # récursif, sur tout un dossier
```

## umask, les droits par défaut

Un fichier neuf part de `666` et un dossier neuf de `777`. Le **umask** retire des bits à ces valeurs de départ.

- `umask 022` (valeur courante) : un fichier reçoit 644 et un dossier 755.
- `umask 027` : un fichier reçoit 640 et un dossier 750. Les autres n'ont plus aucun accès.

## Les droits spéciaux

| Droit | Où | Effet | Exemple |
|---|---|---|---|
| **setuid** (`s` à la place du `x` de u) | exécutable | s'exécute avec les droits de son propriétaire | `/usr/bin/passwd` |
| **setgid** (`s` à la place du `x` de g) | dossier | les fichiers créés dedans héritent du groupe du dossier | dossier d'équipe partagé |
| **sticky bit** (`t` à la place du `x` de o) | dossier | seul le propriétaire d'un fichier peut le supprimer | `/tmp` (`drwxrwxrwt`) |

```bash
sudo chmod g+s /srv/equipe    # setgid
sudo chmod +t /srv/depot      # sticky bit
```

## Démonstration : un dossier d'équipe

```bash
sudo groupadd devs
sudo adduser awa && sudo adduser moussa
sudo usermod -aG devs awa && sudo usermod -aG devs moussa
sudo mkdir -p /srv/equipe
sudo chown root:devs /srv/equipe
sudo chmod 2770 /srv/equipe     # 2 = setgid ; 770 = rwx pour le propriétaire et le groupe, rien pour les autres
ls -ld /srv/equipe              # drwxrws--- root devs
sudo -u awa touch /srv/equipe/plan.md
ls -l /srv/equipe               # plan.md appartient au groupe devs grâce au setgid
sudo -u ali ls /srv/equipe      # Permission denied si ali n'est pas dans devs
```

## Exercice guidé

1. Crée un fichier `deploy.sh` contenant `echo "déploiement"`. Essaie `./deploy.sh` : que se passe-t-il ?
2. Rends-le exécutable pour toi seul, de deux façons : en notation symbolique, puis en octal (`700`).
3. Convertis en octal : `rwxr-xr--`, `rw-------`, `rwxrwxr-x`.
4. Convertis en lettres : `640`, `711`, `664`.

## Exercice autonome

Mets en place la situation suivante sur ta machine, ou dans une machine virtuelle si tu préfères ne pas toucher à ton système :

- Un groupe `data` contenant deux utilisateurs, `analyste1` et `analyste2`.
- Un dossier `/srv/data/brut` : le groupe `data` peut lire et écrire, les autres n'ont aucun accès, et les nouveaux fichiers appartiennent automatiquement au groupe `data`.
- Un dossier `/srv/data/depot` où tout le monde peut déposer des fichiers, mais où personne ne peut supprimer ceux des autres.
- Vérifie chaque règle avec `sudo -u <utilisateur> ...`.

Question de réflexion : pourquoi `chmod -R 777 /var/www` est-il une mauvaise réponse à « mon site affiche Permission denied » ? Quelle est la bonne démarche ?

## Correction

Exercice guidé :

1. `bash: ./deploy.sh: Permission denied`, car le fichier n'a pas le droit `x`.
2. `chmod u+x deploy.sh`, ou `chmod 700 deploy.sh`.
3. `rwxr-xr--` donne **754** ; `rw-------` donne **600** ; `rwxrwxr-x` donne **775**.
4. `640` donne `rw-r-----` ; `711` donne `rwx--x--x` ; `664` donne `rw-rw-r--`.

Exercice autonome :

```bash
sudo groupadd data
sudo adduser analyste1 && sudo adduser analyste2
sudo usermod -aG data analyste1 && sudo usermod -aG data analyste2
sudo mkdir -p /srv/data/brut /srv/data/depot
sudo chown root:data /srv/data/brut && sudo chmod 2770 /srv/data/brut
sudo chmod 1777 /srv/data/depot          # 1 = sticky bit
sudo -u analyste1 touch /srv/data/depot/a.csv
sudo -u analyste2 rm /srv/data/depot/a.csv   # refusé : Operation not permitted
```

Réflexion : `777` donne l'écriture à **tous** les comptes de la machine. Un processus compromis pourrait alors modifier le site, par exemple pour y injecter du code malveillant. La bonne démarche est d'identifier quel utilisateur exécute le serveur (`ps aux | grep nginx`, souvent `www-data`), puis de lui donner la propriété ou le droit de lecture **minimal** nécessaire : `chown -R www-data:www-data`, avec `755` pour les dossiers et `644` pour les fichiers.

## Pour aller plus loin

- Les ACL (`setfacl`, `getfacl`) donnent des droits à plusieurs utilisateurs précis sur un même fichier.
- `sudo visudo` permet de définir qui a le droit d'utiliser sudo, et pour quelles commandes.
- `find / -perm -4000 2>/dev/null` liste les fichiers setuid. C'est une vérification classique en audit de sécurité.
