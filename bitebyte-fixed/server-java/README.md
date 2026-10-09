# BiteByte – Java (Spring Boot) Backend

Drop-in replacement for the Node/Express server. It exposes the **same REST API** on port 5000,
so the React frontend in `../client` works without any changes.

## Requirements
- JDK 17 or newer (`java -version`)
- Maven 3.8+ (`mvn -v`) – or open this folder in IntelliJ / Eclipse / VS Code and run `BiteByteApplication`
- Node.js only to build the frontend once

## Run
```bash
# 1. Build the React frontend once (from the project root)
cd client
npm install
npm run build
cd ..

# 2. Start the Java server
cd server-java
mvn spring-boot:run
```
Open http://localhost:5000

Run the existing end-to-end test suite against the Java server (server must be running):
```bash
cd ..            # project root
npm install
npm test
```

## Package as a single jar
```bash
mvn clean package
java -jar target/bitebyte-server-1.0.0.jar
```

## Demo accounts
| Role  | Email               | Password |
|-------|---------------------|----------|
| Admin | admin@bitebyte.com  | admin123 |
| User  | user@bitebyte.com   | user123  |

## Project structure
```
src/main/java/com/bitebyte
├── BiteByteApplication.java      entry point
├── config/        ApiException, GlobalExceptionHandler, WebConfig (CORS, static React files)
├── model/         User, Recipe, Review, Activity, Settings, Database, RecipeView
├── security/      JwtService (tokens), AuthService (login check, admin check, BCrypt)
├── service/       JsonDatabase (JSON file storage), RecipeService, ActivityStream (SSE), Util
└── controller/    Auth, User, Recipe, Rating, Admin, Health  (REST endpoints)
```

## Node -> Java mapping
| Node / Express            | Java / Spring Boot                         |
|---------------------------|--------------------------------------------|
| `server.js`               | `BiteByteApplication` + `WebConfig`        |
| `db.js` (db.json)         | `JsonDatabase` + `model/*`                 |
| `middleware/auth.js`      | `AuthService` + `JwtService`               |
| `routes/*.js`             | `controller/*Controller.java`              |
| bcryptjs / jsonwebtoken   | Spring Security Crypto (BCrypt) / JJWT     |
| Server-Sent Events        | `ActivityStream` (`SseEmitter`)            |

## Configuration (`src/main/resources/application.properties`)
`PORT` and `JWT_SECRET` can be overridden with environment variables. Data is stored in `data/db.json`
(created from bundled seed data on first run – delete it to reset).
