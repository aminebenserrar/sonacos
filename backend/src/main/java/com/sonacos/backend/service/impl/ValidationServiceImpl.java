package com.sonacos.backend.service.impl;

import com.sonacos.backend.dto.validation.ValidationDecisionRequest;
import com.sonacos.backend.dto.validation.ValidationOperationResponse;
import com.sonacos.backend.entity.Role;
import com.sonacos.backend.entity.ValidationOperation;
import com.sonacos.backend.enums.RoleCode;
import com.sonacos.backend.enums.ValidationStatus;
import com.sonacos.backend.exception.BusinessException;
import com.sonacos.backend.exception.ResourceNotFoundException;
import com.sonacos.backend.repository.ValidationOperationRepository;
import com.sonacos.backend.service.AuditLogService;
import com.sonacos.backend.service.CurrentUserService;
import com.sonacos.backend.service.ValidationService;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ValidationServiceImpl implements ValidationService {

    private final ValidationOperationRepository validationOperationRepository;
    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public List<ValidationOperationResponse> getOperations() {
        return validationOperationRepository.findAll(Sort.by(Sort.Direction.DESC, "requestedAt")).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ValidationOperationResponse getOperationById(Long operationId) {
        ValidationOperation operation = validationOperationRepository.findById(operationId)
                .orElseThrow(() -> new ResourceNotFoundException("Operation introuvable"));

        return toResponse(operation);
    }

    @Override
    @Transactional
    public ValidationOperationResponse decideOperation(Long operationId, ValidationDecisionRequest request) {
        ValidationOperation operation = validationOperationRepository.findById(operationId)
                .orElseThrow(() -> new ResourceNotFoundException("Operation introuvable"));

        if (operation.getStatus() != ValidationStatus.EN_ATTENTE) {
            throw new BusinessException("Cette operation a deja ete traitee");
        }

        if (request.status() == ValidationStatus.EN_ATTENTE) {
            throw new BusinessException("La decision doit etre VALIDEE ou REFUSEE");
        }

        if (request.status() == ValidationStatus.REFUSEE
                && (request.rejectionReason() == null || request.rejectionReason().isBlank())) {
            throw new BusinessException("Le motif du refus est obligatoire");
        }

        operation.setStatus(request.status());
        operation.setResponsible(currentUserService.getCurrentUser());
        operation.setRejectionReason(
                request.status() == ValidationStatus.REFUSEE
                        ? request.rejectionReason().trim()
                        : null
        );
        operation.setDecidedAt(LocalDateTime.now());

        ValidationOperation savedOperation = validationOperationRepository.save(operation);
        auditLogService.log(
                request.status() == ValidationStatus.VALIDEE ? "VALIDATE_OPERATION" : "REFUSE_OPERATION",
                "VALIDATION",
                savedOperation.getTargetReference(),
                "Decision prise sur une operation sensible",
                "EN_ATTENTE",
                savedOperation.getStatus().name()
        );

        return toResponse(savedOperation);
    }

    private ValidationOperationResponse toResponse(ValidationOperation operation) {
        String requesterRole = operation.getRequester() != null && !operation.getRequester().getRoles().isEmpty()
                ? operation.getRequester().getRoles().stream()
                .map(Role::getCode)
                .map(RoleCode::name)
                .sorted()
                .findFirst()
                .orElse("INCONNU")
                : "INCONNU";

        return new ValidationOperationResponse(
                operation.getId(),
                operation.getOperationType(),
                operation.getTargetReference(),
                operation.getDescription(),
                operation.getRequester() != null
                        ? operation.getRequester().getFirstName() + " " + operation.getRequester().getLastName()
                        : "Non renseigne",
                operation.getRequester() != null ? operation.getRequester().getEmail() : null,
                requesterRole,
                operation.getResponsible() != null
                        ? operation.getResponsible().getFirstName() + " " + operation.getResponsible().getLastName()
                        : "En attente",
                operation.getStatus(),
                operation.getPriority(),
                operation.getRejectionReason(),
                operation.getRequestedAt(),
                operation.getDecidedAt()
        );
    }
}
