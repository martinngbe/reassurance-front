# ============================================
# Étape 1 : Build de l'application Vue 3
# ============================================
FROM node:24-alpine AS builder
WORKDIR /app
# Copie des fichiers de dépendances en premier (optimisation du cache Docker)
COPY package*.json ./
# Installation des dépendances (utilise npm ci si package-lock.json existe)
RUN npm ci

# Copie du reste du code source
COPY . .

# Build de production
RUN npm run build

# ============================================
# Étape 2 : Serveur de production (Nginx)
# ============================================
FROM nginx:alpine AS production

# Copie de la config Nginx personnalisée
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie d'une config Nginx optimisée pour SPA (routing Vue)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]