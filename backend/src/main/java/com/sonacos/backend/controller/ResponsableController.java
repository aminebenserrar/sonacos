package com.sonacos.backend.controller;

import com.sonacos.backend.dto.validation.ValidationDecisionRequest;
import com.sonacos.backend.dto.validation.ValidationOperationResponse;
import com.sonacos.backend.service.ValidationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/responsable")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RESPONSABLE')")
@Tag(name = "Responsable")
public class ResponsableController {

    private final ValidationService validationService;

    @GetMapping("/validations")
    public List<ValidationOperationResponse> getValidations() {
        return validationService.getOperations();
    }

    @GetMapping("/validations/{operationId}")
    public ValidationOperationResponse getValidation(@PathVariable Long operationId) {
        return validationService.getOperationById(operationId);
    }

    @PatchMapping("/validations/{operationId}/decision")
    public ValidationOperationResponse decideOperation(
            @PathVariable Long operationId,
            @Valid @RequestBody ValidationDecisionRequest request
    ) {
        return validationService.decideOperation(operationId, request);
    }
}
