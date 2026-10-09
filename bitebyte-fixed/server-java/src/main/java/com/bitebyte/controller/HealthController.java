package com.bitebyte.controller;

import com.bitebyte.service.Util;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("status", "healthy");
        m.put("platform", "BiteByte API");
        m.put("timestamp", Util.now());
        return m;
    }
}
