package com.bitebyte.controller;

import com.bitebyte.config.ApiException;
import com.bitebyte.model.User;
import com.bitebyte.security.AuthService;
import com.bitebyte.service.JsonDatabase;
import com.bitebyte.service.Util;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Admin: User Management (list, create, edit, suspend, delete). */
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final JsonDatabase db;
    private final AuthService auth;

    public UserController(JsonDatabase db, AuthService auth) {
        this.db = db;
        this.auth = auth;
    }

    @GetMapping
    public List<Map<String, Object>> list(HttpServletRequest request) {
        auth.requireAdmin(request);
        List<Map<String, Object>> out = new ArrayList<>();
        for (User u : db.data().getUsers()) {
            Map<String, Object> m = u.toPublic();
            m.put("recipesCount", db.data().getRecipes().stream().filter(r -> r.getAuthorId().equals(u.getId())).count());
            m.put("ratingsCount", db.data().getRatings().stream().filter(r -> r.getUserId().equals(u.getId())).count());
            out.add(m);
        }
        return out;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(HttpServletRequest request,
                                                      @RequestBody(required = false) Map<String, Object> body) {
        User admin = auth.requireAdmin(request);
        String name = Util.str(body, "name");
        String email = Util.str(body, "email");
        String role = Util.str(body, "role");
        String password = Util.str(body, "password");

        if (!Util.hasText(name) || !Util.hasText(email)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "User name and email are required.");
        }
        if (db.data().getUsers().stream().anyMatch(u -> u.getEmail().equalsIgnoreCase(email))) {
            throw new ApiException(HttpStatus.CONFLICT, "A user with this email address already exists.");
        }

        User u = new User();
        u.setId(Util.shortId("usr-"));
        u.setName(name.trim());
        u.setEmail(email.trim().toLowerCase());
        u.setPasswordHash(auth.hash(Util.hasText(password) ? password : "BiteByte123!"));
        u.setRole("admin".equals(role) ? "admin" : "user");
        u.setBio("BiteByte member");
        u.setAvatar(AuthController.avatarFor(name));
        u.setSpecialty("Home Chef");
        u.setStatus("active");
        u.setCreatedAt(Util.now());

        db.data().getUsers().add(u);
        db.logActivity("user_registered", admin,
                "Admin created user account for \"" + u.getName() + "\" (" + u.getRole() + ").");
        db.save();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("message", "User account created successfully!");
        res.put("user", u.toPublic());
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(HttpServletRequest request, @PathVariable String id,
                                      @RequestBody(required = false) Map<String, Object> body) {
        User admin = auth.requireAdmin(request);
        String name = Util.str(body, "name");
        String email = Util.str(body, "email");
        String role = Util.str(body, "role");
        String status = Util.str(body, "status");
        String specialty = Util.str(body, "specialty");

        User user = db.data().getUsers().stream().filter(u -> u.getId().equals(id)).findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User account not found."));

        if (admin.getId().equals(id) && Util.hasText(role) && !role.equals("admin")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot revoke your own administrator privileges.");
        }

        if (Util.hasText(email) && !email.equalsIgnoreCase(user.getEmail())) {
            boolean taken = db.data().getUsers().stream()
                    .anyMatch(u -> u.getEmail().equalsIgnoreCase(email) && !u.getId().equals(id));
            if (taken) {
                throw new ApiException(HttpStatus.CONFLICT, "Email is already used by another user.");
            }
            user.setEmail(email.trim().toLowerCase());
        }
        if (Util.hasText(name)) user.setName(name.trim());
        if ("admin".equals(role) || "user".equals(role)) user.setRole(role);
        if ("active".equals(status) || "suspended".equals(status)) user.setStatus(status);
        if (specialty != null) user.setSpecialty(specialty.trim());

        db.save();
        db.logActivity("user_updated", admin, "Admin updated user details for \"" + user.getName() + "\".");

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("message", "User account updated successfully!");
        res.put("user", user.toPublic());
        return res;
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(HttpServletRequest request, @PathVariable String id) {
        User admin = auth.requireAdmin(request);
        if (admin.getId().equals(id)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot delete your own administrator account.");
        }
        User user = db.data().getUsers().stream().filter(u -> u.getId().equals(id)).findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User account not found."));

        db.data().getUsers().remove(user);
        db.save();
        db.logActivity("user_deleted", admin, "Admin deleted user account for \"" + user.getName() + "\".");
        return Map.of("message", "User account deleted successfully!");
    }
}
