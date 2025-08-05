# First stage: Build the application
FROM openjdk:17-jdk-slim AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven wrapper and project files first
COPY mvnw .
COPY .mvn ./.mvn
COPY pom.xml .
COPY src ./src

# Make the Maven wrapper executable
RUN chmod +x mvnw

# Run Maven commands
RUN ./mvnw clean install -DskipTests

# Second stage: Create the final image
FROM openjdk:17-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the built JAR file from the 'builder' stage
COPY --from=builder /app/target/tracker-0.0.1-SNAPSHOT.jar app.jar

# Expose the port your application runs on
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java","-jar","/app/app.jar"]