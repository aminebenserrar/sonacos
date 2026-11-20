package com.sonacos.backend.controller;

import com.sonacos.backend.dto.cart.AddCartItemRequest;
import com.sonacos.backend.dto.cart.CartResponse;
import com.sonacos.backend.dto.cart.UpdateCartItemRequest;
import com.sonacos.backend.service.CartService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENT')")
@Tag(name = "Panier client")
public class CustomerCartController {

    private final CartService cartService;

    @GetMapping
    public CartResponse getCart() {
        return cartService.getMyCart();
    }

    @PostMapping("/items")
    public CartResponse addItem(@Valid @RequestBody AddCartItemRequest request) {
        return cartService.addItem(request);
    }

    @PutMapping("/items/{itemId}")
    public CartResponse updateItem(@PathVariable Long itemId, @Valid @RequestBody UpdateCartItemRequest request) {
        return cartService.updateItem(itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    public CartResponse removeItem(@PathVariable Long itemId) {
        return cartService.removeItem(itemId);
    }
}
