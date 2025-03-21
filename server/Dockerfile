# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install necessary tools including netcat
RUN apk add --no-cache python3 make g++ netcat-openbsd

# Copy package files =
COPY package.json yarn.lock ./

# Copy Prisma schema
COPY prisma ./prisma/

# Install dependencies
RUN yarn install --frozen-lockfile

# Generate Prisma Client
RUN yarn prisma generate

# Copy source code
COPY . .

# Make wait script executable
RUN chmod +x src/scripts/wait-for-redis.sh

# Build TypeScript
RUN yarn build

# Copy the wait script to the dist folder so it's accessible after build
RUN mkdir -p dist/scripts && \
    cp src/scripts/wait-for-redis.sh dist/scripts/

# Expose port
EXPOSE 8088

# Start the application with wait script
CMD ["./dist/scripts/wait-for-redis.sh", "yarn", "start"]