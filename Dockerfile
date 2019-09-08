FROM node:10-slim

LABEL "com.github.actions.name"="Auditor"
LABEL "com.github.actions.description"="Run tests on a webpage via Google's Lighthouse tool"
LABEL "com.github.actions.icon"="check-square"
LABEL "com.github.actions.color"="yellow"

# Install and upgrade utilities
RUN apt-get update --fix-missing && apt-get -y upgrade

# Install latest Chrome stable (and jq for later JSON parsing -- https://stedolan.github.io/jq/)
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable jq bc --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /src/*.deb

# Disable Lighthouse error reporting to prevent prompt
ENV CI=true

ADD entrypoint.sh /app/entrypoint.sh
ADD lib /app/auditor

RUN npm link /app/auditor
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
