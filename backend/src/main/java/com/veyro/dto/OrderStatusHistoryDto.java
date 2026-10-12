package com.veyro.dto;

import java.time.LocalDateTime;

public class OrderStatusHistoryDto {
    private Long id;
    private String status;
    private String comment;
    private LocalDateTime createdAt;

    public OrderStatusHistoryDto() {}

    public OrderStatusHistoryDto(Long id, String status, String comment, LocalDateTime createdAt) {
        this.id = id;
        this.status = status;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
