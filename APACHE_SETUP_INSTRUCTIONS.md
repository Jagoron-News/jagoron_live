# Apache Configuration for jagoron.live (Node.js)

## Problem
The domain `jagoron.live` is currently configured to serve Django, but it should serve your Node.js application.

## Solution Steps

### Step 1: Find Your Current Apache Configuration

```bash
# Find the virtual host configuration file
sudo find /etc/apache2 -name "*jagoron*" -o -name "*jagoronnews*"

# Or check sites-available directory
sudo ls -la /etc/apache2/sites-available/

# Or check sites-enabled directory  
sudo ls -la /etc/apache2/sites-enabled/
```

### Step 2: Backup Current Configuration

```bash
# Backup the existing config (replace with actual filename)
sudo cp /etc/apache2/sites-available/jagoron.live.conf /etc/apache2/sites-available/jagoron.live.conf.backup
```

### Step 3: Update the Virtual Host Configuration

Edit the Apache virtual host file for `jagoron.live`. The file is likely at:
- `/etc/apache2/sites-available/jagoron.live.conf`
- `/etc/apache2/sites-available/jagoron.live-ssl.conf`

**IMPORTANT**: The configuration should:
1. Point `DocumentRoot` to `/home/asif/Asif/jagoron_live`
2. Enable Passenger for Node.js (not Django/WSGI)
3. Remove any Django/WSGI configurations

### Step 4: Update .htaccess (if needed)

The `.htaccess` file in your project directory should have the correct paths. Update it if the paths are wrong.

### Step 5: Enable Required Apache Modules

```bash
# Enable Passenger module
sudo a2enmod passenger

# Enable required modules
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod ssl  # if using HTTPS
```

### Step 6: Test and Restart Apache

```bash
# Test Apache configuration
sudo apache2ctl configtest

# If test passes, restart Apache
sudo systemctl restart apache2
# OR
sudo service apache2 restart
```

### Step 7: Verify Node.js App is Running

Make sure your Node.js application is running. You can:
- Use PM2: `pm2 start index.js --name jagoron-live`
- Use Passenger (automatic if configured correctly)
- Or run directly: `node index.js`

### Step 8: Test the Endpoints

After restarting, test:
- `https://jagoron.live/test` - Should return JSON from Node.js
- `https://jagoron.live/url/allData` - Should return your data
- `https://jagoron.live/` - Should redirect to jagoronnews.com

## Alternative: Using Reverse Proxy (if Passenger doesn't work)

If Passenger configuration is complex, you can run Node.js on a port (e.g., 8000) and proxy to it:

```apache
<VirtualHost *:80>
    ServerName jagoron.live
    
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Proxy all requests to Node.js
    ProxyPass / http://localhost:8000/
    ProxyPassReverse / http://localhost:8000/
    
    # Or proxy only /url paths to Node.js, rest to Django
    # ProxyPass /url http://localhost:8000/url
    # ProxyPassReverse /url http://localhost:8000/url
</VirtualHost>
```

Then enable proxy modules:
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
```

## Troubleshooting

1. **Check Apache error logs:**
   ```bash
   sudo tail -f /var/log/apache2/error.log
   sudo tail -f /var/log/apache2/jagoron.live-error.log
   ```

2. **Check if Passenger is working:**
   ```bash
   passenger-status
   passenger-memory-stats
   ```

3. **Check Node.js app logs:**
   - If using PM2: `pm2 logs jagoron-live`
   - Check application logs in your project directory

4. **Verify the domain points to the right directory:**
   ```bash
   # Check what DocumentRoot is actually being used
   apache2ctl -S | grep jagoron
   ```

## Key Points

- **jagoron.live** should serve Node.js (this project)
- **jagoronnews.com** should serve Django
- Make sure the Apache virtual host for `jagoron.live` is NOT configured for Django/WSGI
- The `.htaccess` file should have correct paths matching your actual directory structure

