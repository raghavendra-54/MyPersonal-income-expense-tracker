# Build stage
FROM maven:3.8.7-eclipse-temurin-17 AS build
WORKDIR /app

# Copy backend files from the 'backend' directory
COPY backend/pom.xml .
COPY backend/src ./src

# Run the Maven build
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built JAR file
COPY --from=build /app/target/*.jar app.jar

# Expose the port
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]