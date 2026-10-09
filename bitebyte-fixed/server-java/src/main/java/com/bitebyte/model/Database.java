package com.bitebyte.model;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/** Root object persisted to db.json. Lists are thread-safe because requests run concurrently. */
public class Database {
    private List<User> users = new CopyOnWriteArrayList<>();
    private List<Recipe> recipes = new CopyOnWriteArrayList<>();
    private List<Review> ratings = new CopyOnWriteArrayList<>();
    private Settings settings = new Settings();
    private List<Activity> activityLogs = new CopyOnWriteArrayList<>();

    public List<User> getUsers() { return users; }
    public void setUsers(List<User> users) { this.users = new CopyOnWriteArrayList<>(users); }

    public List<Recipe> getRecipes() { return recipes; }
    public void setRecipes(List<Recipe> recipes) { this.recipes = new CopyOnWriteArrayList<>(recipes); }

    public List<Review> getRatings() { return ratings; }
    public void setRatings(List<Review> ratings) { this.ratings = new CopyOnWriteArrayList<>(ratings); }

    public Settings getSettings() { return settings; }
    public void setSettings(Settings settings) { this.settings = settings; }

    public List<Activity> getActivityLogs() { return activityLogs; }
    public void setActivityLogs(List<Activity> activityLogs) { this.activityLogs = new CopyOnWriteArrayList<>(activityLogs); }
}
