# Build stage
FROM maven:3.8.7-eclipse-temurin-17 AS build
WORKDIR /app

# Copy only necessary files for better layer caching
COPY backend/pom.xml .
# First download dependencies (cache this layer)
RUN mvn dependency:go-offline

# Copy source code
COPY backend/src ./src
# Build with prod profile
RUN mvn clean package -DskipTests -Pprod

# Runtime stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy built JAR with a fixed name
COPY --from=build /app/target/*.jar app.jar

# Health check (critical for Render)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Explicit port configuration
EXPOSE 8080
ENV PORT=8080
# Use shell form for env variable substitution
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]