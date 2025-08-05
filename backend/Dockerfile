# Build stage - Use valid Maven image
FROM maven:3.8.6-jdk-17 AS build  # Changed this line
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
COPY backend/.mvn ./.mvn
COPY backend/mvnw .
RUN ./mvnw clean package -DskipTests

# Run stage
FROM openjdk:17-jdk-slim  # More lightweight
WORKDIR /app
COPY --from=build /app/target/tracker-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]