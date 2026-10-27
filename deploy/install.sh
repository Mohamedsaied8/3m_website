#!/usr/bin/env bash
# Install or update the 3M Fashion store as a systemd service.
# Run from the project folder on the server:   sudo ./deploy/install.sh
# Safe to run again for updates: it never overwrites data/ or public/uploads/ on the server.
set -euo pipefail

APP_DIR=/opt/3m-fashion
APP_USER=mfashion
SRC="$(cd "$(dirname "$0")/.." && pwd)"

[ "$(id -u)" -eq 0 ] || { echo "Run with sudo."; exit 1; }
command -v node >/dev/null || { echo "Node.js is not installed (need v18 or newer)."; exit 1; }
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 18 ] || { echo "Node.js $NODE_MAJOR is too old (need v18 or newer)."; exit 1; }

id "$APP_USER" >/dev/null 2>&1 || useradd --system --home-dir "$APP_DIR" --shell /usr/sbin/nologin "$APP_USER"
mkdir -p "$APP_DIR/data" "$APP_DIR/public/uploads"

if [ "$SRC" != "$APP_DIR" ]; then
  # Code and photos: always refreshed.
  cp -r "$SRC/server.js" "$SRC/assets" "$APP_DIR/"
  cp -r "$SRC/public/." "$APP_DIR/public/"
  # Data: only copied the first time, so live orders, products and settings are kept.
  for f in "$SRC"/data/*.json; do
    [ -e "$f" ] || continue
    name=$(basename "$f")
    [ "$name" = orders.json ] && continue          # never ship local test orders
    [ -e "$APP_DIR/data/$name" ] || cp "$f" "$APP_DIR/data/$name"
  done
fi

chown -R "$APP_USER:$APP_USER" "$APP_DIR"
chmod 750 "$APP_DIR/data"

cp "$SRC/deploy/3m-fashion.service" /etc/systemd/system/3m-fashion.service
systemctl daemon-reload
systemctl enable 3m-fashion >/dev/null
systemctl restart 3m-fashion
sleep 1
systemctl --no-pager --lines=5 status 3m-fashion || true
echo
echo "Done. The store is listening on 127.0.0.1:3000. Next: set up nginx (deploy/README.md)."
