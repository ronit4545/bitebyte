package com.bitebyte.security;

import com.bitebyte.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Creates and verifies the JWT session tokens (valid for 7 days). */
@Component
public class JwtService {
    private final SecretKey key;
    private final long expiryMillis;

    public JwtService(@Value("${bitebyte.jwt.secret}") String secret,
                      @Value("${bitebyte.jwt.expiry-days}") int days) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiryMillis = days * 24L * 60 * 60 * 1000;
    }

    public String generate(User user) {
        Date now = new Date();
        return Jwts.builder()
                .claim("id", user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expiryMillis))
                .signWith(key)
                .compact();
    }

    /** Returns the user id stored in the token, or throws if the token is invalid/expired. */
    public String verifyAndGetUserId(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        return claims.get("id", String.class);
    }
}
