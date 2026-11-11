#!/usr/bin/env bash
# Met MeredianStack à jour sur le serveur : récupère le code, reconstruit, nettoie, puis vérifie l'API.
#   cd /opt/meredianstack && ./scripts/mettre-a-jour.sh
set -euo pipefail

cd "$(dirname "$0")/.."
# DOMAINE est lu dans le fichier .env du projet.
DOMAINE="$(grep -E '^DOMAINE=' .env | head -1 | cut -d= -f2- | tr -d '"'"'"' \r')"
[ -n "$DOMAINE" ] || { echo "DOMAINE manquant dans .env" >&2; exit 1; }

git pull --ff-only
docker compose -f compose.yaml -f compose.prod.yaml up -d --build
docker image prune -f

# L'API peut mettre quelques secondes à démarrer.
for i in $(seq 1 30); do
  if curl -fsS "https://$DOMAINE/api/sante" > /dev/null; then echo "Mise à jour terminée : https://$DOMAINE répond."; exit 0; fi
  sleep 5
done
echo "L'API ne répond pas sur https://$DOMAINE/api/sante : voir docker compose -f compose.yaml -f compose.prod.yaml logs -f api" >&2
exit 1
