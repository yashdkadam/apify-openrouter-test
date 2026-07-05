# 1. Use the smallest, fastest Node.js base image since we don't need browsers
FROM apify/actor-node:20

# 2. Copy just package.json to leverage the Docker layer cache
COPY package*.json ./

# 3. Install production dependencies cleanly, omitting dev/optional packages
RUN npm --quiet set progress=false \
    && npm install --omit=dev --omit=optional \
    && echo "Installed NPM packages:" \
    && (npm list --omit=dev --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version \
    && rm -rf ~/.npm

# 4. Copy the remaining files and directories containing the source code
COPY . ./

# 5. Run the entrypoint main.js file directly from the root directory
CMD ["node", "main.js"]
