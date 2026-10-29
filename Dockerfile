FROM node:20-alpine

WORKDIR /app

# Install build dependencies if needed
COPY package*.json ./

RUN npm ci --only=production

# Copy application source
COPY . .

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "src/app.js"]
