# LibreOffice sans interface, pour convertir les PowerPoint en PDF (mode « Présenter » du site).
# Debian : LibreOffice se bloque sous Alpine. Les polices Liberation ont les mêmes dimensions
# qu'Arial et Courier New, celles du gabarit : la mise en page du PDF est celle du PowerPoint.
# Le web/Dockerfile reprend les mêmes paquets dans son étape « pdf ».
FROM debian:bookworm-slim
# force-unsafe-io : dpkg n'attend pas la confirmation d'écriture de chaque fichier (image jetable).
# Sans cela, l'installation peut rester bloquée des dizaines de minutes sur un disque Docker lent.
RUN echo force-unsafe-io > /etc/dpkg/dpkg.cfg.d/sans-fsync \
 && apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends libreoffice-impress fonts-liberation fonts-dejavu \
 && rm -rf /var/lib/apt/lists/*
ENV HOME=/tmp
