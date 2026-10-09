package com.bitebyte.config;

import org.springframework.http.HttpStatus;

/** Thrown by controllers/services; turned into {"message": "..."} with the given status. */
public class ApiException extends RuntimeException {
    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() { return status; }
}
