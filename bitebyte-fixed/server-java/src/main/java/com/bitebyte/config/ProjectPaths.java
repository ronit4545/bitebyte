package com.bitebyte.config;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Resolves relative folders (database, React build, uploads) against the project layout,
 * so the server works no matter which folder VS Code / the terminal starts it from.
 */
public final class ProjectPaths {
    private ProjectPaths() {}

    /** The "server-java" folder, found by walking up from the current working directory. */
    public static Path serverDir() {
        Path cwd = Paths.get("").toAbsolutePath().normalize();
        for (Path p = cwd; p != null; p = p.getParent()) {
            if (Files.exists(p.resolve("pom.xml")) && Files.isDirectory(p.resolve("src"))) return p;
            Path child = p.resolve("server-java");
            if (Files.exists(child.resolve("pom.xml"))) return child;
        }
        return cwd;
    }

    /** Resolves a configured path (absolute stays as-is, relative is based on server-java). */
    public static Path resolve(String configured) {
        Path p = Paths.get(configured);
        if (p.isAbsolute()) return p.normalize();
        return serverDir().resolve(p).toAbsolutePath().normalize();
    }
}
