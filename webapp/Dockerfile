FROM node:10 as react-build

WORKDIR /app

USER root

COPY . ./

RUN yarn
RUN yarn build

RUN yarn global add serve

EXPOSE 3000

CMD ["serve", "-p", "3000", "-s", "build"]