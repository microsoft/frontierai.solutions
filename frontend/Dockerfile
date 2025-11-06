FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY frontend/package.json frontend/pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

COPY frontend/ .

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
