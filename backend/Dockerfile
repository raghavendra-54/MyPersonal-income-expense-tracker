# Start with a base image containing Java 17 and Maven
FROM maven:3.8.5-openjdk-17-slim AS builder

# Set the working directory
WORKDIR /app

# Copy the pom.xml file to download dependencies
COPY pom.xml .

# Copy the rest of the source code
COPY src ./src

# Package the application into an executable JAR file
RUN mvn clean install -DskipTests

# Use a lean base image for the final stage
FROM openjdk:17-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the packaged JAR file from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
