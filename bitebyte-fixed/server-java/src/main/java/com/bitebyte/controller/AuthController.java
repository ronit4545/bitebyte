package com.bitebyte.controller;

import com.bitebyte.config.ApiException;
import com.bitebyte.model.Recipe;
import com.bitebyte.model.Review;
import com.bitebyte.model.User;
import com.bitebyte.security.AuthService;
import com.bitebyte.service.JsonDatabase;
import com.bitebyte.service.Util;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Registration, login, demo role switch, profile and password management. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JsonDatabase db;
    private final AuthService auth;

    public AuthController(JsonDatabase db, AuthService auth) {
        this.db = db;
        this.auth = auth;
    }

    private Map<String, Object> tokenResponse(String message, User user) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("message", message);
        res.put("token", auth.generateToken(user));
        res.put("user", user.toPublic());
        return res;
    }

    static String avatarFor(String name) {
        return "https://api.dicebear.com/7.x/bottts/svg?seed="
                + URLEncoder.encode(name, StandardCharsets.UTF_8).replace("+", "%20");
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody(required = false) Map<String, Object> body) {
        String name = Util.str(body, "name");
        String email = Util.str(body, "email");
        String password = Util.str(body, "password");

        if (!db.data().getSettings().isAllowRegistration()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Public registration is currently disabled by administrator.");
        }
        if (!Util.hasText(name) || !Util.hasText(email) || !Util.hasText(password)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please provide all required fields: name, email, and password.");
        }
        boolean exists = db.data().getUsers().stream().anyMatch(u -> u.getEmail().equalsIgnoreCase(email));
        if (exists) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email address already exists.");
        }

        User u = new User();
        u.setId(Util.shortId("usr-"));
        u.setName(name.trim());
        u.setEmail(email.trim().toLowerCase());
        u.setPasswordHash(auth.hash(password));
        u.setRole("user");
        u.setAvatar(avatarFor(name));
        u.setBio("Culinary explorer and food lover on BiteByte.");
        u.setSpecialty("Home Cooking Enthusiast");
        u.setStatus("active");
        u.setCreatedAt(Util.now());

        db.data().getUsers().add(u);
        db.logActivity("user_registered", u, "User \"" + u.getName() + "\" created a new account.");
        db.save();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tokenResponse("Account registered successfully! Welcome to BiteByte.", u));
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody(required = false) Map<String, Object> body) {
        String email = Util.str(body, "email");
        String password = Util.str(body, "password");

        if (!Util.hasText(email) || !Util.hasText(password)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please enter both email and password.");
        }
        User user = db.data().getUsers().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email)).findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if ("suspended".equals(user.getStatus())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Your account is suspended. Please contact system admin.");
        }
        if (!auth.matches(password, user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        return tokenResponse("Welcome back, " + user.getName() + "!", user);
    }

    /** Instant switch between Admin and standard User for evaluation. */
    @PostMapping("/demo-login")
    public Map<String, Object> demoLogin(@RequestBody(required = false) Map<String, Object> body) {
        String role = Util.str(body, "role");
        var users = db.data().getUsers();
        String wanted = "admin".equals(role) ? "admin" : "user";
        User target = users.stream().filter(u -> wanted.equals(u.getRole())).findFirst()
                .orElse(users.isEmpty() ? null : users.get(0));
        if (target == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Requested demo user not found.");
        }
        return tokenResponse("Switched session to " + target.getRole().toUpperCase() + ": " + target.getName(), target);
    }

    @GetMapping("/me")
    public Map<String, Object> me(HttpServletRequest request) {
        return auth.authenticate(request).toPublic();
    }

    /** Profile Management: update name, bio, specialty and avatar. */
    @PutMapping("/profile")
    public Map<String, Object> updateProfile(HttpServletRequest request,
                                             @RequestBody(required = false) Map<String, Object> body) {
        User user = auth.authenticate(request);
        String name = Util.str(body, "name");
        String bio = Util.str(body, "bio");
        String specialty = Util.str(body, "specialty");
        String avatar = Util.str(body, "avatar");

        if (Util.hasText(name)) user.setName(name.trim());
        if (bio != null) user.setBio(bio.trim());
        if (specialty != null) user.setSpecialty(specialty.trim());
        if (Util.hasText(avatar)) user.setAvatar(avatar.trim());

        for (Recipe r : db.data().getRecipes()) {
            if (r.getAuthorId().equals(user.getId())) {
                r.setAuthorName(user.getName());
                r.setAuthorAvatar(user.getAvatar());
            }
        }
        for (Review rev : db.data().getRatings()) {
            if (rev.getUserId().equals(user.getId())) {
                rev.setUserName(user.getName());
                rev.setUserAvatar(user.getAvatar());
            }
        }
        db.save();
        db.logActivity("user_updated", user, "User \"" + user.getName() + "\" updated their profile details.");

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("message", "Profile details updated successfully!");
        res.put("user", user.toPublic());
        return res;
    }

    @PutMapping("/password")
    public Map<String, Object> updatePassword(HttpServletRequest request,
                                              @RequestBody(required = false) Map<String, Object> body) {
        User user = auth.authenticate(request);
        String current = Util.str(body, "currentPassword");
        String next = Util.str(body, "newPassword");

        if (!Util.hasText(current) || !Util.hasText(next)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please provide current and new passwords.");
        }
        if (next.length() < 6) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New password must be at least 6 characters long.");
        }
        if (!auth.matches(current, user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password does not match.");
        }
        user.setPasswordHash(auth.hash(next));
        db.save();
        return Map.of("message", "Password has been updated successfully!");
    }
}
