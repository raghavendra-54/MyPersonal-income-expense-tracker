# Build stage
FROM maven:3.8.7-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the backend project files from the 'backend' directory
COPY backend/pom.xml .
COPY backend/src ./src

# Make sure the frontend files are also in the build context
COPY ./index.html ./src/main/resources/static/
COPY ./login.html ./src/main/resources/static/auth/
COPY ./register.html ./src/main/resources/static/auth/
COPY ./forgot-password.html ./src/main/resources/static/auth/
COPY ./css ./src/main/resources/static/css/
COPY ./js ./src/main/resources/static/js/

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