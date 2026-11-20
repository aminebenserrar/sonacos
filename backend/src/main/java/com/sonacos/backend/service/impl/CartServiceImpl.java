package com.sonacos.backend.service.impl;

import com.sonacos.backend.dto.cart.AddCartItemRequest;
import com.sonacos.backend.dto.cart.CartResponse;
import com.sonacos.backend.dto.cart.UpdateCartItemRequest;
import com.sonacos.backend.entity.Cart;
import com.sonacos.backend.entity.CartItem;
import com.sonacos.backend.entity.Product;
import com.sonacos.backend.entity.User;
import com.sonacos.backend.exception.BusinessException;
import com.sonacos.backend.exception.ResourceNotFoundException;
import com.sonacos.backend.mapper.CartMapper;
import com.sonacos.backend.repository.CartRepository;
import com.sonacos.backend.repository.ProductRepository;
import com.sonacos.backend.service.CartService;
import com.sonacos.backend.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CurrentUserService currentUserService;
    private final CartMapper cartMapper;

    @Override
    @Transactional
    public CartResponse getMyCart() {
        Cart cart = getOrCreateCart(currentUserService.getCurrentUser());
        return cartMapper.toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItem(AddCartItemRequest request) {
        User client = currentUserService.getCurrentUser();
        Cart cart = getOrCreateCart(client);
        Product product = getActiveProduct(request.productId());

        validateRequestedQuantity(product, request.quantity());

        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + request.quantity();
            validateRequestedQuantity(product, newQuantity);
            existingItem.setQuantity(newQuantity);
            existingItem.setUnitPrice(product.getPrice());
        } else {
            cart.getItems().add(CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.quantity())
                    .unitPrice(product.getPrice())
                    .build());
        }

        return cartMapper.toResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartResponse updateItem(Long itemId, UpdateCartItemRequest request) {
        User client = currentUserService.getCurrentUser();
        Cart cart = getOrCreateCart(client);
        CartItem item = findCartItem(cart, itemId);

        validateRequestedQuantity(item.getProduct(), request.quantity());
        item.setQuantity(request.quantity());
        item.setUnitPrice(item.getProduct().getPrice());

        return cartMapper.toResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long itemId) {
        User client = currentUserService.getCurrentUser();
        Cart cart = getOrCreateCart(client);
        CartItem item = findCartItem(cart, itemId);
        cart.getItems().remove(item);

        return cartMapper.toResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public void clearCart() {
        Cart cart = getOrCreateCart(currentUserService.getCurrentUser());
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    Cart getOrCreateCart(User client) {
        return cartRepository.findByClient(client)
                .orElseGet(() -> cartRepository.save(Cart.builder().client(client).build()));
    }

    private Product getActiveProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));

        if (!product.isActive()) {
            throw new BusinessException("Le produit selectionne n est pas disponible");
        }

        return product;
    }

    private CartItem findCartItem(Cart cart, Long itemId) {
        return cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Article du panier introuvable"));
    }

    private void validateRequestedQuantity(Product product, int quantity) {
        if (quantity > product.getStockQuantity()) {
            throw new BusinessException("Stock insuffisant pour le produit " + product.getName());
        }
    }
}
