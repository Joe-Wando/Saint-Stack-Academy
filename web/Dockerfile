# Construit depuis la RACINE du dépôt (compose.yaml : context « . ») : la génération des PowerPoint
# a besoin de content/ (cours, sujets) et de tools/diaporamas/ en plus du site.
FROM node:22-alpine AS build
WORKDIR /repo
# Outils du dépôt : pptxgenjs, sharp, simple-icons, lucide-static, gray-matter (versions épinglées)
COPY package.json package-lock.json ./
# Cache des téléchargements npm : une réinstallation ne repasse pas par Internet
RUN --mount=type=cache,target=/root/.npm npm ci --prefer-offline --no-audit --no-fund
COPY web/package.json web/package-lock.json web/
RUN --mount=type=cache,target=/root/.npm cd web && npm ci --prefer-offline --no-audit --no-fund
COPY content content
COPY tools/diaporamas tools/diaporamas
COPY tools/verifier-outils.mjs tools/verifier-outils.mjs
COPY web web
# L'adresse de l'API est intégrée au code du navigateur au moment de la construction
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Adresse publique du site (URL absolue des images de partage)
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
# Un PowerPoint par cours public, aux couleurs de son sujet : web/public/diaporamas/<slug>.pptx
# Vérification du contenu (logiciels de chaque sujet), puis un PowerPoint par cours public
RUN npm run verifier && npm run diaporamas
# Cache de Next.js : seules les pages modifiées sont recompilées
RUN --mount=type=cache,target=/repo/web/.next/cache cd web && npm run build

# Copie PDF de chaque PowerPoint, affichée par le mode « Présenter » (mêmes paquets que
# tools/diaporamas/libreoffice.Dockerfile ; Debian, car LibreOffice se bloque sous Alpine).
# L'installation de LibreOffice reste en cache : seule la conversion est refaite.
FROM debian:bookworm-slim AS pdf
# force-unsafe-io : dpkg n'attend pas la confirmation d'écriture de chaque fichier (étape jetable).
RUN echo force-unsafe-io > /etc/dpkg/dpkg.cfg.d/sans-fsync \
 && apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends libreoffice-impress fonts-liberation fonts-dejavu \
 && rm -rf /var/lib/apt/lists/*
ENV HOME=/tmp
COPY --from=build /repo/web/public/diaporamas /d
RUN soffice -env:UserInstallation=file:///tmp/lo --headless --convert-to pdf --outdir /d /d/*.pptx >/dev/null \
 && test "$(ls /d/*.pdf | wc -l)" -eq "$(ls /d/*.pptx | wc -l)"

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /repo/web/.next/standalone ./
COPY --from=build /repo/web/.next/static ./.next/static
# Illustrations, diaporamas PowerPoint et copie de mermaid, servis tels quels
COPY --from=build /repo/web/public ./public
COPY --from=pdf /d/*.pdf ./public/diaporamas/
# Polices et personnages des images de partage (lus par next/og au moment de la requête)
COPY --from=build /repo/web/assets ./assets
USER node
EXPOSE 3000
CMD ["node", "server.js"]
