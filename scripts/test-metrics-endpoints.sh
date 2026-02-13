#!/bin/bash
# Test script for Phase 17.5 - Metrics Endpoint Validation (T071M-r)
# Tests all service metrics endpoints expose Prometheus format

set -e

echo "=== Phase 17.5: Metrics Endpoint Validation ==="
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
test_metrics() {
    local service=$1
    local url=$2

    echo "Testing $service metrics endpoint..."

    # Fetch metrics
    response=$(curl -s "$url/metrics" 2>/dev/null || echo "ERROR")
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url/metrics" 2>/dev/null || echo "000")

    if [ "$http_code" = "200" ]; then
        # Check for Prometheus format indicators
        if echo "$response" | grep -q "# HELP" && echo "$response" | grep -q "# TYPE"; then
            echo "✅ $service: PASS (HTTP $http_code, Prometheus format detected)"
            echo "   Sample metrics:"
            echo "$response" | grep "^[a-z_]" | head -3 | sed 's/^/   /'
            return 0
        else
            echo "❌ $service: FAIL (HTTP $http_code, but not Prometheus format)"
            return 1
        fi
    else
        echo "❌ $service: FAIL (HTTP $http_code)"
        return 1
    fi
}

# Run tests
failed=0

test_metrics "Backend" "$BACKEND_URL" || ((failed++))
echo ""
test_metrics "Notification Service" "$NOTIFICATION_URL" || ((failed++))
echo ""
test_metrics "Recurring Task Service" "$RECURRING_URL" || ((failed++))
echo ""
test_metrics "Audit Service" "$AUDIT_URL" || ((failed++))

echo ""
echo "=== Test Summary ==="
if [ $failed -eq 0 ]; then
    echo "✅ All metrics endpoints passed (4/4)"
    echo "Task T071M-r: COMPLETE"
    exit 0
else
    echo "❌ $failed metrics endpoint(s) failed"
    echo "Task T071M-r: INCOMPLETE"
    exit 1
fi
