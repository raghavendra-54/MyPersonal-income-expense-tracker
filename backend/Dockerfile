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

# Explicitly set the database connection environment variables
# These variable names must match the placeholders in your application.properties
ENV SPRING_DATASOURCE_URL=${DATABASE_URL}
ENV SPRING_DATASOURCE_USERNAME=${PGUSER}
ENV SPRING_DATASOURCE_PASSWORD=${PGPASSWORD}

# Expose the port your application listens on
EXPOSE 8080

# The command to run the application when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]
