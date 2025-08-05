# Build stage
FROM maven:3.8.6-openjdk-17 AS build
WORKDIR /app
# Copy from backend folder in your repo
COPY backend/pom.xml .
COPY backend/src ./src
COPY backend/.mvn ./.mvn
COPY backend/mvnw .
# Build
RUN ./mvnw clean package -DskipTests

# Run stage
FROM openjdk:17
WORKDIR /app
COPY --from=build /app/target/tracker-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]