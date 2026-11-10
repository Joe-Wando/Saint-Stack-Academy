---
slug: s02-1-bash-bases
titre: Bash, variables, conditions, boucles et fonctions
piste: solo
semaine: 2
date: 2026-11-17
domaine: Systèmes
duree: 120
niveau: bases
objectifs:
  - Écrire et exécuter un script Bash avec un shebang
  - Utiliser des variables, des arguments ($1, $@, $#) et la substitution de commande
  - Écrire des conditions avec if, [[ ]] et les codes de retour
  - Écrire des boucles for et while, et des fonctions
  - Rendre un script robuste avec set -euo pipefail et des guillemets
prerequis:
  - Séances solo de la semaine 1
referentiels:
  - LPIC-1 (102-500), objectif 105.2 « Personnaliser ou écrire des scripts simples »
  - CompTIA Linux+ (XK0-005), domaine 4 « Scripting, Containers and Automation »
  - Google Shell Style Guide
quiz:
  - question: "Que vaut $? juste après une commande réussie ?"
    choix: ["1", "0", "true", "La sortie de la commande"]
    reponse: 1
    explication: "En Bash, 0 signifie succès ; toute autre valeur (1 à 255) signale une erreur. C'est l'inverse de nombreux langages."
  - question: "Pourquoi écrire \"$fichier\" plutôt que $fichier ?"
    choix: ["C'est plus joli", "Pour que les noms contenant des espaces ne soient pas découpés en plusieurs mots", "Pour exécuter le fichier", "Ce n'est pas valide"]
    reponse: 1
    explication: "Sans guillemets, « mon rapport.txt » devient deux arguments : mon et rapport.txt. Règle : toujours mettre les variables entre guillemets."
  - question: "Que fait set -e en tête de script ?"
    choix: ["Il affiche chaque commande", "Il arrête le script dès qu'une commande échoue", "Il exporte les variables", "Il active les couleurs"]
    reponse: 1
    explication: "-e arrête à la première erreur, -u refuse les variables non définies, -o pipefail fait échouer un tube si une de ses commandes échoue."
  - question: "Comment récupérer la date du jour dans une variable ?"
    choix: ["jour=date", "jour=$(date +%F)", "jour = $(date)", "$jour=date"]
    reponse: 1
    explication: "$( ) exécute la commande et remplace par sa sortie. Attention : pas d'espace autour du signe = dans une affectation."
  - question: "Dans un script lancé par ./sauve.sh docs photos, que vaut $#  ?"
    choix: ["0", "1", "2", "docs photos"]
    reponse: 2
    explication: "$# est le nombre d'arguments ; $1 vaut docs, $2 vaut photos et $@ les contient tous."
---

## Pourquoi Bash ?

Tout ce que tu tapes dans le terminal peut s'enregistrer dans un fichier et se rejouer : c'est un **script**. Les ingénieurs DevOps automatisent ainsi les sauvegardes, les déploiements, le nettoyage des journaux ou l'installation d'un serveur. Les pipelines CI/CD (semaine 3) exécutent eux aussi des commandes Bash.

## Le premier script

```bash
#!/usr/bin/env bash
# bonjour.sh : premier script
set -euo pipefail

echo "Bonjour $USER, nous sommes le $(date +%d/%m/%Y)"
```

```bash
chmod +x bonjour.sh
./bonjour.sh
```

- La première ligne, le **shebang** `#!`, indique quel interpréteur utiliser.
- `set -euo pipefail` est le **mode strict** : arrêt à la première erreur, refus des variables non définies, échec d'un tube si une de ses commandes échoue. Mets-le dans tous tes scripts.

## Les variables

```bash
nom="Awa"                 # PAS d'espace autour du =
echo "Bonjour $nom"       # ou ${nom}, utile pour coller du texte : "${nom}_backup"
jour=$(date +%F)          # substitution de commande : 2026-11-17
nb=$(ls | wc -l)
total=$(( 3 * 4 + 1 ))    # calcul entier : 13
readonly VERSION="1.0"    # constante
export API_URL="http://localhost:4000"   # visible des programmes lancés par le script
```

| Guillemets | Effet |
|---|---|
| `"..."` | les variables sont remplacées : `"Bonjour $nom"` donne `Bonjour Awa` |
| `'...'` | tout est littéral : `'Bonjour $nom'` donne `Bonjour $nom` |

> Règle d'or : **mets toujours tes variables entre guillemets** (`"$fichier"`), sinon un nom contenant un espace casse ton script.

## Les arguments

| Variable | Contenu |
|---|---|
| `$0` | nom du script |
| `$1`, `$2`… | premier, deuxième argument |
| `$#` | nombre d'arguments |
| `"$@"` | tous les arguments, chacun séparément |
| `$?` | code de retour de la dernière commande |

```bash
dossier="${1:-$HOME}"     # valeur par défaut si $1 est absent
read -rp "Ton prénom : " prenom   # lire une saisie
```

## Les conditions

Chaque commande renvoie un **code de retour** : **0 = succès**, autre chose = échec. `if` teste ce code.

```bash
if [[ $# -lt 1 ]]; then
  echo "Usage : $0 <dossier>" >&2      # >&2 écrit sur la sortie d'erreur
  exit 1
fi

if [[ -d "$1" ]]; then echo "C'est un dossier"
elif [[ -f "$1" ]]; then echo "C'est un fichier"
else echo "Introuvable"; fi

if grep -q "ERREUR" app.log; then echo "Il y a des erreurs"; fi
```

| Test | Vrai si… |
|---|---|
| `-f f` / `-d d` / `-e x` | fichier / dossier / existe |
| `-z "$s"` / `-n "$s"` | chaîne vide / non vide |
| `"$a" == "$b"` | chaînes égales (`!=` pour différentes) |
| `$a -eq $b`, `-ne`, `-lt`, `-le`, `-gt`, `-ge` | comparaisons de nombres |
| `&&`, `\|\|`, `!` | et, ou, non |

Les raccourcis : `mkdir -p sauvegardes && echo "ok"` (si succès) et `cd /x || exit 1` (si échec).

`case` sert aux choix multiples :

```bash
case "$1" in
  start) echo "Démarrage" ;;
  stop)  echo "Arrêt" ;;
  *)     echo "Commande inconnue" ;;
esac
```

## Les boucles

```bash
for f in *.log; do echo "Traitement de $f"; done
for i in {1..5}; do echo "Tour $i"; done
for arg in "$@"; do echo "Argument : $arg"; done

compteur=3
while [[ $compteur -gt 0 ]]; do echo "$compteur…"; compteur=$((compteur - 1)); sleep 1; done

while read -r ligne; do echo "> $ligne"; done < fichier.txt   # lire un fichier ligne par ligne
```

## Les fonctions

```bash
log() {
  local niveau="$1"; shift          # local : variable propre à la fonction ; shift décale les arguments
  echo "[$(date +%T)] [$niveau] $*"
}

verifier_commande() {
  command -v "$1" > /dev/null || { log ERREUR "$1 n'est pas installé"; return 1; }
}

log INFO "Début"
verifier_commande docker
```

Une fonction renvoie un **code** avec `return`, et des **données** avec `echo`.

## Démonstration

Un script qui fait l'inventaire d'un dossier :

```bash
#!/usr/bin/env bash
set -euo pipefail

dossier="${1:-.}"
[[ -d "$dossier" ]] || { echo "Dossier introuvable : $dossier" >&2; exit 1; }

nb_fichiers=0; taille_totale=0
for f in "$dossier"/*; do
  [[ -f "$f" ]] || continue
  taille=$(stat -c %s "$f")            # taille en octets (sous macOS : stat -f %z)
  nb_fichiers=$((nb_fichiers + 1))
  taille_totale=$((taille_totale + taille))
done
echo "$nb_fichiers fichiers, $((taille_totale / 1024)) Ko au total dans $dossier"
```

Exemple chiffré : avec 3 fichiers de 2 048, 4 096 et 1 024 octets, le total vaut 7 168 octets, et 7 168 / 1 024 donne 7 Ko.

L'outil **ShellCheck** (`sudo apt install shellcheck`, puis `shellcheck script.sh`) détecte les erreurs classiques. Utilise-le sur chaque script.

## Exercice guidé

Écris `salut.sh` :

1. Il prend un prénom en argument. S'il n'y en a pas, il le demande avec `read`.
2. Il affiche « Bonjour, <prénom> », puis « Bonne matinée » avant 12 h, ou « Bonne journée » ensuite. Utilise `$(date +%H)`.
3. Il se termine avec le code 0.

## Exercice autonome

Écris `verif.sh`, qui vérifie qu'un poste de développeur est prêt :

1. Pour chaque outil de la liste `git docker node npm psql`, il affiche « OK » et la version, ou « MANQUANT ».
2. À la fin, il affiche « 3/5 outils présents » et renvoie le code 1 s'il en manque au moins un.
3. Il prend une option `-q` (silencieux) qui n'affiche que le résumé.
4. Il passe ShellCheck sans avertissement.

## Correction

Exercice guidé :

```bash
#!/usr/bin/env bash
set -euo pipefail
prenom="${1:-}"
[[ -n "$prenom" ]] || read -rp "Ton prénom : " prenom
echo "Bonjour, $prenom"
heure=$(date +%H)
if (( 10#$heure < 12 )); then echo "Bonne matinée"; else echo "Bonne journée"; fi
```

`10#` force la base 10 : sans lui, « 08 » et « 09 » seraient lus en octal et provoqueraient une erreur.

Exercice autonome :

```bash
#!/usr/bin/env bash
set -euo pipefail

silencieux=false
[[ "${1:-}" == "-q" ]] && silencieux=true

outils=(git docker node npm psql)
presents=0
for o in "${outils[@]}"; do
  if command -v "$o" > /dev/null; then
    presents=$((presents + 1))
    $silencieux || echo "OK        $o ($("$o" --version 2>&1 | head -n1))"
  else
    $silencieux || echo "MANQUANT  $o"
  fi
done
echo "$presents/${#outils[@]} outils présents"
[[ $presents -eq ${#outils[@]} ]]
```

La dernière ligne est un test : son code de retour devient celui du script.

## Pour aller plus loin

- Les tableaux associatifs (`declare -A`) permettent de faire un dictionnaire clé-valeur en Bash.
- `trap 'nettoyage' EXIT` exécute une fonction à la fin du script, même en cas d'erreur.
- Demain, on écrit un vrai script de sauvegarde et on le planifie avec cron.
