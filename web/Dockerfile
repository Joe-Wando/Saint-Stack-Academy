FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# L'adresse de l'API est intégrée au code du navigateur au moment de la construction
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Adresse publique du site (URL absolue des images de partage)
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
# Illustrations et diaporamas PowerPoint, servis tels quels
COPY --from=build /app/public ./public
# Polices et personnages des images de partage (lus par next/og au moment de la requête)
COPY --from=build /app/assets ./assets
USER node
EXPOSE 3000
CMD ["node", "server.js"]
