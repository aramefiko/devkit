# Install Let's Encrypt
```ini
sudo yum -y install yum-utils
sudo yum install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
sudo yum-config-manager --enable rhui-REGION-rhel-server-extras rhui-REGION-rhel-server-optional
sudo yum install certbot
```

# Create new SSL
```bash
sudo certbot certonly --webroot -w /var/www/example -d example.com
```

#Renew SSL
```bash
certbot renew
```
