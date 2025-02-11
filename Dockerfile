# Base image with Node.js 20.13.0 on Alpine 3.19
FROM node:20.13.0-alpine3.19

# Install required dependencies for Playwright
USER root
RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" > /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
    && echo "http://dl-cdn.alpinelinux.org/alpine/v3.12/main" >> /etc/apk/repositories \
    && apk upgrade -U -a \
    && apk add \
    bash \
    curl \
    unzip \
    fontconfig \
    ttf-freefont \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    libnsl \
    libx11 \
    libxcomposite \
    libxdamage \
    libxext \
    libxfixes \
    libxi \
    libxrandr \
    libxrender \
    mesa-dri-gallium \
    libstdc++ \
    mesa-gl \
    mesa-egl \
    mesa-osmesa \
    font-noto-emoji \
    xvfb \
    udev \
    wqy-zenhei \
    chromium \
    && apk add --no-cache tini \
    && rm -rf /var/cache/* \
    && mkdir /var/cache/apk

# Playwright
ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/ \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

COPY --chown=node package.json package-lock.json ./
RUN npm i
COPY --chown=node  ./ ./

# Set the default command to run the script
ENTRYPOINT ["tini", "--"]
CMD [ "node", "index.js" ]