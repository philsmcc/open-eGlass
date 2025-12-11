#!/bin/bash
# This script is executed after a successful certificate renewal

# Reload Nginx to use the new certificate
systemctl reload nginx

# Log the renewal
echo "$(date): Certificate renewed and Nginx reloaded" >> /var/log/certbot-renewal.log