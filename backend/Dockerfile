# ==========================================
# Multi-stage Dockerfile for Spring Boot backend
# Stage 1: Build with Maven
# Stage 2: Lean JRE runtime image
# ==========================================

# ----- Stage 1: Build -----
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Cache Maven dependencies separately (layer caching optimization)
COPY pom.xml .
RUN mvn -f pom.xml dependency:resolve --no-transfer-progress || true

# Copy source and build
COPY src ./src
RUN mvn -f pom.xml clean package -DskipTests --no-transfer-progress

# ----- Stage 2: Runtime -----
FROM eclipse-temurin:17-jre-alpine AS runtime

# Create non-root user for security
RUN apk add --no-cache curl \
  && addgroup -S appgroup \
  && adduser -S appuser -G appgroup
USER appuser

WORKDIR /app

# Copy the fat JAR
COPY --from=builder /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# JVM tuning: container-aware heap, GC logging
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
