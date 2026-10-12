package com.veyro.service;

import com.veyro.dto.AddressDto;
import com.veyro.dto.AddressRequest;
import com.veyro.entity.Address;
import com.veyro.entity.User;
import com.veyro.exception.ResourceNotFoundException;
import com.veyro.repository.AddressRepository;
import com.veyro.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository, UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AddressDto> getUserAddresses(Long userId) {
        return addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AddressDto getAddressById(Long addressId, Long userId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or does not belong to you"));
        return mapToDto(address);
    }

    @Transactional
    public AddressDto addAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Address> existing = addressRepository.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(userId);
        boolean isFirst = existing.isEmpty();

        Address address = new Address();
        address.setUser(user);
        address.setRecipientName(request.getRecipientName().trim());
        address.setPhone(request.getPhone().trim());
        address.setStreetAddress(request.getStreetAddress().trim());
        address.setApartment(request.getApartment());
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setPostalCode(request.getPostalCode().trim());
        address.setCountry(request.getCountry() != null ? request.getCountry().trim() : "India");

        // If marked default or first address, unset others
        if (request.isDefaultAddress() || isFirst) {
            unsetDefaultAddresses(userId);
            address.setDefaultAddress(true);
        } else {
            address.setDefaultAddress(false);
        }

        Address saved = addressRepository.save(address);
        return mapToDto(saved);
    }

    @Transactional
    public AddressDto updateAddress(Long addressId, Long userId, AddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or unauthorized"));

        address.setRecipientName(request.getRecipientName().trim());
        address.setPhone(request.getPhone().trim());
        address.setStreetAddress(request.getStreetAddress().trim());
        address.setApartment(request.getApartment());
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setPostalCode(request.getPostalCode().trim());
        address.setCountry(request.getCountry() != null ? request.getCountry().trim() : "India");

        if (request.isDefaultAddress()) {
            unsetDefaultAddresses(userId);
            address.setDefaultAddress(true);
        }

        Address updated = addressRepository.save(address);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteAddress(Long addressId, Long userId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or unauthorized"));
        addressRepository.delete(address);
    }

    @Transactional
    public AddressDto setDefaultAddress(Long addressId, Long userId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or unauthorized"));

        unsetDefaultAddresses(userId);
        address.setDefaultAddress(true);
        Address saved = addressRepository.save(address);
        return mapToDto(saved);
    }

    private void unsetDefaultAddresses(Long userId) {
        addressRepository.findByUserIdAndDefaultAddressTrue(userId).ifPresent(addr -> {
            addr.setDefaultAddress(false);
            addressRepository.save(addr);
        });
    }

    public AddressDto mapToDto(Address address) {
        return new AddressDto(
                address.getId(),
                address.getRecipientName(),
                address.getPhone(),
                address.getStreetAddress(),
                address.getApartment(),
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getCountry(),
                address.isDefaultAddress()
        );
    }
}
