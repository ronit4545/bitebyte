package com.bitebyte.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Small helpers that mimic the loose JavaScript semantics the original API relied on. */
public final class Util {
    private Util() {}

    private static final Pattern INT_PREFIX = Pattern.compile("^\\s*([+-]?\\d+)");

    public static String now() {
        return Instant.now().truncatedTo(ChronoUnit.MILLIS).toString();
    }

    public static String shortId(String prefix) {
        return prefix + UUID.randomUUID().toString().substring(0, 8);
    }

    public static Instant time(String iso) {
        try {
            return Instant.parse(iso);
        } catch (Exception e) {
            return Instant.EPOCH;
        }
    }

    /** Like JavaScript parseInt(x, 10): returns null where JS would return NaN. */
    public static Integer parseInt(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.intValue();
        Matcher m = INT_PREFIX.matcher(value.toString());
        if (!m.find()) return null;
        try {
            return Integer.parseInt(m.group(1).replace("+", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static Double parseDouble(String value) {
        try {
            return value == null ? null : Double.parseDouble(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /** JavaScript-style truthiness for values coming out of a JSON body. */
    public static boolean truthy(Object v) {
        if (v == null) return false;
        if (v instanceof Boolean b) return b;
        if (v instanceof Number n) return n.doubleValue() != 0;
        if (v instanceof String s) return !s.isEmpty();
        return true;
    }

    public static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    /** Reads a JSON array (or newline separated string) into a clean list of strings. */
    public static List<String> toStringList(Object value) {
        List<String> out = new ArrayList<>();
        if (value instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof String s) {
                    if (!s.isBlank()) out.add(s);
                } else if (item instanceof Map<?, ?> map && map.get("name") != null) {
                    out.add(map.get("name").toString());
                }
            }
        } else if (value instanceof String s) {
            for (String line : s.split("\n")) {
                if (!line.trim().isEmpty()) out.add(line.trim());
            }
        }
        return out;
    }

    /** Converts any JSON array into a list of strings. */
    public static List<String> asStrings(List<?> items) {
        List<String> out = new ArrayList<>();
        for (Object o : items) out.add(String.valueOf(o));
        return out;
    }

    public static String str(Map<String, Object> body, String key) {
        Object v = body == null ? null : body.get(key);
        return v == null ? null : v.toString();
    }
}
