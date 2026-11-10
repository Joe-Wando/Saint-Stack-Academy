FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# Dossier des photos de profil : un volume Docker y est monté, il doit appartenir à l'utilisateur node
RUN mkdir -p /data/uploads && chown node:node /data/uploads
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:4000/api/sante || exit 1
CMD ["node", "dist/main.js"]
