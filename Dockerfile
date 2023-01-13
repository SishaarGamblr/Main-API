FROM node:18 as build

RUN mkdir -p /app

FROM build AS development
WORKDIR /app
ENV NODE_ENV development
COPY . .
RUN npm install
RUN npm run build
EXPOSE 9229
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM build AS production
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY --from=development /app/dist ./dist
COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/package.json .
COPY --from=development /app/config ./config

RUN npm prune --production
CMD ["npm", "run", "start"]
