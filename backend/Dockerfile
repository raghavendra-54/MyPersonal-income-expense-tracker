# Stage 1: Build the application using Maven
FROM maven:3.8.5-openjdk-17-slim AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean install -DskipTests

# Stage 2: Create a lean image for running the application
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
# Use the ENTRYPOINT to pass the database URL directly
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.datasource.url=${DATABASE_URL}", "--spring.datasource.username=${PGUSER}", "--spring.datasource.password=${PGPASSWORD}"]
