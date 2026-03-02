#!/bin/bash
# Forward Stripe webhooks to local backend for development testing.
#
# Prerequisites:
#   1. Install Stripe CLI: brew install stripe/stripe-cli/stripe
#   2. Login: stripe login
#
# The CLI outputs a webhook signing secret (whsec_...).
# Set it as STRIPE_WEBHOOK_SECRET in backend/.env for local testing.
#
# Usage:
#   ./scripts/stripe-listen.sh
#   # or via npm:
#   npm run stripe:listen

set -euo pipefail

echo "Starting Stripe webhook forwarding to localhost:8001..."
echo ""
echo "NOTE: Copy the 'whsec_...' secret printed below and set it as"
echo "STRIPE_WEBHOOK_SECRET in your backend/.env file."
echo ""

stripe listen \
  --forward-to localhost:8001/api/webhooks/stripe \
  --events checkout.session.completed,payment_intent.succeeded,customer.created
