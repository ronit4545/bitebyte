package com.bitebyte.model;

import java.util.List;

/** System-wide settings managed by the admin. */
public class Settings {

    private String platformName;
    private String tagline;
    private boolean allowRegistration;
    private boolean autoApproveRecipes;
    private int maxUploadSizeMB;
    private boolean maintenanceMode;
    private String contactEmail;
    private String bannerNotice;
    private List<String> categories;

    public String getPlatformName() { return platformName; }
    public void setPlatformName(String platformName) { this.platformName = platformName; }
    public String getTagline() { return tagline; }
    public void setTagline(String tagline) { this.tagline = tagline; }
    public boolean isAllowRegistration() { return allowRegistration; }
    public void setAllowRegistration(boolean allowRegistration) { this.allowRegistration = allowRegistration; }
    public boolean isAutoApproveRecipes() { return autoApproveRecipes; }
    public void setAutoApproveRecipes(boolean autoApproveRecipes) { this.autoApproveRecipes = autoApproveRecipes; }
    public int getMaxUploadSizeMB() { return maxUploadSizeMB; }
    public void setMaxUploadSizeMB(int maxUploadSizeMB) { this.maxUploadSizeMB = maxUploadSizeMB; }
    public boolean isMaintenanceMode() { return maintenanceMode; }
    public void setMaintenanceMode(boolean maintenanceMode) { this.maintenanceMode = maintenanceMode; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
    public String getBannerNotice() { return bannerNotice; }
    public void setBannerNotice(String bannerNotice) { this.bannerNotice = bannerNotice; }
    public List<String> getCategories() { return categories; }
    public void setCategories(List<String> categories) { this.categories = categories; }

}
