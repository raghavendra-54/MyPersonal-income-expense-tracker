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
# Remove these lines:
# ENV SPRING_DATASOURCE_URL=${DATABASE_URL}
# ENV SPRING_DATASOURCE_USERNAME=${PGUSER}
# ENV SPRING_DATASOURCE_PASSWORD=${PGPASSWORD}

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
