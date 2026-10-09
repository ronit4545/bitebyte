package com.bitebyte.security;

import com.bitebyte.config.ApiException;
import com.bitebyte.model.User;
import com.bitebyte.service.JsonDatabase;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/** Replaces the Express authenticateToken / requireAdmin middleware. */
@Component
public class AuthService {
    private final JwtService jwt;
    private final JsonDatabase db;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);

    public AuthService(JwtService jwt, JsonDatabase db) {
        this.jwt = jwt;
        this.db = db;
    }

    public String hash(String password) {
        return encoder.encode(password);
    }

    public boolean matches(String password, String hash) {
        try {
            return hash != null && encoder.matches(password, hash);
        } catch (Exception e) {
            return false;
        }
    }

    /** Reads "Authorization: Bearer <token>" and returns the logged-in user. */
    public User authenticate(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        String token = null;
        if (header != null) {
            String[] parts = header.split(" ");
            if (parts.length > 1) token = parts[1];
        }
        if (token == null || token.isEmpty()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required. No token provided.");
        }

        String userId;
        try {
            userId = jwt.verifyAndGetUserId(token);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invalid or expired session token.");
        }

        User user = db.data().getUsers().stream()
                .filter(u -> u.getId().equals(userId)).findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found in system."));

        if ("suspended".equals(user.getStatus())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Your account has been suspended by an administrator.");
        }
        return user;
    }

    public User requireAdmin(HttpServletRequest request) {
        User user = authenticate(request);
        if (!"admin".equals(user.getRole())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Access denied. Administrator privileges required.");
        }
        return user;
    }

    public String generateToken(User user) {
        return jwt.generate(user);
    }
}
