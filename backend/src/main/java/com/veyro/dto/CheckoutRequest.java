package com.veyro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CheckoutRequest {

    @NotNull(message = "Delivery address ID is required")
    private Long addressId;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // COD, DEMO_CARD, DEMO_UPI

    private String notes;

    public CheckoutRequest() {}

    public CheckoutRequest(Long addressId, String paymentMethod, String notes) {
        this.addressId = addressId;
        this.paymentMethod = paymentMethod;
        this.notes = notes;
    }

    public Long getAddressId() {
        return addressId;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
