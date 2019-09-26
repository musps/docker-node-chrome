FROM node:10-slim

# Install and upgrade utilities
RUN apt-get update --fix-missing && apt-get -y upgrade

# Install latest Chrome stable (and jq for later JSON parsing -- https://stedolan.github.io/jq/)
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable jq bc --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /src/*.deb

ENV CHROME_BIN=/usr/bin/google-chrome
