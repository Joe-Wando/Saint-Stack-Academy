#!/usr/bin/env bash
# Sauvegarde quotidienne de MeredianStack : base PostgreSQL + photos de profil (volume uploads).
# À lancer depuis le dossier du projet sur le serveur (cron, voir DEPLOIEMENT.md) :
#   /opt/meredianstack/scripts/sauvegarde.sh
# Fichiers produits dans /opt/meredianstack/sauvegardes :
#   base-AAAA-MM-JJ.sql.gz      (pg_dump compressé)
#   photos-AAAA-MM-JJ.tar.gz    (archive des photos de profil)
# Les sauvegardes de plus de 14 jours sont supprimées. Une ligne est ajoutée à sauvegardes/journal.log.
#
# Restauration (base), depuis le dossier du projet :
#   gunzip -c sauvegardes/base-AAAA-MM-JJ.sql.gz | docker compose -f compose.yaml -f compose.prod.yaml exec -T db \
#     sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
# Restauration (photos) :
#   docker compose -f compose.yaml -f compose.prod.yaml exec -T api sh -c 'tar xzf - -C /data/uploads' < sauvegardes/photos-AAAA-MM-JJ.tar.gz
set -euo pipefail

cd "$(dirname "$0")/.."
DOSSIER="${DOSSIER_SAUVEGARDES:-/opt/meredianstack/sauvegardes}"
JOUR="$(date +%F)"
COMPOSE="docker compose -f compose.yaml"
[ -f compose.prod.yaml ] && [ "${LOCAL:-0}" != "1" ] && COMPOSE="$COMPOSE -f compose.prod.yaml"
mkdir -p "$DOSSIER"

# Base : --clean et --if-exists pour qu'une restauration remplace proprement les tables existantes.
$COMPOSE exec -T db sh -c 'pg_dump --clean --if-exists -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "$DOSSIER/base-$JOUR.sql.gz"
# Photos de profil : archive du dossier /data/uploads du service api.
$COMPOSE exec -T api sh -c 'tar czf - -C /data/uploads .' > "$DOSSIER/photos-$JOUR.tar.gz"

# Ménage : plus de 14 jours.
find "$DOSSIER" -maxdepth 1 -type f \( -name 'base-*.sql.gz' -o -name 'photos-*.tar.gz' \) -mtime +14 -delete

TAILLE="$(du -sh "$DOSSIER/base-$JOUR.sql.gz" | cut -f1)"
echo "$(date '+%F %T') sauvegarde ok : base-$JOUR.sql.gz ($TAILLE), photos-$JOUR.tar.gz" >> "$DOSSIER/journal.log"
echo "Sauvegarde terminée dans $DOSSIER"
