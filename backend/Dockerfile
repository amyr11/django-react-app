# syntax=docker/dockerfile:1

# Start with the base Python image and specify the version.
ARG PYTHON_VERSION=3.12.4
FROM python:${PYTHON_VERSION}-slim AS base

# Prevents Python from writing pyc files and unbuffer logs.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory for the application.
WORKDIR /app/backend

################################################################################
# Dependencies stage (shared between production and development)
FROM base AS deps

# Cache pip packages for faster builds
RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=requirements.txt,target=requirements.txt \
    python -m pip install -r requirements.txt

################################################################################
# Development stage
FROM deps AS development

# Copy the source code for development
COPY . .
ENV DEBUG=true

# Expose the port for development mode
EXPOSE 8000

# Use the development entrypoint
ENTRYPOINT [ "sh", "./scripts/entrypoint.dev.sh" ]


################################################################################
# Production stage
FROM deps AS production

# Copy the source code for production
COPY . .

# Expose the port for production mode
EXPOSE 8000

# Use the production entrypoint
ENTRYPOINT [ "sh", "./scripts/entrypoint.prod.sh" ]


# # syntax=docker/dockerfile:1

# # Comments are provided throughout this file to help you get started.
# # If you need more help, visit the Dockerfile reference guide at
# # https://docs.docker.com/go/dockerfile-reference/

# # Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

# ARG PYTHON_VERSION=3.12.4
# FROM python:${PYTHON_VERSION}-slim AS base

# # Prevents Python from writing pyc files.
# ENV PYTHONDONTWRITEBYTECODE=1

# # Keeps Python from buffering stdout and stderr to avoid situations where
# # the application crashes without emitting any logs due to buffering.
# ENV PYTHONUNBUFFERED=1

# WORKDIR /app/backend

# # # Create a non-privileged user that the app will run under.
# # # See https://docs.docker.com/go/dockerfile-user-best-practices/
# # ARG UID=10001
# # RUN adduser \
# #     --disabled-password \
# #     --gecos "" \
# #     --home "/nonexistent" \
# #     --shell "/sbin/nologin" \
# #     --no-create-home \
# #     --uid "${UID}" \
# #     appuser

# # Download dependencies as a separate step to take advantage of Docker's caching.
# # Leverage a cache mount to /root/.cache/pip to speed up subsequent builds.
# # Leverage a bind mount to requirements.txt to avoid having to copy them into
# # into this layer.
# RUN --mount=type=cache,target=/root/.cache/pip \
#     --mount=type=bind,source=requirements.txt,target=requirements.txt \
#     python -m pip install -r requirements.txt

# # # Switch to the non-privileged user to run the application.
# # USER appuser

# # Copy the source code into the container.
# COPY . .

# # Expose the port that the application listens on.
# EXPOSE 8000

# # Run the application.
# ENTRYPOINT [ "sh", "./scripts/entrypoint.prod.sh" ]