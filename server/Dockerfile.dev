# Use Node.js base image
FROM node:18-alpine

# Install necessary packages
RUN apk add --no-cache yarn python3 make g++

# Set working directory
WORKDIR /app

# Create logs directory
RUN mkdir -p logs

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code, prisma schema, and PM2 config
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN yarn build

# Expose port
EXPOSE 8888

# Start the application using PM2
CMD ["yarn", "start"]