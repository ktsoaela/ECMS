FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 4200

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
