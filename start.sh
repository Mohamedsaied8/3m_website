#!/usr/bin/env bash
# 3M Fashion — start the store
cd "$(dirname "$0")"
echo "  Store : http://localhost:${PORT:-3000}"
echo "  Admin : http://localhost:${PORT:-3000}/admin"
PORT="${PORT:-3000}" exec node server.js
