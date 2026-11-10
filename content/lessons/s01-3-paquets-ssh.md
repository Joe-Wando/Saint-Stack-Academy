---
slug: s01-3-paquets-ssh
titre: Linux, gestion des paquets, SSH et clés
domaine: Systèmes
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Administration des systèmes", option: reseaux-systemes-cloud }
parcours:
  - { parcours: systemes, ordre: 4 }
ordre: 3
prerequis_cours: [s01-1-linux-droits]
visibilite: public
objectifs:
  - Installer, mettre à jour et supprimer des logiciels avec apt
  - Expliquer le rôle d'un dépôt de paquets et de sa signature
  - Se connecter à un serveur distant avec SSH
  - Générer une paire de clés ed25519 et s'authentifier sans mot de passe
  - Copier des fichiers avec scp ou rsync, et sécuriser le serveur SSH
prerequis:
  - Cours « Linux, utilisateurs, groupes et droits d'accès » et « Les réseaux pour développeurs, IP, ports, DNS et HTTP »
referentiels:
  - LPIC-1 (101-500), objectif 102.4 « Utiliser le gestionnaire de paquets Debian »
  - LPIC-1 (102-500), objectif 110.3 « Sécuriser les données avec le chiffrement »
  - CompTIA Linux+ (XK0-005), domaine 3 « Security »
  - ANSSI, « Recommandations pour un usage sécurisé d'(Open)SSH »
quiz:
  - question: "Quelle différence entre apt update et apt upgrade ?"
    choix: ["Aucune", "update rafraîchit la liste des paquets disponibles ; upgrade installe les nouvelles versions", "update installe tout", "upgrade supprime les anciens paquets seulement"]
    reponse: 1
    explication: "On fait toujours update avant upgrade ou install, sinon apt travaille avec une liste périmée."
  - question: "Dans une paire de clés SSH, laquelle doit-on copier sur le serveur ?"
    choix: ["La clé privée", "La clé publique (.pub)", "Les deux", "Aucune"]
    reponse: 1
    explication: "La clé publique va dans ~/.ssh/authorized_keys du serveur. La clé privée ne quitte jamais ta machine."
  - question: "Quels droits doit avoir ~/.ssh/id_ed25519 ?"
    choix: ["644", "755", "600", "777"]
    reponse: 2
    explication: "600 : lisible et modifiable par toi seul. SSH refuse d'utiliser une clé privée trop ouverte."
  - question: "Quelle option de sshd_config interdit la connexion directe en root ?"
    choix: ["PermitRootLogin no", "RootAccess false", "DenyRoot yes", "AllowRoot 0"]
    reponse: 0
    explication: "On se connecte avec un compte normal, puis on utilise sudo. Avec PasswordAuthentication no, c'est la base du durcissement SSH."
  - question: "Pourquoi préférer rsync à scp pour synchroniser un dossier ?"
    choix: ["rsync est plus ancien", "rsync ne transfère que les différences et peut reprendre un transfert", "scp ne chiffre pas", "rsync n'a pas besoin de réseau"]
    reponse: 1
    explication: "rsync compare la source et la destination et n'envoie que ce qui a changé. Les deux passent par SSH, donc sont chiffrés."
---

## Les paquets

Sous Linux, on n'installe pas un logiciel en téléchargeant un `.exe` sur un site. On passe par un **gestionnaire de paquets**, qui puise dans des **dépôts** officiels.

- Un **paquet** contient le logiciel, ses métadonnées et la liste de ses **dépendances**.
- Le **dépôt** est un serveur qui contient des milliers de paquets **signés** par la distribution. La signature garantit qu'ils n'ont pas été modifiés en chemin.
- Le gestionnaire résout les dépendances à ta place.

| Famille | Distributions | Outil |
|---|---|---|
| Debian | Debian, Ubuntu | `apt` (paquets `.deb`) |
| Red Hat | RHEL, Fedora, Rocky | `dnf` (paquets `.rpm`) |
| Alpine | Alpine, très utilisée dans Docker | `apk` |

```bash
sudo apt update                 # rafraîchir la liste des paquets disponibles
sudo apt upgrade                # mettre à jour ce qui est installé
sudo apt install nginx git curl # installer
apt search postgresql           # chercher
apt show nginx                  # décrire un paquet
sudo apt remove nginx           # désinstaller (garde la configuration)
sudo apt purge nginx            # désinstaller avec la configuration
sudo apt autoremove             # supprimer les dépendances devenues inutiles
dpkg -l | grep nginx            # vérifier ce qui est installé
```

Les dépôts sont listés dans `/etc/apt/sources.list` et `/etc/apt/sources.list.d/`. Pour installer Docker ou Node depuis leurs éditeurs, on ajoute **leur** dépôt et **leur** clé de signature, puis on fait `apt update`.

## SSH, l'accès distant chiffré

SSH (*Secure Shell*, port 22) ouvre un terminal sur une machine distante. Tout le trafic est **chiffré**. C'est la porte d'entrée de tous les serveurs Linux, et aussi le moyen de s'authentifier sur GitHub.

```bash
ssh ali@203.0.113.10            # utilisateur@machine
ssh -p 2222 ali@serveur.sn      # avec un port différent
exit                            # quitter
```

À la première connexion, SSH affiche l'**empreinte** du serveur et l'enregistre dans `~/.ssh/known_hosts`. Si cette empreinte change un jour sans raison connue, méfie-toi : quelqu'un se fait peut-être passer pour le serveur.

## Clés publique et privée

L'authentification par mot de passe peut être devinée par force brute. On utilise plutôt une **paire de clés**, issue de la cryptographie asymétrique :

- la **clé privée** reste sur ta machine. Elle prouve ton identité et ne se partage jamais ;
- la **clé publique** peut être donnée à tous. On la dépose sur les serveurs.

> Analogie : la clé publique est un cadenas ouvert que tu distribues ; seule ta clé privée peut prouver que c'est bien toi qui l'ouvres.

Le serveur envoie un défi, ta machine le signe avec la clé privée, et le serveur vérifie la signature avec la clé publique. **Aucun secret ne circule sur le réseau.**

```bash
ssh-keygen -t ed25519 -C "toi@exemple.sn"   # génère ~/.ssh/id_ed25519 (privée) et id_ed25519.pub (publique)
# une phrase de passe protège la clé privée si ton ordinateur est volé : mets-en une
ssh-copy-id ali@203.0.113.10                # copie la clé publique dans ~/.ssh/authorized_keys du serveur
ssh ali@203.0.113.10                        # plus de mot de passe demandé
```

Droits obligatoires : `~/.ssh` en **700**, la clé privée en **600** et `authorized_keys` en **600**. Sinon, SSH refuse la clé.

L'algorithme ed25519 est recommandé aujourd'hui : ses clés sont courtes, rapides et sûres. RSA reste accepté avec 3 072 bits ou plus.

### GitHub en SSH

Copie le contenu de `~/.ssh/id_ed25519.pub` dans GitHub (*Settings*, *SSH and GPG keys*), puis teste avec `ssh -T git@github.com`. Tu peux ensuite cloner avec `git@github.com:pseudo/projet.git`.

## Le fichier ~/.ssh/config

Il évite de retaper les options à chaque connexion :

```
Host prod
    HostName 203.0.113.10
    User ali
    Port 2222
    IdentityFile ~/.ssh/id_ed25519
```

Ensuite, `ssh prod` suffit.

## Copier des fichiers

```bash
scp rapport.pdf prod:/home/ali/            # copier vers le serveur
scp prod:/var/log/nginx/error.log .        # copier depuis le serveur
rsync -avz --delete dist/ prod:/var/www/site/   # synchroniser un dossier
```

Les options de `rsync` : `-a` conserve les droits et les dates, `-v` affiche le détail, `-z` compresse, et `--delete` supprime côté serveur ce qui a disparu côté local. Attention : la barre oblique finale de `dist/` signifie « le contenu de dist ».

## Sécuriser le serveur SSH

Dans `/etc/ssh/sshd_config` :

```
PermitRootLogin no
PasswordAuthentication no      # clés uniquement ; à faire APRÈS avoir vérifié que ta clé fonctionne
PubkeyAuthentication yes
```

Ensuite : `sudo sshd -t` (vérifier la syntaxe), puis `sudo systemctl reload ssh`. **Garde ta session ouverte** et teste depuis un second terminal : si tu t'es trompé, tu as encore la main pour corriger.

On complète avec le pare-feu `ufw allow OpenSSH` et `fail2ban`, qui bannit les adresses IP qui accumulent les échecs de connexion.

## Démonstration

Sans serveur distant, on s'exerce sur sa propre machine :

```bash
sudo apt update && sudo apt install -y openssh-server
sudo systemctl enable --now ssh
ssh-keygen -t ed25519 -C "demo"
ssh-copy-id $USER@localhost
ssh $USER@localhost 'hostname; whoami'      # exécute une commande à distance et revient
ls -l ~/.ssh                                # vérifie les droits
mkdir -p /tmp/src && echo test > /tmp/src/a.txt
rsync -av /tmp/src/ $USER@localhost:/tmp/dst/
```

## Exercice guidé

1. Installe `htop` et `tree`, puis affiche la version installée de chacun avec `apt show` ou `dpkg -l`.
2. Génère une clé ed25519 protégée par une phrase de passe.
3. Ajoute-la à ton compte GitHub et vérifie avec `ssh -T git@github.com`.
4. Passe le dépôt `origin` d'un de tes projets de HTTPS à SSH : `git remote set-url origin git@github.com:...`.

## Exercice autonome

1. Crée un hôte `local` dans `~/.ssh/config` qui pointe vers `localhost` avec ton utilisateur.
2. Avec `ssh local`, exécute à distance une commande qui affiche l'espace disque (`df -h`).
3. Synchronise un dossier `~/site` vers `/tmp/site-prod` avec `rsync`. Supprime un fichier en local, resynchronise avec `--delete` et observe le résultat.
4. Rédige sur ta feuille les quatre étapes sûres pour désactiver l'authentification par mot de passe sur un serveur, sans risquer de t'en retrouver exclu.

## Correction

Exercices guidé et autonome, questions 1 à 3 :

```bash
sudo apt update && sudo apt install -y htop tree && dpkg -l | grep -E "htop|tree"
ssh-keygen -t ed25519 -C "toi@exemple.sn"
cat ~/.ssh/id_ed25519.pub            # à coller dans GitHub
ssh -T git@github.com                # « Hi <pseudo>! You've successfully authenticated »
cat >> ~/.ssh/config <<EOF
Host local
    HostName localhost
    User $USER
EOF
chmod 600 ~/.ssh/config
ssh local df -h
rsync -av --delete ~/site/ local:/tmp/site-prod/
```

Exercice autonome, question 4 :

1. Copier sa clé avec `ssh-copy-id`, puis vérifier qu'on se connecte bien **sans** mot de passe.
2. Modifier `sshd_config` (`PasswordAuthentication no`, `PermitRootLogin no`) et vérifier la syntaxe avec `sshd -t`.
3. Recharger SSH avec `systemctl reload ssh` en **gardant la session actuelle ouverte**.
4. Tester une nouvelle connexion depuis un autre terminal. Si elle échoue, corriger depuis la session restée ouverte.

## Pour aller plus loin

- `ssh-agent` et `ssh-add` mémorisent la phrase de passe pour la durée d'une session.
- Le tunnel SSH `ssh -L 5432:localhost:5432 prod` donne accès à la base PostgreSQL d'un serveur sans l'exposer sur Internet.
- Les paquets `snap` et `flatpak` sont des formats universels qui fonctionnent sur toutes les distributions.
