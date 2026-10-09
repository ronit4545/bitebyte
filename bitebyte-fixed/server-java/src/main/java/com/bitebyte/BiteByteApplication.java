package com.bitebyte;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Entry point: starts the embedded web server on port 5000. */
@SpringBootApplication
public class BiteByteApplication {
    public static void main(String[] args) {
        SpringApplication.run(BiteByteApplication.class, args);
    }
}
