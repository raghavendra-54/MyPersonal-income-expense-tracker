# Use a lightweight OpenJDK 17 base image
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven project files, including the Maven wrapper
COPY pom.xml .
COPY src ./src
COPY mvnw .
COPY .mvn ./.mvn

# Make the Maven wrapper executable
RUN chmod +x mvnw

# Build the application using Maven
RUN ./mvnw clean install -DskipTests

# Copy the built JAR file from the target directory to the container
# The 'target' folder is created inside '/app' by the previous RUN command
COPY target/tracker-0.0.1-SNAPSHOT.jar app.jar

# Expose the port your application runs on
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java","-jar","/app/app.jar"]