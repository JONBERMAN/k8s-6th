# Use lightweight Alpine-based Node image
FROM node:16-alpine

# Set working directory
WORKDIR /backend

# Copy package.json and install dependencies first to leverage Docker cache
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application source code
COPY . .

# Expose port 9229 for debugging if needed
# Expose default port 3000 (or your app's port)
EXPOSE 9229 3000

# Run the app.js with the debugger (inspect port 9229) or without it
ENTRYPOINT ["node", "--inspect=9229", "app.js"]

# To run without the debugger, uncomment the line below:
# ENTRYPOINT ["node", "app.js"]

