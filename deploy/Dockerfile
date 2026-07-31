# せつめいナビ コンテナイメージ
#
# 用途
#   ・院内サーバー1台で「静的配信＋任意のAPI」をまとめて動かす構成
#   ・クラウドで動かす場合も同じイメージを使えるが、
#     医療情報を扱うため docs/03_セキュリティと法令対応.md の要件を必ず満たすこと
#
# ビルド:  docker build -f deploy/Dockerfile -t setsumei-navi:1.0.0 .
# 実行:    docker run -d -p 8080:8080 -v setsumei-data:/app/server/data \
#            -e SETSUMEI_TOKEN="$(openssl rand -hex 32)" setsumei-navi:1.0.0

# ---------------------------------------------------------------- フロントエンドのビルド
FROM node:22-bookworm-slim AS frontend
WORKDIR /build

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY tsconfig*.json vite.config.ts tailwind.config.js postcss.config.js index.html ./
COPY src ./src
RUN npm run build

# ---------------------------------------------------------------- サーバー依存のビルド
# better-sqlite3 はネイティブビルドが必要なため、ビルド用の道具を入れた層で用意する
FROM node:22-bookworm-slim AS backend
WORKDIR /build
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY server/package.json server/package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund

# ---------------------------------------------------------------- 実行イメージ
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0 \
    DATA_DIR=/app/server/data

WORKDIR /app

# 非rootで動かす（node イメージには uid 1000 の node ユーザーが用意されている）
COPY --from=frontend /build/dist ./dist
COPY --from=backend  /build/node_modules ./server/node_modules
COPY server/index.mjs server/schema.sql server/package.json ./server/

RUN mkdir -p /app/server/data && chown -R node:node /app
USER node

EXPOSE 8080

# SETSUMEI_TOKEN は実行時に必ず渡す（未設定なら起動時に停止する設計）
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+ (process.env.PORT||8080) +'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

WORKDIR /app/server
CMD ["node", "index.mjs"]
