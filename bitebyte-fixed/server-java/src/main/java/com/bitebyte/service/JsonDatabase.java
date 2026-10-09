package com.bitebyte.service;

import com.bitebyte.model.Activity;
import com.bitebyte.model.Database;
import com.bitebyte.model.User;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import com.bitebyte.config.ProjectPaths;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

/**
 * The "database": all data lives in memory and is written to a JSON file after every change.
 * The file format is identical to the Node version's db.json.
 */
@Component
public class JsonDatabase {

    @Value("${bitebyte.db-file}")
    private String dbFile;

    private final ActivityStream activityStream;
    private final ObjectMapper mapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
            .enable(SerializationFeature.INDENT_OUTPUT);

    private Database data;

    public JsonDatabase(ActivityStream activityStream) {
        this.activityStream = activityStream;
    }

    @PostConstruct
    public void init() throws IOException {
        Path file = ProjectPaths.resolve(dbFile);
        if (Files.exists(file)) {
            try {
                data = mapper.readValue(file.toFile(), Database.class);
                return;
            } catch (IOException e) {
                System.err.println("Could not read " + file + ", loading seed data instead: " + e.getMessage());
            }
        }
        try (InputStream in = new ClassPathResource("seed-db.json").getInputStream()) {
            data = mapper.readValue(in, Database.class);
        }
        save();
    }

    public Database data() {
        return data;
    }

    public synchronized void save() {
        try {
            Path file = ProjectPaths.resolve(dbFile);
            if (file.getParent() != null) Files.createDirectories(file.getParent());
            mapper.writeValue(file.toFile(), data);
        } catch (IOException e) {
            System.err.println("Failed to save database: " + e.getMessage());
        }
    }

    /** Adds an entry to the activity log (newest first, max 200), saves, and pushes it to live viewers. */
    public synchronized Activity logActivity(String type, User actor, String details) {
        Activity log = new Activity();
        log.setId(Util.shortId("log-") + "-" + System.currentTimeMillis());
        log.setType(type);
        log.setActorId(actor != null ? actor.getId() : "system");
        log.setActorName(actor != null ? actor.getName() : "System");
        log.setActorRole(actor != null ? actor.getRole() : "system");
        log.setDetails(details);
        log.setTimestamp(Util.now());

        data.getActivityLogs().add(0, log);
        while (data.getActivityLogs().size() > 200) {
            data.getActivityLogs().remove(data.getActivityLogs().size() - 1);
        }
        save();
        activityStream.broadcast(log);
        return log;
    }
}
