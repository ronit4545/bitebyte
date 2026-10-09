package com.bitebyte.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/** Server-Sent Events hub for the admin's real-time activity monitor. */
@Component
public class ActivityStream {
    private final List<SseEmitter> clients = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(0L); // 0 = never time out
        clients.add(emitter);
        emitter.onCompletion(() -> clients.remove(emitter));
        emitter.onTimeout(() -> clients.remove(emitter));
        emitter.onError(e -> clients.remove(emitter));
        try {
            emitter.send(SseEmitter.event().data(
                    Map.of("type", "connected", "message", "SSE Live Activity Stream Connected"),
                    MediaType.APPLICATION_JSON));
        } catch (IOException e) {
            clients.remove(emitter);
        }
        return emitter;
    }

    public void broadcast(Object activity) {
        for (SseEmitter client : clients) {
            try {
                client.send(SseEmitter.event().data(activity, MediaType.APPLICATION_JSON));
            } catch (Exception e) {
                clients.remove(client); // dead client
            }
        }
    }
}
