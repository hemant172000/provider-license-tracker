package com.example.provider_license_tracker.model;

public enum TaskStatus {
    PENDING("PENDING"),
    TODO("To Do"),
    IN_PROGRESS("In Progress"),
    IN_REVIEW("In Review"),
    COMPLETED("Completed"),
    BLOCKED("Blocked");

    private final String displayName;

    TaskStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static TaskStatus fromString(String text) {
        for (TaskStatus status : TaskStatus.values()) {
            if (status.name().equalsIgnoreCase(text)) {
                return status;
            }
        }
        // Handle legacy PENDING values
        if ("PENDING".equalsIgnoreCase(text)) {
            return TODO;
        }
        return TODO;
    }
}