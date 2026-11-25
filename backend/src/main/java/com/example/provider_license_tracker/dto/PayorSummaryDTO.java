package com.example.provider_license_tracker.dto;

public class PayorSummaryDTO {
    private String payerName;
    private long totalPlans;
    private long active;
    private long pending;
    private long expired;

    public PayorSummaryDTO(String payerName, long totalPlans, long active, long pending, long expired) {
        this.payerName = payerName;
        this.totalPlans = totalPlans;
        this.active = active;
        this.pending = pending;
        this.expired = expired;
    }

    // Getters and Setters
    public String getPayerName() { return payerName; }
    public void setPayerName(String payerName) { this.payerName = payerName; }

    public long getTotalPlans() { return totalPlans; }
    public void setTotalPlans(long totalPlans) { this.totalPlans = totalPlans; }

    public long getActive() { return active; }
    public void setActive(long active) { this.active = active; }

    public long getPending() { return pending; }
    public void setPending(long pending) { this.pending = pending; }

    public long getExpired() { return expired; }
    public void setExpired(long expired) { this.expired = expired; }
}