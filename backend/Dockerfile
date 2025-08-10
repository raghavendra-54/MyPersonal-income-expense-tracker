# Stage 1: Build the application using Maven
FROM maven:3.8.5-openjdk-17-slim AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean install -DskipTests

# ... (keep all the build steps above the final FROM)
# Use a lean base image for the final stage
FROM openjdk:17-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the packaged JAR file from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# The command to run the application, passing the database URL as a command-line argument
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.datasource.url=${DATABASE_URL}", "--spring.datasource.username=${PGUSER}", "--spring.datasource.password=${PGPASSWORD}"]
