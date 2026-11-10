---
slug: s01-2-processus-services
titre: Linux, processus, services systemd et journaux
piste: solo
semaine: 1
date: 2026-11-11
domaine: Systèmes
duree: 120
niveau: bases
objectifs:
  - Lister et surveiller les processus avec ps, top et htop
  - Envoyer un signal à un processus avec kill, en distinguant SIGTERM et SIGKILL
  - Passer un programme en arrière-plan et l'y ramener (&, jobs, fg, bg, nohup)
  - Gérer un service avec systemctl et écrire une unité systemd simple
  - Lire les journaux avec journalctl et dans /var/log
prerequis:
  - Séance « Linux, utilisateurs, groupes et droits d'accès »
referentiels:
  - LPIC-1 (101-500), objectifs 101.3 « Niveaux d'exécution et cibles systemd » et 103.5 « Créer, surveiller et tuer des processus »
  - LPIC-1 (102-500), objectif 108.2 « Journalisation du système »
  - CompTIA Linux+ (XK0-005), domaines 1 et 4
quiz:
  - question: "Quelle différence entre kill -15 et kill -9 ?"
    choix: ["Aucune", "-15 (SIGTERM) demande poliment l'arrêt ; -9 (SIGKILL) tue immédiatement sans nettoyage", "-9 redémarre le processus", "-15 suspend le processus"]
    reponse: 1
    explication: "On essaie toujours SIGTERM d'abord : le programme peut fermer ses fichiers et ses connexions. SIGKILL ne peut être ni intercepté ni ignoré."
  - question: "Quelle commande fait démarrer un service à chaque démarrage de la machine ?"
    choix: ["systemctl start nginx", "systemctl enable nginx", "systemctl status nginx", "service nginx run"]
    reponse: 1
    explication: "enable programme le démarrage automatique, start lance le service maintenant. systemctl enable --now fait les deux."
  - question: "Comment suivre en direct les journaux du service api ?"
    choix: ["journalctl -u api -f", "cat /var/log/api", "systemctl logs api", "tail api"]
    reponse: 0
    explication: "-u filtre par unité, -f suit le journal en continu, comme tail -f."
  - question: "Que fait la touche Ctrl+Z dans un terminal ?"
    choix: ["Tue le processus", "Suspend le processus au premier plan", "Annule la dernière commande", "Ferme le terminal"]
    reponse: 1
    explication: "Ctrl+Z envoie SIGTSTP : le processus est suspendu. bg le relance en arrière-plan, fg le ramène au premier plan. Ctrl+C, lui, envoie SIGINT."
  - question: "Dans une unité systemd, à quoi sert Restart=on-failure ?"
    choix: ["À redémarrer le serveur", "À relancer le service s'il s'arrête en erreur", "À empêcher le démarrage", "À vider les journaux"]
    reponse: 1
    explication: "Si le processus s'arrête avec un code d'erreur, systemd le relance automatiquement. C'est la base d'un service robuste."
---

## L'idée

Un **programme** est un fichier sur le disque. Un **processus** est ce programme **en cours d'exécution**, avec sa mémoire et son identifiant. Un **service**, ou démon, est un processus qui tourne en permanence en arrière-plan : un serveur web, une base de données, ton API NestJS en production.

Le travail d'un administrateur système ou d'un ingénieur DevOps consiste à les surveiller, les relancer et lire leurs journaux quand quelque chose casse.

## Les processus

Chaque processus a un **PID** (son identifiant), un **PPID** (le PID de son parent), un utilisateur propriétaire, et consomme du processeur et de la mémoire. Le processus numéro 1 est `systemd` : tous les autres en descendent.

```bash
ps aux                  # tous les processus (a : tous les utilisateurs, u : format détaillé, x : même sans terminal)
ps aux | grep node      # trouver mes processus Node
pgrep -a node           # plus simple : PID et ligne de commande
pstree -p               # l'arbre des processus
top                     # vue en direct ; P trie par processeur, M par mémoire, q quitte
htop                    # version plus lisible (sudo apt install htop)
```

Dans `top`, la ligne `load average: 0.52, 0.80, 1.10` donne la charge moyenne sur 1, 5 et 15 minutes. Sur une machine à 4 cœurs, une charge de 4 signifie que tous les cœurs sont occupés.

## Les signaux

On parle à un processus en lui envoyant un **signal**.

| Signal | Numéro | Effet | Raccourci |
|---|---|---|---|
| SIGINT | 2 | interruption | Ctrl+C |
| SIGTERM | 15 | demande d'arrêt propre (signal par défaut de `kill`) | |
| SIGKILL | 9 | arrêt immédiat, impossible à intercepter | |
| SIGTSTP | 20 | suspension | Ctrl+Z |
| SIGHUP | 1 | « recharge ta configuration », pour de nombreux démons | |

```bash
kill 4321            # SIGTERM
kill -9 4321         # SIGKILL, en dernier recours seulement
pkill -f "node dist/main.js"   # par motif
```

## Premier plan et arrière-plan

```bash
python3 -m http.server 8000 &   # & lance la commande en arrière-plan
jobs                            # liste les tâches de ce terminal
fg %1                           # ramène la tâche 1 au premier plan
# Ctrl+Z suspend, puis :
bg %1                           # la relance en arrière-plan
nohup ./long.sh > sortie.log 2>&1 &   # survit à la fermeture du terminal
```

`2>&1` redirige les erreurs (sortie 2) au même endroit que la sortie normale (sortie 1).

Ces méthodes conviennent pour des essais. En production, on confie le processus à **systemd**.

## systemd et systemctl

systemd démarre la machine et gère les services, appelés **unités** (*units*).

```bash
systemctl status ssh         # état, PID, dernières lignes du journal
sudo systemctl start nginx   # démarrer maintenant
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx  # relire la configuration sans couper le service
sudo systemctl enable nginx  # démarrer automatiquement au boot
sudo systemctl enable --now nginx   # enable et start en une fois
systemctl list-units --type=service --state=running
systemctl --failed           # les services en échec
```

## Écrire sa propre unité

Fichier `/etc/systemd/system/api.service` :

```ini
[Unit]
Description=API Saint Stack
After=network.target postgresql.service

[Service]
User=api
WorkingDirectory=/opt/api
ExecStart=/usr/bin/node dist/main.js
Environment=NODE_ENV=production PORT=4000
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

| Ligne | Rôle |
|---|---|
| `After=` | démarrer après le réseau et PostgreSQL |
| `User=` | ne pas tourner en root (moindre privilège) |
| `Restart=on-failure` | relancer si le service s'arrête en erreur |
| `WantedBy=multi-user.target` | rattacher le service au démarrage normal de la machine |

Après chaque modification du fichier : `sudo systemctl daemon-reload`, puis `restart`.

## Les journaux

systemd centralise les journaux dans le **journal**, que l'on consulte avec `journalctl`.

```bash
journalctl -u api              # tout le journal du service api
journalctl -u api -f           # en direct
journalctl -u api --since "1 hour ago"
journalctl -p err -b           # les erreurs depuis le dernier démarrage
journalctl --disk-usage
```

Les fichiers classiques se trouvent dans `/var/log` : `syslog` (messages système), `auth.log` (connexions et sudo, très utile en sécurité), `nginx/access.log` et `nginx/error.log`.

> Méthode de diagnostic : un service ne répond pas ? Lance `systemctl status`, puis `journalctl -u ... -n 50`, puis `ss -tlnp`. Dans cet ordre : est-il lancé, pourquoi s'est-il arrêté, écoute-t-il sur le bon port ?

## Démonstration

```bash
sudo useradd --system --no-create-home demo
sudo mkdir -p /opt/demo && echo '<h1>OK</h1>' | sudo tee /opt/demo/index.html
sudo tee /etc/systemd/system/demo.service > /dev/null <<'EOF'
[Unit]
Description=Serveur de démonstration
[Service]
User=demo
WorkingDirectory=/opt/demo
ExecStart=/usr/bin/python3 -m http.server 8080
Restart=on-failure
[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable --now demo
systemctl status demo
curl localhost:8080
sudo kill -9 $(systemctl show -p MainPID --value demo)   # on simule un plantage
sleep 1; systemctl status demo      # systemd l'a relancé : le PID a changé
journalctl -u demo -n 20
```

Sous WSL, systemd doit être activé dans `/etc/wsl.conf` (`[boot]` puis `systemd=true`).

## Exercice guidé

1. Lance `sleep 600 &`. Trouve son PID de trois façons différentes : `jobs -l`, `pgrep` et `ps`.
2. Arrête-le proprement avec SIGTERM et vérifie qu'il a disparu.
3. Lance `sleep 600`, suspends-le avec Ctrl+Z, relance-le en arrière-plan, puis ramène-le au premier plan et arrête-le avec Ctrl+C.
4. Affiche les 5 processus qui consomment le plus de mémoire avec `ps aux --sort=-%mem | head -6`.

## Exercice autonome

1. Écris un script `horloge.sh` qui ajoute la date dans `/tmp/horloge.log` toutes les 10 secondes, dans une boucle infinie.
2. Transforme-le en service `horloge.service` : il tourne sous ton utilisateur, se relance en cas d'échec et démarre au boot.
3. Vérifie qu'il tourne, suis son fichier avec `tail -f`, puis arrête-le et désactive-le.
4. Avec `journalctl`, trouve les 10 dernières tentatives de connexion SSH ou utilisations de sudo. Indice : `-u ssh`, ou `/var/log/auth.log`.

## Correction

Exercice guidé :

```bash
sleep 600 &
jobs -l ; pgrep sleep ; ps aux | grep "[s]leep 600"   # les crochets évitent que grep se trouve lui-même
kill %1    # ou kill <PID>
jobs       # « Terminated »
```

Exercice autonome :

```bash
cat > ~/horloge.sh <<'EOF'
#!/usr/bin/env bash
while true; do date >> /tmp/horloge.log; sleep 10; done
EOF
chmod +x ~/horloge.sh
sudo tee /etc/systemd/system/horloge.service > /dev/null <<EOF
[Unit]
Description=Horloge de test
[Service]
User=$USER
ExecStart=$HOME/horloge.sh
Restart=on-failure
[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload && sudo systemctl enable --now horloge
systemctl status horloge && tail -f /tmp/horloge.log
sudo systemctl disable --now horloge
journalctl -u ssh -n 10        # ou : sudo grep -E "sshd|sudo" /var/log/auth.log | tail
```

Le heredoc de l'unité est écrit **sans** guillemets autour de `EOF`, pour que `$USER` et `$HOME` soient remplacés par leurs valeurs. Celui du script, au contraire, utilise `'EOF'` : son contenu doit rester littéral.

## Pour aller plus loin

- Les *timers* systemd sont une alternative moderne à cron, que l'on verra en semaine 2.
- `systemd-analyze blame` montre ce qui ralentit le démarrage de la machine.
- Docker (semaine 2) isole des processus : tu y retrouveras les mêmes notions de PID et de signaux.
