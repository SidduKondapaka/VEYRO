# ============================================================
# VEYRO Backend — Multi-Stage Docker Build
# Stage 1: Build the JAR with Maven
# Stage 2: Run with lightweight JRE 21
# ============================================================

# --- Build Stage ---
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy Maven POM and download dependencies (cached layer)
COPY pom.xml .
RUN apk add --no-cache maven && \
    mvn dependency:go-offline -B

# Copy source and build the fat JAR (skip tests for faster build)
COPY src ./src
RUN mvn package -DskipTests -B

# --- Runtime Stage ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Security: run as non-root user
RUN addgroup -S veyro && adduser -S veyro -G veyro

# Copy the compiled JAR from builder
COPY --from=builder /app/target/*.jar app.jar

USER veyro

# Expose Spring Boot port
EXPOSE 8080

# Health check for Railway/Render
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

# Start the application
ENTRYPOINT ["java", "-jar", "-Djava.security.egd=file:/dev/./urandom", "app.jar"]
