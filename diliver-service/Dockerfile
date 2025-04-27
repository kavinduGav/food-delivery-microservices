# Use Node.js official image
FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Install nodemon globally inside container
RUN npm install -g nodemon

# Bundle app source
COPY . .

# App binds to port 7000
EXPOSE 3002

# Run the app
CMD ["npm", "run", "dev"]
