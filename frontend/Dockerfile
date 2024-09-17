# syntax=docker/dockerfile:1

# Specify Node version
ARG NODE_VERSION=20.17.0

################################################################################
# Base stage (common for both production and development)
FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /app/frontend

################################################################################
# Dependencies stage (common for both production and development)
FROM base AS deps

# Install only production dependencies
RUN --mount=type=bind,source=package.json,target=package.json \
	--mount=type=bind,source=package-lock.json,target=package-lock.json \
	--mount=type=cache,target=/root/.npm \
	npm ci --verbose --omit=dev

################################################################################
# Development stage (only installs dev dependencies, no build)
FROM base AS development

# Set environment to production
ENV NODE_ENV=development

# Install all dependencies, including dev dependencies
RUN --mount=type=bind,source=package.json,target=package.json \
	--mount=type=bind,source=package-lock.json,target=package-lock.json \
	--mount=type=cache,target=/root/.npm \
	npm ci --verbose

# Copy all source files for development
COPY . .

# Expose the port for development
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"]

################################################################################
# Production build stage
FROM deps AS build

# Download additional development dependencies before building, as some projects require
# "devDependencies" to be installed to build. If you don't need this, remove this step.
RUN --mount=type=bind,source=package.json,target=package.json \
	--mount=type=bind,source=package-lock.json,target=package-lock.json \
	--mount=type=cache,target=/root/.npm \
	npm ci

# Copy the rest of the source files
COPY . .

# Run the build for production
RUN npm run build

################################################################################
# Production final stage (runs the built application)
FROM base AS production

# Set environment to production
ENV NODE_ENV=production

# Use a non-root user for security
USER node

# Copy over the necessary files from the dependencies and build stages
COPY package.json .
COPY --from=deps /app/frontend/node_modules ./node_modules
COPY --from=build --chown=node /app/frontend/.next ./.next

# Expose the production port
EXPOSE 3000

# Run the production build
CMD ["npm", "run", "start"]


# # syntax=docker/dockerfile:1

# # Comments are provided throughout this file to help you get started.
# # If you need more help, visit the Dockerfile reference guide at
# # https://docs.docker.com/go/dockerfile-reference/

# # Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

# ARG NODE_VERSION=20.17.0

# ################################################################################
# # Use node image for base image for all stages.
# FROM node:${NODE_VERSION}-alpine AS base

# # Set working directory for all build stages.
# WORKDIR /app/frontend


# ################################################################################
# # Create a stage for installing production dependecies.
# FROM base AS deps

# # Download dependencies as a separate step to take advantage of Docker's caching.
# # Leverage a cache mount to /root/.npm to speed up subsequent builds.
# # Leverage bind mounts to package.json and package-lock.json to avoid having to copy them
# # into this layer.
# RUN --mount=type=bind,source=package.json,target=package.json \
# 	--mount=type=bind,source=package-lock.json,target=package-lock.json \
# 	--mount=type=cache,target=/root/.npm \
# 	npm ci --omit=dev

# ################################################################################
# # Create a stage for building the application.
# FROM deps AS build

# # Download additional development dependencies before building, as some projects require
# # "devDependencies" to be installed to build. If you don't need this, remove this step.
# RUN --mount=type=bind,source=package.json,target=package.json \
# 	--mount=type=bind,source=package-lock.json,target=package-lock.json \
# 	--mount=type=cache,target=/root/.npm \
# 	npm ci

# # Copy the rest of the source files into the image.
# COPY . .
# # Run the build script.
# RUN npm run build

# ################################################################################
# # Create a new stage to run the application with minimal runtime dependencies
# # where the necessary files are copied from the build stage.
# FROM base AS final

# # Use production node environment by default.
# ENV NODE_ENV production

# # Run the application as a non-root user.
# USER node

# # Copy package.json so that package manager commands can be used.
# COPY package.json .


# # Copy the production dependencies from the deps stage and also
# # the built application from the build stage into the image.
# COPY --from=deps /app/frontend/node_modules ./node_modules
# COPY --from=build --chown=node /app/frontend/.next ./.next


# # Expose the port that the application listens on.
# EXPOSE 3000

# # Run the application.
# ENTRYPOINT ["npm", "run"]
