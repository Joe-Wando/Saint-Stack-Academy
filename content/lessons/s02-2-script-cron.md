---
slug: s02-2-script-cron
titre: Bash en pratique, script de sauvegarde et planification avec cron
domaine: Systèmes
duree: 120
difficulte: bases
licence:
  - { niveau: L3, semestre: S5, ue: "Administration des systèmes", option: reseaux-systemes-cloud }
parcours:
  - { parcours: systemes, ordre: 6 }
ordre: 5
prerequis_cours: [s02-1-bash-bases]
visibilite: public
objectifs:
  - Écrire un script de sauvegarde complet (archivage, horodatage, rotation, journal)
  - Gérer les erreurs proprement avec trap et des codes de sortie
  - Lire et écrire une expression cron
  - Planifier un script avec crontab et vérifier son exécution
  - Comparer cron et les timers systemd
prerequis:
  - Séance « Bash, variables, conditions, boucles et fonctions »
referentiels:
  - LPIC-1 (102-500), objectif 107.2 « Automatiser les tâches d'administration en planifiant des travaux »
  - CompTIA Linux+ (XK0-005), domaine 4
  - Règle de sauvegarde 3-2-1 (US-CERT, « Data Backup Options »)
quiz:
  - question: "Que signifie l'expression cron 30 2 * * 1-5 ?"
    choix: ["Toutes les 30 minutes", "À 2 h 30 du lundi au vendredi", "Le 30 février", "À 30 h 02"]
    reponse: 1
    explication: "Les cinq champs sont minute, heure, jour du mois, mois, jour de la semaine. 1-5 désigne lundi à vendredi."
  - question: "Pourquoi un script qui marche à la main échoue-t-il souvent sous cron ?"
    choix: ["cron est plus lent", "cron s'exécute avec un environnement minimal (PATH réduit, pas de .bashrc)", "cron n'autorise pas Bash", "cron exige root"]
    reponse: 1
    explication: "Utilise des chemins absolus, définis PATH en tête de crontab ou du script, et redirige la sortie vers un journal pour voir les erreurs."
  - question: "Comment n'exécuter qu'une fois toutes les 15 minutes ?"
    choix: ["15 * * * *", "*/15 * * * *", "0 15 * * *", "* */15 * * *"]
    reponse: 1
    explication: "*/15 dans le champ minute signifie toutes les 15 minutes (0, 15, 30, 45). « 15 * * * * » signifie à la minute 15 de chaque heure."
  - question: "Que dit la règle de sauvegarde 3-2-1 ?"
    choix: ["3 sauvegardes par jour pendant 2 jours", "3 copies des données, sur 2 supports différents, dont 1 hors site", "3 serveurs, 2 disques, 1 cloud obligatoire", "Garder 321 versions"]
    reponse: 1
    explication: "Une sauvegarde sur le même disque que l'original ne protège ni d'une panne de disque ni d'un vol."
  - question: "Que fait trap 'rm -f \"$tmp\"' EXIT ?"
    choix: ["Supprime le script", "Supprime le fichier temporaire à la fin du script, même en cas d'erreur", "Empêche la sortie du script", "Rien"]
    reponse: 1
    explication: "trap associe une commande à un signal ou à la sortie : c'est la façon propre de nettoyer."
---

## L'idée

Hier, tu as appris la syntaxe Bash. Aujourd'hui, on écrit un script **utile** : une sauvegarde automatique. On le **planifie** ensuite pour qu'il tourne chaque nuit sans toi. Ce couple « script et planification » est le geste de base de l'automatisation.

## Une bonne sauvegarde

- **Horodatée**, pour savoir de quand date chaque archive : `site_2026-11-18_0230.tar.gz`.
- **Avec rotation** : on garde les N dernières et on supprime les plus anciennes, sinon le disque se remplit.
- **Journalisée** : on écrit ce qui s'est passé dans un fichier de journal.
- **Testée** : une sauvegarde jamais restaurée n'est pas une sauvegarde.
- **Règle 3-2-1** : 3 copies des données, sur 2 supports différents, dont 1 **hors site** (un autre serveur ou le cloud).

## Le script

```bash
#!/usr/bin/env bash
# sauvegarde.sh <source> <destination> [nombre_a_garder]
set -euo pipefail

SOURCE="${1:?Usage : $0 <source> <destination> [garder]}"
DEST="${2:?Destination manquante}"
GARDER="${3:-7}"
JOURNAL="$DEST/sauvegarde.log"
HORODATAGE=$(date +%F_%H%M)
NOM="$(basename "$SOURCE")_${HORODATAGE}.tar.gz"

log() { echo "[$(date '+%F %T')] $*" | tee -a "$JOURNAL"; }

mkdir -p "$DEST"
tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT                       # nettoyage, même en cas d'erreur
trap 'log "ÉCHEC à la ligne $LINENO"' ERR

log "Début de la sauvegarde de $SOURCE"
tar -czf "$tmp" -C "$(dirname "$SOURCE")" "$(basename "$SOURCE")"
mv "$tmp" "$DEST/$NOM"
log "Archive créée : $NOM ($(du -h "$DEST/$NOM" | cut -f1))"

# Rotation : on liste du plus récent au plus ancien et on supprime au-delà de GARDER
ls -1t "$DEST"/*.tar.gz | tail -n +$((GARDER + 1)) | while read -r vieux; do
  rm -f "$vieux"; log "Supprimée (rotation) : $(basename "$vieux")"
done
log "Terminé. $(ls -1 "$DEST"/*.tar.gz | wc -l) archive(s) conservée(s)"
```

Les points à remarquer :

- `${1:?message}` arrête le script avec ce message si l'argument manque.
- `mktemp` crée un fichier temporaire ; l'archive n'est déplacée qu'**une fois complète**, ce qui évite de laisser une archive à moitié écrite.
- `tail -n +8` affiche à partir de la 8ᵉ ligne. Avec `GARDER=7`, on supprime donc tout ce qui dépasse les 7 plus récentes.

Exemple chiffré : 10 archives existent et on en garde 7. `tail -n +8` sélectionne les 3 plus anciennes, qui sont supprimées.

**Restaurer** : `tar -xzf site_2026-11-18_0230.tar.gz -C /tmp/restauration`.

## cron

`cron` est le planificateur historique d'Unix. Chaque utilisateur a sa **crontab**.

```bash
crontab -e      # modifier
crontab -l      # lister
```

Le format, cinq champs puis la commande :

```
┌───────── minute (0-59)
│ ┌─────── heure (0-23)
│ │ ┌───── jour du mois (1-31)
│ │ │ ┌─── mois (1-12)
│ │ │ │ ┌─ jour de la semaine (0-7, 0 et 7 = dimanche)
│ │ │ │ │
30 2 * * * /home/ali/bin/sauvegarde.sh /var/www/site /srv/sauvegardes 7 >> /var/log/sauvegarde-cron.log 2>&1
```

| Expression | Signification |
|---|---|
| `0 * * * *` | toutes les heures, à la minute 0 |
| `*/15 * * * *` | toutes les 15 minutes |
| `0 9 * * 1-5` | à 9 h, du lundi au vendredi |
| `0 0 1 * *` | le 1er de chaque mois à minuit |
| `@reboot` | au démarrage de la machine |

Le site crontab.guru traduit une expression en français courant ; il est très pratique pour vérifier.

### Les pièges de cron

1. **L'environnement minimal** : le PATH est réduit et `.bashrc` n'est pas lu. Utilise des **chemins absolus**, ou ajoute `PATH=/usr/local/bin:/usr/bin:/bin` en tête de crontab.
2. **Aucune sortie visible** : redirige vers un journal avec `>> fichier.log 2>&1`.
3. **Le fuseau horaire** : cron suit l'heure du serveur, souvent UTC. Vérifie-la avec `timedatectl`.
4. **Le caractère %** : dans une crontab, il doit être échappé en `\%` (par exemple dans `date +\%F`).

## Les timers systemd, l'alternative moderne

```ini
# /etc/systemd/system/sauvegarde.service
[Service]
Type=oneshot
ExecStart=/usr/local/bin/sauvegarde.sh /var/www/site /srv/sauvegardes 7

# /etc/systemd/system/sauvegarde.timer
[Timer]
OnCalendar=*-*-* 02:30:00
Persistent=true            # rattrape l'exécution si la machine était éteinte
[Install]
WantedBy=timers.target
```

```bash
sudo systemctl enable --now sauvegarde.timer
systemctl list-timers
journalctl -u sauvegarde
```

| | cron | Timer systemd |
|---|---|---|
| Simplicité | une ligne | deux fichiers |
| Journaux | à rediriger soi-même | dans `journalctl`, automatiquement |
| Rattrapage après extinction | non | oui (`Persistent=true`) |
| Dépendances | non | oui (`After=`, `Requires=`) |

## Démonstration

```bash
mkdir -p ~/bin ~/site-test && echo "<h1>Test</h1>" > ~/site-test/index.html
# on écrit ~/bin/sauvegarde.sh comme plus haut, puis :
chmod +x ~/bin/sauvegarde.sh
for i in {1..9}; do ~/bin/sauvegarde.sh ~/site-test ~/sauvegardes 5; sleep 61; done   # ou sans sleep, en faisant varier HORODATAGE
ls ~/sauvegardes        # 5 archives seulement
cat ~/sauvegardes/sauvegarde.log
crontab -e              # ajouter : * * * * * $HOME/bin/sauvegarde.sh $HOME/site-test $HOME/sauvegardes 5 >> $HOME/cron.log 2>&1
# attendre 2 minutes
tail ~/cron.log
```

## Exercice guidé

Traduis ces besoins en expressions cron :

1. tous les jours à 23 h 45 ;
2. toutes les 5 minutes, de 8 h à 18 h ;
3. le dimanche à 3 h ;
4. le 1er et le 15 de chaque mois à midi.

Puis traduis ces expressions en français : `0 */6 * * *` et `15 14 1 * *`.

## Exercice autonome

Écris `nettoie-logs.sh` :

1. Il prend un dossier en argument.
2. Il compresse avec `gzip` les fichiers `*.log` de plus de 1 jour. Indice : `find -mtime +1`.
3. Il supprime les `*.log.gz` de plus de 30 jours.
4. Il journalise chaque action et affiche à la fin le nombre de fichiers compressés et supprimés.
5. Planifie-le chaque nuit à 1 h 15, d'abord avec cron, puis avec un timer systemd.

## Correction

Exercice guidé :

1. `45 23 * * *`
2. `*/5 8-17 * * *` (la dernière exécution a lieu à 17 h 55 ; écris `8-18` pour aller jusqu'à 18 h 55)
3. `0 3 * * 0`
4. `0 12 1,15 * *`

Ensuite, `0 */6 * * *` signifie « toutes les 6 heures : 0 h, 6 h, 12 h et 18 h », et `15 14 1 * *` signifie « le 1er de chaque mois à 14 h 15 ».

Exercice autonome :

```bash
#!/usr/bin/env bash
set -euo pipefail
DOSSIER="${1:?Usage : $0 <dossier>}"
log() { echo "[$(date '+%F %T')] $*"; }
compresses=0; supprimes=0
while IFS= read -r -d '' f; do
  gzip "$f"; compresses=$((compresses + 1)); log "Compressé : $f"
done < <(find "$DOSSIER" -name "*.log" -type f -mtime +1 -print0)
while IFS= read -r -d '' f; do
  rm -f "$f"; supprimes=$((supprimes + 1)); log "Supprimé : $f"
done < <(find "$DOSSIER" -name "*.log.gz" -type f -mtime +30 -print0)
log "Bilan : $compresses compressé(s), $supprimes supprimé(s)"
```

`-print0` et `read -d ''` gèrent correctement les noms de fichiers contenant des espaces. La planification correspondante :

- cron : `15 1 * * * /usr/local/bin/nettoie-logs.sh /var/log/monapp >> /var/log/nettoie.log 2>&1` ;
- timer systemd : `OnCalendar=*-*-* 01:15:00`.

## Pour aller plus loin

- `logrotate`, l'outil standard de Linux, fait exactement ce travail de rotation pour les journaux du système.
- `rsync` et `restic` permettent des sauvegardes incrémentales et chiffrées vers un serveur distant ou le cloud, pour respecter le « 1 hors site » de la règle 3-2-1.
- En semaine 6, Airflow orchestrera des tâches planifiées bien plus complexes, avec des dépendances entre elles.
