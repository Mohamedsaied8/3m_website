# Deploying 3M Fashion to a Linux server

This guide assumes Ubuntu or Debian on a VPS. The store runs as a **systemd service**, so it starts on boot and restarts if it crashes.
**nginx** sits in front of it and handles your domain and HTTPS.

```
visitor ──HTTPS──▶ nginx (:80/:443) ──▶ node server.js (127.0.0.1:3000, service "3m-fashion")
```

## 1. Install Node.js and nginx (once)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
node -v        # must be v18 or newer
```

> Install Node system-wide like this. A Node installed with `nvm` lives in your home folder, and the service can't see it.

## 2. Copy the project to the server

From your own computer (any folder on the server works, e.g. your home folder):

```bash
rsync -av --exclude data/orders.json --exclude public/uploads ./ user@SERVER:~/3m_website/
```

Or `git clone` it there. `data/orders.json` and uploads are git-ignored anyway.

## 3. Install the service

```bash
cd ~/3m_website
sudo ./deploy/install.sh
```

This script:

- creates a system user `mfashion`
- copies the app to `/opt/3m-fashion`
- installs and starts the `3m-fashion` service

Check that it's running:

```bash
curl -I http://127.0.0.1:3000
```

## 4. Domain and HTTPS

1. Point your domain's DNS **A record** at the server's IP.
2. Install the nginx config:

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/3m-fashion
sudo nano /etc/nginx/sites-available/3m-fashion        # replace example.com with your domain
sudo ln -s /etc/nginx/sites-available/3m-fashion /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

3. Get a free HTTPS certificate:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

4. Now that HTTPS works, make the admin cookie HTTPS-only. In `/etc/systemd/system/3m-fashion.service`, set `Environment=COOKIE_SECURE=1`, then run:

```bash
sudo systemctl daemon-reload && sudo systemctl restart 3m-fashion
```

5. If a firewall is on, open the web ports: `sudo ufw allow 'Nginx Full'`.

**Then immediately:** open `https://your-domain/admin`, log in with `3m-admin`, and **change the password** in Admin ▸ Settings. Set the WhatsApp number there too.

## Everyday commands

| What | Command |
|---|---|
| Status | `sudo systemctl status 3m-fashion` |
| Live logs | `sudo journalctl -u 3m-fashion -f` |
| Restart | `sudo systemctl restart 3m-fashion` |
| Stop / start | `sudo systemctl stop 3m-fashion` / `start` |

## Updating the site

Copy the new files to the server (step 2) and run `sudo ./deploy/install.sh` again.
The update **does not overwrite** anything in `/opt/3m-fashion/data/` (products, settings, orders) or `/opt/3m-fashion/public/uploads/`.
Products and settings on the live site are changed through Admin.

## Backups

All of the shop's live data is in two folders. Back them up regularly, e.g. with a daily cron job:

```bash
sudo tar czf ~/3m-backup-$(date +%F).tgz -C /opt/3m-fashion data public/uploads
```

`data/orders.json` holds customers' names, phones and addresses. Keep backups private.

## Settings in the service file

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | Port Node listens on. If you change it, change `proxy_pass` in nginx too. |
| `HOST` | `127.0.0.1` | Only nginx can reach Node directly. Remove it to listen on all interfaces. |
| `TRUST_PROXY` | `1` | Reads the visitor's IP from nginx, so the login limit (5 wrong tries / 5 min) applies per visitor. Only use it behind nginx. |
| `COOKIE_SECURE` | `0` | Set to `1` after HTTPS works. |

> Admin logins are kept in memory, so you have to log in again after every restart or update.
