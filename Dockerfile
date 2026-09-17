FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV GROWTHPILOT_NODE=1
RUN node node_modules/vinext/dist/cli.js build
ENV NODE_ENV=production
ENV GROWTHPILOT_DATA_DIR=/data
EXPOSE 3000
CMD ["node", "node_modules/vinext/dist/cli.js", "start"]
