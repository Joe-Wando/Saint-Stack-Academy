#!/usr/bin/env bash
# Vérifications visuelles du site LOCAL avec Edge sans fenêtre.
#   tools/capturer.sh <url> <fichier.png> [largeur] [hauteur]       capture d'écran
#   tools/capturer.sh --lighthouse <url> <rapport.json> <mobile|desktop> <dossier où lighthouse est installé>
# Seules les adresses http://localhost:3000/... sont acceptées.
# Lighthouse est lu dans <dossier>/node_modules/lighthouse.
set -euo pipefail
edge="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
# Un profil neuf par lancement : un Edge resté bloqué ne verrouille pas les captures suivantes.
profil="${TMPDIR:-/tmp}/ssa-edge-profil-$$"
trap 'rm -rf "$profil" 2>/dev/null || true' EXIT
verifier() { case "$1" in http://localhost:3000/*|http://localhost:3000) ;; *) echo "Adresse refusée : $1" >&2; exit 2 ;; esac; }

if [ "${1:-}" = "--lighthouse" ]; then
  url="${2:?url}"; rapport="${3:?rapport json}"; forme="${4:-mobile}"; verifier "$url"
  cli="${5:?dossier lighthouse}/node_modules/lighthouse/cli/index.js"
  preset=(); [ "$forme" = desktop ] && preset=(--preset=desktop)
  CHROME_PATH="$edge" node "$cli" "$url" "${preset[@]}" --quiet --output=json --output-path="$rapport" \
    --chrome-flags="--headless=new --disable-gpu" 2>&1 | tail -5 || true
  test -s "$rapport" && echo "$rapport"
  exit 0
fi

url="${1:?url}"; sortie="${2:?fichier png}"; largeur="${3:-1366}"; hauteur="${4:-900}"; verifier "$url"
timeout 60 "$edge" --headless=new --disable-gpu --hide-scrollbars --no-first-run --user-data-dir="$profil" \
  --window-size="$largeur,$hauteur" --screenshot="$sortie" "$url" 2>&1 | tail -5 || true
test -s "$sortie" && echo "$sortie"
