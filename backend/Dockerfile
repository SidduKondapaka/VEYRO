# ============================================================
# VEYRO Backend — Multi-Stage Docker Build
# Stage 1: Build the JAR with Maven 3.9 + JDK 21
# Stage 2: Run with lightweight JRE 21
# ============================================================

# --- Build Stage ---
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy Maven POM and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build the fat JAR (skip tests for faster build)
COPY src ./src
RUN mvn package -DskipTests -B

# --- Runtime Stage ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the compiled JAR from builder
COPY --from=builder /app/target/*.jar app.jar

# Expose Spring Boot port
EXPOSE 8080

# Start the application
ENTRYPOINT ["java", "-jar", "-Djava.security.egd=file:/dev/./urandom", "app.jar"]
