# Build integrado: compila o frontend, roda todos os testes e gera um único JAR.
# Se algum teste falhar, a imagem não é gerada (e o deploy não acontece).

FROM node:22-bookworm-slim AS frontend
WORKDIR /app/frontend
RUN npm install --global pnpm@10.18.3
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
# Nome da loja nos menus e no título da aba (cada instalação define o seu).
# Ex.: docker build --build-arg VITE_STORE_NAME="Celulares do João" .
ARG VITE_STORE_NAME="Minha Loja"
# Opcionais, para o comprovante impresso: CNPJ, endereço e a largura da bobina (80mm ou 58mm).
ARG VITE_STORE_CNPJ=""
ARG VITE_STORE_ADDRESS=""
ARG VITE_RECEIPT_WIDTH="80mm"
RUN pnpm exec tsc --noEmit && pnpm test && pnpm build

FROM maven:3.9-eclipse-temurin-25 AS backend
WORKDIR /app
COPY backend/ ./backend/
COPY --from=frontend /app/frontend/dist ./frontend/dist
WORKDIR /app/backend
RUN mvn -B clean package -Pwith-frontend

FROM eclipse-temurin:25-jre-jammy
WORKDIR /app
RUN groupadd --system app && useradd --system --gid app app
COPY --from=backend --chown=app:app /app/backend/target/sistema-pdv-0.0.1-SNAPSHOT.jar ./app.jar
USER app
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=50 -XX:+ExitOnOutOfMemoryError"
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
