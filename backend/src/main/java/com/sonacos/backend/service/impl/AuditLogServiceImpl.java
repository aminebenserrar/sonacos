package com.sonacos.backend.service.impl;

import com.sonacos.backend.dto.audit.AuditDashboardResponse;
import com.sonacos.backend.dto.audit.AuditLogResponse;
import com.sonacos.backend.dto.audit.AuditModuleCountResponse;
import com.sonacos.backend.dto.common.PageResponse;
import com.sonacos.backend.entity.OperationHistory;
import com.sonacos.backend.entity.Role;
import com.sonacos.backend.entity.User;
import com.sonacos.backend.enums.RoleCode;
import com.sonacos.backend.exception.ResourceNotFoundException;
import com.sonacos.backend.repository.OperationHistoryRepository;
import com.sonacos.backend.service.AuditLogService;
import com.sonacos.backend.service.CurrentUserService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final OperationHistoryRepository operationHistoryRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public void log(String actionType, String objectType, String objectIdentifier, String description) {
        log(actionType, objectType, objectIdentifier, description, null, null);
    }

    @Override
    @Transactional
    public void log(
            String actionType,
            String objectType,
            String objectIdentifier,
            String description,
            String oldValue,
            String newValue
    ) {
        User currentUser = currentUserService.getCurrentUser();
        operationHistoryRepository.save(OperationHistory.builder()
                .actionType(actionType)
                .objectType(objectType)
                .objectIdentifier(objectIdentifier)
                .description(description)
                .user(currentUser)
                .createdAt(LocalDateTime.now())
                .oldValue(oldValue)
                .newValue(newValue)
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getLogs(
            int page,
            int size,
            String query,
            String user,
            String role,
            String actionType,
            String module,
            String level,
            String date
    ) {
        Specification<OperationHistory> specification = (root, cq, cb) -> cb.conjunction();

        if (query != null && !query.isBlank()) {
            String normalizedQuery = "%" + query.trim().toLowerCase(Locale.ROOT) + "%";
            specification = specification.and((root, cq, cb) -> {
                Join<OperationHistory, User> userJoin = root.join("user", JoinType.LEFT);
                return cb.or(
                        cb.like(cb.lower(root.get("actionType")), normalizedQuery),
                        cb.like(cb.lower(root.get("objectType")), normalizedQuery),
                        cb.like(cb.lower(root.get("objectIdentifier")), normalizedQuery),
                        cb.like(cb.lower(root.get("description")), normalizedQuery),
                        cb.like(cb.lower(userJoin.get("firstName")), normalizedQuery),
                        cb.like(cb.lower(userJoin.get("lastName")), normalizedQuery),
                        cb.like(cb.lower(userJoin.get("email")), normalizedQuery)
                );
            });
        }

        if (user != null && !user.isBlank()) {
            String normalizedUser = "%" + user.trim().toLowerCase(Locale.ROOT) + "%";
            specification = specification.and((root, cq, cb) -> {
                Join<OperationHistory, User> userJoin = root.join("user", JoinType.LEFT);
                return cb.or(
                        cb.like(cb.lower(userJoin.get("firstName")), normalizedUser),
                        cb.like(cb.lower(userJoin.get("lastName")), normalizedUser),
                        cb.like(cb.lower(userJoin.get("email")), normalizedUser)
                );
            });
        }

        if (role != null && !role.isBlank()) {
            try {
                RoleCode roleCode = RoleCode.valueOf(role.trim());
                specification = specification.and((root, cq, cb) -> {
                    cq.distinct(true);
                    Join<OperationHistory, User> userJoin = root.join("user", JoinType.LEFT);
                    Join<User, Role> roleJoin = userJoin.join("roles", JoinType.LEFT);
                    return cb.equal(roleJoin.get("code"), roleCode);
                });
            } catch (IllegalArgumentException ignored) {
                // Ignore unknown role filters.
            }
        }

        if (actionType != null && !actionType.isBlank()) {
            specification = specification.and((root, cq, cb) ->
                    cb.equal(root.get("actionType"), actionType.trim()));
        }

        if (module != null && !module.isBlank()) {
            specification = specification.and((root, cq, cb) ->
                    cb.equal(root.get("objectType"), module.trim()));
        }

        if (level != null && !level.isBlank()) {
            Set<String> actionTypes = getActionTypesForLevel(level);
            if (!actionTypes.isEmpty()) {
                specification = specification.and((root, cq, cb) ->
                        root.get("actionType").in(actionTypes));
            }
        }

        if (date != null && !date.isBlank()) {
            try {
                LocalDate selectedDate = LocalDate.parse(date.trim());
                LocalDateTime from = selectedDate.atStartOfDay();
                LocalDateTime to = selectedDate.plusDays(1).atStartOfDay();
                specification = specification.and((root, cq, cb) ->
                        cb.and(
                                cb.greaterThanOrEqualTo(root.get("createdAt"), from),
                                cb.lessThan(root.get("createdAt"), to)
                        ));
            } catch (DateTimeParseException ignored) {
                // Ignore invalid date filter and keep default results.
            }
        }

        Page<OperationHistory> result = operationHistoryRepository.findAll(
                specification,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return new PageResponse<>(
                result.getContent().stream().map(this::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isFirst(),
                result.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AuditLogResponse getLogById(Long logId) {
        OperationHistory history = operationHistoryRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Operation introuvable"));

        return toResponse(history);
    }

    @Override
    @Transactional(readOnly = true)
    public AuditDashboardResponse getDashboard() {
        List<OperationHistory> operations = operationHistoryRepository.findAll(
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        LocalDate today = LocalDate.now();
        List<OperationHistory> todayOperations = operations.stream()
                .filter(operation -> operation.getCreatedAt() != null
                        && operation.getCreatedAt().toLocalDate().isEqual(today))
                .toList();

        long sensitiveOperationsToday = todayOperations.stream()
                .filter(operation -> "SENSIBLE".equals(determineLevel(operation.getActionType())))
                .count();

        long anomaliesToday = todayOperations.stream()
                .filter(operation -> {
                    String actionType = operation.getActionType() == null
                            ? ""
                            : operation.getActionType().toUpperCase(Locale.ROOT);
                    return actionType.contains("REFUSE")
                            || actionType.contains("DEACTIVATE")
                            || actionType.contains("DELETE");
                })
                .count();

        long activeUsersToday = todayOperations.stream()
                .map(OperationHistory::getUser)
                .filter(user -> user != null)
                .map(User::getId)
                .distinct()
                .count();

        List<AuditModuleCountResponse> moduleBreakdown = operations.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        operation -> operation.getObjectType() == null ? "AUTRE" : operation.getObjectType(),
                        java.util.stream.Collectors.counting()
                ))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(entry -> new AuditModuleCountResponse(entry.getKey(), entry.getValue()))
                .toList();

        return new AuditDashboardResponse(
                todayOperations.size(),
                sensitiveOperationsToday,
                anomaliesToday,
                activeUsersToday,
                operations.stream().limit(8).map(this::toResponse).toList(),
                moduleBreakdown
        );
    }

    private AuditLogResponse toResponse(OperationHistory history) {
        String roleLabel = history.getUser() != null && !history.getUser().getRoles().isEmpty()
                ? history.getUser().getRoles().stream().map(Role::getCode).map(Enum::name).sorted().findFirst().orElse("INCONNU")
                : "INCONNU";

        return new AuditLogResponse(
                history.getId(),
                history.getActionType(),
                history.getObjectType(),
                history.getObjectIdentifier(),
                history.getDescription(),
                history.getUser() != null
                        ? history.getUser().getFirstName() + " " + history.getUser().getLastName()
                        : "Systeme",
                history.getUser() != null ? history.getUser().getEmail() : null,
                roleLabel,
                determineLevel(history.getActionType()),
                history.getCreatedAt(),
                history.getOldValue(),
                history.getNewValue()
        );
    }

    private Set<String> getActionTypesForLevel(String level) {
        return switch (level.trim().toUpperCase(Locale.ROOT)) {
            case "INFORMATION" -> Set.of(
                    "CREATE_ORDER",
                    "UPDATE_STOCK",
                    "UPDATE_PAYMENT_STATUS",
                    "UPDATE_PRODUCT",
                    "CREATE_PRODUCT",
                    "ARCHIVE_DOCUMENT"
            );
            case "IMPORTANT" -> Set.of(
                    "VALIDATE_OPERATION",
                    "REFUSE_OPERATION",
                    "ACTIVATE_USER",
                    "DEACTIVATE_USER"
            );
            case "SENSIBLE" -> Set.of(
                    "CREATE_USER",
                    "UPDATE_USER",
                    "UPDATE_USER_ROLES",
                    "CHANGE_PASSWORD"
            );
            default -> Set.of();
        };
    }

    private String determineLevel(String actionType) {
        if (actionType == null) {
            return "INFORMATION";
        }

        String normalized = actionType.toUpperCase(Locale.ROOT);

        if (Set.of("CREATE_USER", "UPDATE_USER", "UPDATE_USER_ROLES", "CHANGE_PASSWORD")
                .contains(normalized)) {
            return "SENSIBLE";
        }

        if (Set.of("VALIDATE_OPERATION", "REFUSE_OPERATION", "ACTIVATE_USER", "DEACTIVATE_USER")
                .contains(normalized)) {
            return "IMPORTANT";
        }

        return "INFORMATION";
    }
}
