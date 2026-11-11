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
COPY web web
# L'adresse de l'API est intégrée au code du navigateur au moment de la construction
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Adresse publique du site (URL absolue des images de partage)
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
# Un PowerPoint par cours public, aux couleurs de son sujet : web/public/diaporamas/<slug>.pptx
RUN npm run diaporamas
# Cache de Next.js : seules les pages modifiées sont recompilées
RUN --mount=type=cache,target=/repo/web/.next/cache cd web && npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /repo/web/.next/standalone ./
COPY --from=build /repo/web/.next/static ./.next/static
# Illustrations, diaporamas PowerPoint et copie de mermaid, servis tels quels
COPY --from=build /repo/web/public ./public
# Polices et personnages des images de partage (lus par next/og au moment de la requête)
COPY --from=build /repo/web/assets ./assets
USER node
EXPOSE 3000
CMD ["node", "server.js"]
