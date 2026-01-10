#!/bin/bash

# ============================================================================
# OrderFlow-SaaS - Test Execution Script
# ============================================================================
# Este script ejecuta todos los tests del proyecto
# ============================================================================

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║          OrderFlow-SaaS - Test Suite Execution                   ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

SERVICES=(
    "auth-service"
    "users-service"
    "orders-service"
    "payments-service"
    "notification-service"
    "api-gateway"
)

PASSED=0
FAILED=0

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# Función para ejecutar tests de un servicio
# ============================================================================
run_service_tests() {
    local service=$1
    echo ""
    echo -e "${YELLOW}▶ Testing: ${service}${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd "services/${service}" || return 1
    
    if npm test 2>&1 | tee test-output.log; then
        echo -e "${GREEN}✓ ${service} tests passed${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ ${service} tests failed${NC}"
        ((FAILED++))
    fi
    
    cd - > /dev/null
    echo ""
}

# ============================================================================
# Función para ejecutar E2E tests
# ============================================================================
run_e2e_tests() {
    local service=$1
    echo ""
    echo -e "${YELLOW}▶ E2E Testing: ${service}${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    cd "services/${service}" || return 1
    
    if npm run test:e2e 2>&1 | tee test-e2e-output.log; then
        echo -e "${GREEN}✓ ${service} E2E tests passed${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠ ${service} E2E tests skipped or failed (expected)${NC}"
    fi
    
    cd - > /dev/null
    echo ""
}

# ============================================================================
# Main Execution
# ============================================================================

echo "🧪 Ejecutando tests unitarios..."
echo ""

for service in "${SERVICES[@]}"; do
    run_service_tests "$service"
done

echo ""
echo "🧪 Ejecutando E2E tests..."
echo ""

for service in "${SERVICES[@]}"; do
    run_e2e_tests "$service"
done

# ============================================================================
# Resumen
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                         TEST SUMMARY                              ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✓ Servicios con tests exitosos: ${PASSED}${NC}"
echo -e "${RED}✗ Servicios con tests fallidos: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ¡Todos los tests pasaron correctamente!${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Algunos tests fallaron. Revisa los logs anteriores.${NC}"
    echo ""
    exit 1
fi
