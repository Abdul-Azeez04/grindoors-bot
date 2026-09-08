FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

# Build typescript code (bypass strict errors with dev script if needed, or rely on ts-node)
# RUN npm run build

# Add a script to run migrations and then start the bot
RUN echo '#!/bin/sh\nnpx prisma db push\nnpm run dev' > start.sh
RUN chmod +x start.sh

COPY . .

CMD ["./start.sh"]
