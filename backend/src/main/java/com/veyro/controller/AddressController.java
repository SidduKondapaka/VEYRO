package com.veyro.controller;

import com.veyro.dto.*;
import com.veyro.security.UserPrincipal;
import com.veyro.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/me/addresses")
@Tag(name = "Customer Addresses", description = "Endpoints for delivery address management")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    @Operation(summary = "List all delivery addresses of authenticated user")
    public ResponseEntity<List<AddressDto>> getAddresses(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<AddressDto> addresses = addressService.getUserAddresses(userPrincipal.getId());
        return ResponseEntity.ok(addresses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get specific address by ID")
    public ResponseEntity<AddressDto> getAddressById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        AddressDto address = addressService.getAddressById(id, userPrincipal.getId());
        return ResponseEntity.ok(address);
    }

    @PostMapping
    @Operation(summary = "Add a new delivery address")
    public ResponseEntity<AddressDto> addAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody AddressRequest request) {
        AddressDto created = addressService.addAddress(userPrincipal.getId(), request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing delivery address")
    public ResponseEntity<AddressDto> updateAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        AddressDto updated = addressService.updateAddress(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a delivery address")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        addressService.deleteAddress(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully"));
    }

    @PatchMapping("/{id}/default")
    @Operation(summary = "Set address as default delivery address")
    public ResponseEntity<AddressDto> setDefaultAddress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        AddressDto updated = addressService.setDefaultAddress(id, userPrincipal.getId());
        return ResponseEntity.ok(updated);
    }
}
