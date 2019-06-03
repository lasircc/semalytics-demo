FROM node:8

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

COPY gulpfile.js .

RUN npm install -g gulp
RUN npm install gulp

# Run when the container launches
CMD ["gulp"]