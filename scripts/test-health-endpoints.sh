#!/bin/bash
# Test script for Phase 17.5 - Health Endpoint Validation (T071M-q)
# Tests all service health endpoints return 200 OK

set -e

echo "=== Phase 17.5: Health Endpoint Validation ==="
echo ""

# Get Minikube IP
MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "localhost")
echo "Using Minikube IP: $MINIKUBE_IP"
echo ""

# Service endpoints (adjust ports based on your deployment)
BACKEND_URL="http://$MINIKUBE_IP:30081"
NOTIFICATION_URL="http://$MINIKUBE_IP:30082"
RECURRING_URL="http://$MINIKUBE_IP:30083"
AUDIT_URL="http://$MINIKUBE_IP:30084"

# Test function
test_health() {
    local service=$1
    local url=$2

    echo "Testing $service health endpoint..."
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url/health" 2>/dev/null || echo "000")

    if [ "$response" = "200" ]; then
        echo "✅ $service: PASS (HTTP $response)"
        return 0
    else
        echo "❌ $service: FAIL (HTTP $response)"
        return 1
    fi
}

# Run tests
failed=0

test_health "Backend" "$BACKEND_URL" || ((failed++))
test_health "Notification Service" "$NOTIFICATION_URL" || ((failed++))
test_health "Recurring Task Service" "$RECURRING_URL" || ((failed++))
test_health "Audit Service" "$AUDIT_URL" || ((failed++))

echo ""
echo "=== Test Summary ==="
if [ $failed -eq 0 ]; then
    echo "✅ All health endpoints passed (4/4)"
    echo "Task T071M-q: COMPLETE"
    exit 0
else
    echo "❌ $failed health endpoint(s) failed"
    echo "Task T071M-q: INCOMPLETE"
    exit 1
fi
