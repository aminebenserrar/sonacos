package com.sonacos.backend.service;

import com.sonacos.backend.dto.validation.ValidationDecisionRequest;
import com.sonacos.backend.dto.validation.ValidationOperationResponse;
import java.util.List;

public interface ValidationService {
    List<ValidationOperationResponse> getOperations();
    ValidationOperationResponse getOperationById(Long operationId);
    ValidationOperationResponse decideOperation(Long operationId, ValidationDecisionRequest request);
}
