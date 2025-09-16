FROM node:24-alpine AS builder

ENV NODE_ENV production

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# -------------------- #

FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app .
COPY --from=builder /app/.env .

EXPOSE 3000

CMD ["node", "--env-file=.env", "build"]
