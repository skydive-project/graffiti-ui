FROM node:10
WORKDIR /usr/src/graffiti-ui
COPY package.json /usr/src/graffiti-ui
RUN npm install
COPY . .
CMD [ "/usr/src/graffiti-ui/node_modules/webpack-dev-server/bin/webpack-dev-server.js", "--host", "0.0.0.0" ]