# Use lightweight Alpine-based Node image
FROM node:16-alpine

# Set working directory for the frontend application
WORKDIR /frontend

# Copy package.json and package-lock.json first to leverage Docker cache for dependencies
COPY package*.json ./
RUN npm install && npm prune --production


# Copy the rest of the frontend application source code
COPY . .

# Expose port 9229 for debugging if needed, and default port for frontend (usually 3000)
EXPOSE 9229 3000

# Run app.js with debugging port when container launches
ENTRYPOINT ["node", "--inspect=9229", "app.js"]

# To run without the debugger, uncomment the line below:
# ENTRYPOINT ["node", "app.js"]

