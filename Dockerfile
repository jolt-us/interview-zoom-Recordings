FROM node:12.16.1-alpine3.11

RUN mkdir -p /var/app
WORKDIR /var/app

ARG NPM_TOKEN

ENV PORT=80

COPY ["package.json", "yarn.lock", ".npmrc", "./"]
RUN yarn --production --frozen-lockfile && yarn cache clean

COPY ./dist .

RUN rm -f .npmrc

CMD yarn run start