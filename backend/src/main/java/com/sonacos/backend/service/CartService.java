package com.sonacos.backend.service;

import com.sonacos.backend.dto.cart.AddCartItemRequest;
import com.sonacos.backend.dto.cart.CartResponse;
import com.sonacos.backend.dto.cart.UpdateCartItemRequest;

public interface CartService {
    CartResponse getMyCart();
    CartResponse addItem(AddCartItemRequest request);
    CartResponse updateItem(Long itemId, UpdateCartItemRequest request);
    CartResponse removeItem(Long itemId);
    void clearCart();
}
