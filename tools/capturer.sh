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

#   tools/capturer.sh --pages <travaux.json> <dossier où puppeteer-core est installé>   plusieurs captures fiables
#   (les adresses sont vérifiées une par une par tools/capturer-pages.cjs)
if [ "${1:-}" = "--pages" ]; then
  node "$(dirname "$0")/capturer-pages.cjs" "${3:?dossier puppeteer}" "${2:?travaux.json}"
  exit $?
fi

if [ "${1:-}" = "--lighthouse" ]; then
  url="${2:?url}"; rapport="${3:?rapport json}"; forme="${4:-mobile}"; verifier "$url"
  cli="${5:?dossier lighthouse}/node_modules/lighthouse/cli/index.js"
  preset=(); [ "$forme" = desktop ] && preset=(--preset=desktop)
  # Navigateur de test (chrome-headless-shell) installé à côté de lighthouse, sinon Edge.
  navigateur=$(find "$5/navigateurs" -name chrome-headless-shell.exe 2>/dev/null | head -1)
  CHROME_PATH="${navigateur:-$edge}" node "$cli" "$url" "${preset[@]}" --quiet --output=json --output-path="$rapport" \
    --chrome-flags="--headless --disable-gpu" 2>&1 | tail -5 || true
  test -s "$rapport" && echo "$rapport"
  exit 0
fi

url="${1:?url}"; sortie="${2:?fichier png}"; largeur="${3:-1366}"; hauteur="${4:-900}"; verifier "$url"
timeout 60 "$edge" --headless=new --disable-gpu --hide-scrollbars --no-first-run --user-data-dir="$profil" \
  --force-prefers-reduced-motion --virtual-time-budget=6000 --window-size="$largeur,$hauteur" --screenshot="$sortie" "$url" 2>&1 | tail -5 || true
test -s "$sortie" && echo "$sortie"
