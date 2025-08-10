# Stage 1: Build the application using Maven
FROM maven:3.8.5-openjdk-17-slim AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the pom.xml file to download dependencies
COPY pom.xml .

# Copy the rest of the source code
COPY src ./src

# Package the application into an executable JAR file, skipping tests
RUN mvn clean install -DskipTests

# ---

# Stage 2: Create a lean image for running the application
FROM openjdk:17-jdk-slim

# Set the working directory for the runtime environment
WORKDIR /app

# Copy the packaged JAR file from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Explicitly set the database connection environment variables
# This ensures that your application can connect to the database on Railway
ENV SPRING_DATASOURCE_URL=${DATABASE_URL}
ENV SPRING_DATASOURCE_USERNAME=${PGUSER}
ENV SPRING_DATASOURCE_PASSWORD=${PGPASSWORD}

# Expose the port your application listens on
EXPOSE 8080

# The command to run the application when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]
