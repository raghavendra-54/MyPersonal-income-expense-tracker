# Build stage
FROM maven:3.8.7-eclipse-temurin-17 AS build
WORKDIR /app
# Copy specific backend files
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built JAR file
COPY --from=build /app/target/*.jar app.jar

# Copy frontend static files into the container
# Assuming your frontend files are in the root directory and subfolders
COPY ./index.html ./static/
COPY ./login.html ./static/auth/
COPY ./register.html ./static/auth/
COPY ./forgot-password.html ./static/auth/
COPY ./css ./static/css/
COPY ./js ./static/js/

# Expose the port your application runs on
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]