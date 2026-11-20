package com.sonacos.backend.mapper;

import com.sonacos.backend.dto.cart.CartItemResponse;
import com.sonacos.backend.dto.cart.CartResponse;
import com.sonacos.backend.entity.Cart;
import com.sonacos.backend.entity.CartItem;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class CartMapper {

    public CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(this::toItemResponse)
                .toList();

        BigDecimal total = items.stream()
                .map(CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int itemsCount = items.stream()
                .mapToInt(CartItemResponse::quantity)
                .sum();

        return new CartResponse(
                cart.getId(),
                cart.getClient().getId(),
                itemsCount,
                total,
                items
        );
    }

    private CartItemResponse toItemResponse(CartItem item) {
        BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

        return new CartItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getSlug(),
                item.getProduct().getName(),
                item.getProduct().getReference(),
                item.getProduct().getCategory().getName(),
                item.getProduct().getUnit(),
                item.getProduct().getImageUrl(),
                item.getQuantity(),
                item.getProduct().getStockQuantity(),
                item.getUnitPrice(),
                subtotal
        );
    }
}
