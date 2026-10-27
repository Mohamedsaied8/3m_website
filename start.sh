#!/usr/bin/env bash
# 3M Fashion: run and manage the store.
#
#   ./start.sh            run in this terminal (Ctrl+C stops it)
#   ./start.sh start      run in the background (keeps running after you close the terminal)
#   ./start.sh stop       stop the background server
#   ./start.sh restart    stop, then start in the background
#   ./start.sh status     is it running?
#   ./start.sh logs       follow the background server's log (Ctrl+C to quit)
#   ./start.sh install    install as a system service on a Linux server (uses sudo; see deploy/README.md)
#
# Other port:  PORT=8080 ./start.sh start
set -uo pipefail
cd "$(dirname "$0")"

PORT="${PORT:-3000}"
RUN_DIR=".run"
PID_FILE="$RUN_DIR/server.pid"
LOG_FILE="$RUN_DIR/server.log"
URL="http://localhost:$PORT"

say()  { printf '  %s\n' "$*"; }
fail() { printf '  ✗ %s\n' "$*" >&2; exit 1; }

check_node() {
  command -v node >/dev/null 2>&1 || fail "Node.js is not installed. Get it from https://nodejs.org (v18 or newer)."
  local major; major=$(node -p 'process.versions.node.split(".")[0]')
  [ "$major" -ge 18 ] || fail "Node.js v$major is too old. Install v18 or newer."
}

running_pid() {
  [ -f "$PID_FILE" ] || return 1
  local pid; pid=$(cat "$PID_FILE" 2>/dev/null)
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then echo "$pid"; return 0; fi
  rm -f "$PID_FILE"; return 1
}

port_busy() {
  node -e "const s=require('net').createServer().once('error',()=>process.exit(0)).once('listening',()=>s.close(()=>process.exit(1))).listen($PORT)"
}

wait_until_up() {   # up to ~10 s
  for _ in $(seq 1 20); do
    node -e "fetch('$URL/api/settings').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null && return 0
    sleep 0.5
  done
  return 1
}

banner() {
  say "Store : $URL"
  say "Admin : $URL/admin"
}

cmd_foreground() {
  check_node
  if pid=$(running_pid); then fail "Already running in the background (pid $pid). Use: ./start.sh stop"; fi
  port_busy && fail "Port $PORT is already in use. Try: PORT=8080 ./start.sh"
  banner
  PORT="$PORT" exec node server.js
}

cmd_start() {
  check_node
  if pid=$(running_pid); then say "Already running (pid $pid)."; banner; return 0; fi
  port_busy && fail "Port $PORT is already in use by another program. Try: PORT=8080 ./start.sh start"
  mkdir -p "$RUN_DIR"
  PORT="$PORT" nohup node server.js >>"$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"
  if wait_until_up; then
    say "✓ Started (pid $(cat "$PID_FILE"))."
    banner
    say "Log   : $LOG_FILE   (./start.sh logs)"
  else
    say "✗ The server did not come up. Last log lines:"
    tail -n 15 "$LOG_FILE" | sed 's/^/    /'
    cmd_stop >/dev/null
    exit 1
  fi
}

cmd_stop() {
  local pid
  if ! pid=$(running_pid); then say "Not running."; return 0; fi
  kill "$pid" 2>/dev/null
  for _ in $(seq 1 20); do kill -0 "$pid" 2>/dev/null || break; sleep 0.25; done
  kill -0 "$pid" 2>/dev/null && kill -9 "$pid" 2>/dev/null
  rm -f "$PID_FILE"
  say "✓ Stopped."
}

cmd_status() {
  local pid
  if pid=$(running_pid); then
    say "✓ Running (pid $pid)."
    banner
  else
    say "Not running in the background."
    port_busy && say "(Something else is using port $PORT, maybe the store started another way.)"
    return 1
  fi
}

cmd_logs() {
  [ -f "$LOG_FILE" ] || fail "No log yet. Start the server with: ./start.sh start"
  tail -n 50 -f "$LOG_FILE"
}

cmd_install() {
  [ "$(uname -s)" = Linux ] || fail "The service install is for Linux servers only."
  command -v systemctl >/dev/null 2>&1 || fail "systemd not found on this machine."
  if pid=$(running_pid); then say "Stopping the background server first (the service will take over)."; cmd_stop; fi
  sudo ./deploy/install.sh
}

case "${1:-}" in
  "")        cmd_foreground ;;
  start)     cmd_start ;;
  stop)      cmd_stop ;;
  restart)   cmd_stop; cmd_start ;;
  status)    cmd_status ;;
  logs|log)  cmd_logs ;;
  install)   cmd_install ;;
  -h|--help|help) sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//' ;;
  *) fail "Unknown command '$1'. Use: start | stop | restart | status | logs | install" ;;
esac
