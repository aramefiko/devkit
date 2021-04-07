# Install LAMPP

```ini
yum update
yum -y install install curl net-tools
curl -o xampp-linux-installer.run "https://downloadsapachefriends.global.ssl.fastly.net/xampp-files/7.1.29/xampp-linux-x64-7.1.29-0-installer.run?from_af=true"
sudo chmod +x xampp-linux-installer.run
bash -c './xampp-linux-installer.run'
```

Khi gặp lỗi tiến trình cài đặt bị killed nữa chừng thì có thể lỗi là do phân vùng swap không đủ, thực hiện lẹnh sau để khắc phục. (copy trên internet chứ chưa tham khảo thông số của nó nghĩa là gì)

```ini
sudo dd if=/dev/zero of=swapfile bs=1024 count=2000000
sudo mkswap -f  swapfile
sudo swapon swapfile
```

# Mở port 80,443,3306

```ini
sudo iptables -I INPUT -p tcp -m tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp -m tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT -p tcp -m tcp --dport 3306 -j ACCEPT
```

# Thay đổi user và group cho user chạy lampp

mở file /opt/lampp/etc/httpd.conf tìm dòng sau và sửa lại thành user của server nếu cần thiết

```ini
User daemon
Group daemon
```
# Public phpmyadmin

Sửa nội dung file /opt/lampp/etc/extra/httpd-xampp.conf, thay đổi require từ local sang all granted 

nội dung ban đầu

```ini
<Directory "/opt/lampp/phpmyadmin">
    AllowOverride AuthConfig Limit
    Require local
    ErrorDocument 403 /error/XAMPP_FORBIDDEN.html.var
</Directory>
```

sửa thành

```ini
<Directory "/opt/lampp/phpmyadmin">
    AllowOverride AuthConfig Limit
    Require all granted
    ErrorDocument 403 /error/XAMPP_FORBIDDEN.html.var
</Directory>
```

# Sửa đổi file host /etc/hosts

Để cho phép truy cập từ ngoài vào server chạy xampp thì đầu tiên là cần trỏ tên miền về IP public của server, đến đây, server đã có thể truy cập từ bên ngoài vào rồi. Việc sửa đổi file hosts là 1 trong các việc phải làm nếu muốn server chạy nhiều domain, có thể tham khảo bài viết hướng dẫn tạo domain cho server chạy xampp.

```ini
127.0.0.1 localhost
127.0.0.1 khanhtoan.name.vn
```

# Config login cho phpmyadmin

Thay đổi auth_type thành http trong file /opt/lampp/phpmyadmin/config.inc.php và comment 2 dòng config username và password lại.

```php
$cfg['Servers'][$i]['auth_type'] = 'http';
```

# Thay đổi mật khẩu root mysql

```ini
mysql -u root -p
USE mysql;
UPDATE user SET password=PASSWORD('YourPasswordHere') WHERE User='root' AND Host = 'localhost';
FLUSH PRIVILEGES;
```

Đối với LAMPP thì mysql nằm ở đường dẫn /opt/lampp/bin/mysql, do đó cmd sẽ là:

```ini
/opt/lampp/bin/mysql -u="root"
```

# Thêm vhosts và apache

Sửa file bằng công cụ vim, chạy lệnh sau và ấn phim i để sửa, sửa xong bấm phím esc và gõ :wq sau đó enter để lưu file lại.

```ini
vi /opt/lampp/etc/httpd.conf
```

Thêm vào cuối file tên dòng lệnh sau:

```ini
Include "/opt/lampp/etc/extra/httpd-vhosts.conf"
```

# Cấu hình vhost

Mở file /opt/lampp/etc/extra/httpd-vhost.conf và add thêm domain vào, ví dụ thêm domain mautic.dotb.vn, có thư mục root chưa source là /opt/lampp/htdocs/mautic.dotb.vn


```ini
<VirtualHost 127.0.0.1:80>
     DocumentRoot "/opt/lampp/htdocs/mautic.dotb.vn"
     ServerName mautic.dotb.vn
     ServerAlias www.mautic.dotb.vn
</VirtualHost>
```

Sau tất cả các cấu hình, tiến hành restart lại lampp

```ini
/opt/lampp/lampp restart
```

# Script
```ini
#!/bin/bash
#user
if [ $(id -u) -eq 0 ]; then
  read -p "Enter host Domain: " domainname
  read -p "Enter new Domain username: " tusername
  egrep "^$tusername" /etc/passwd >/dev/null
  if [ $? -eq 0 ]; then
    echo "$tusername exists!"
    exit 1
  else
    useradd $tusername
    passwd $tusername
    read -p "Enter new password again (latest): " tpassword
  fi
else
  echo "Only root may add a user to the system"
  exit 2
fi
read -p "Enter new MySQL root password : " spassword
mkdir "/home/$tusername/$domainname"
echo "success! $domainname - $tusername" >>/home/$tusername/$domainname/index.php
chown -R $tusername:$tusername /home/$tusername
echo "127.0.0.1 $domainname" >>/etc/hosts
yum -y update
#java
yum -y install java-1.8.0-openjdk.x86_64
#lampp
yum -y install curl net-tools
curl -o lampp.run "https://downloadsapachefriends.global.ssl.fastly.net/xampp-files/7.1.29/xampp-linux-x64-7.1.29-0-installer.run?from_af=true"
chmod +x lampp.run
bash -c './lampp.run'
ln -sf /opt/lampp/lampp /usr/bin/lampp
ln -sf /opt/lampp/bin/mysql /usr/bin/mysql
ln -sf /opt/lampp/bin/php /usr/bin/php
lampp restart
lampp stopftp
#httpd and php
sed -i.bak s'/Require local/Require all granted/g' /opt/lampp/etc/extra/httpd-xampp.conf
sed -i "s/'config'/'http'/g" /opt/lampp/phpmyadmin/config.inc.php
echo 'Include "/opt/lampp/etc/extra/httpd-vhosts.conf"' >>/opt/lampp/etc/httpd.conf
sed -i "s/User daemon/User $tusername/g" /opt/lampp/etc/httpd.conf
sed -i "s/Group daemon/Group $tusername/g" /opt/lampp/etc/httpd.conf
sed -i "s/\/opt\/lampp\/htdocs/\/home/g" /opt/lampp/etc/httpd.conf
sed -i "s/webmaster@dummy-host.example.com/contact@dotb.vn/g" /opt/lampp/etc/extra/httpd-vhosts.conf
sed -i "s/\/opt\/lampp\/docs\/dummy-host.example.com/\/home\/$tusername\/$domainname/g" /opt/lampp/etc/extra/httpd-vhosts.conf
sed -i "s/dummy-host.example.com/$domainname/g" /opt/lampp/etc/extra/httpd-vhosts.conf
rm -f /opt/lampp/etc/php.ini
echo '[PHP]
engine=On
short_open_tag=Off
short_open_tag=On
asp_tags=Off
precision=14
y2k_compliance=On
output_buffering=4096
zlib.output_compression=Off
implicit_flush=Off
unserialize_callback_func=
serialize_precision=100
allow_call_time_pass_reference=Off
safe_mode=Off
safe_mode_gid=Off
safe_mode_include_dir=
safe_mode_exec_dir=
safe_mode_allowed_env_vars=PHP_
safe_mode_protected_env_vars=LD_LIBRARY_PATH
disable_functions=
disable_classes=
expose_php=On
max_execution_time=3600
max_input_time=3600
memory_limit=2048M
error_reporting=E_ALL & ~E_DEPRECATED & ~E_STRICT
display_errors=Off
display_startup_errors=On
log_errors=On
log_errors_max_len=1024
ignore_repeated_errors=Off
ignore_repeated_source=Off
report_memleaks=On
track_errors=On
html_errors=On
error_log="/opt/lampp/logs/php_error_log"
variables_order="GPCS"
request_order="GP"
register_globals=Off
register_long_arrays=Off
register_argc_argv=Off
auto_globals_jit=On
post_max_size=1280M
magic_quotes_gpc=Off
magic_quotes_runtime=Off
magic_quotes_sybase=Off
auto_prepend_file=
auto_append_file=
default_mimetype="text/html"
doc_root=
user_dir=
enable_dl=Off
file_uploads=On
upload_tmp_dir="/opt/lampp/temp/"
upload_max_filesize=1280M
allow_url_fopen=On
allow_url_include=Off
default_socket_timeout=60
[Date]
date.timezone=Asia/Ho_Chi_Minh
[filter]
[iconv]
[intl]
[sqlite]
[sqlite3]
[Pcre]
[Pdo]
[Pdo_mysql]
pdo_mysql.cache_size=2000
pdo_mysql.default_socket=
[Phar]
[Syslog]
define_syslog_variables=Off
[mail function]
SMTP=localhost
smtp_port=25
mail.add_x_header=On
[SQL]
sql.safe_mode=Off
[ODBC]
odbc.allow_persistent=On
odbc.check_persistent=On
odbc.max_persistent=-1
odbc.max_links=-1
odbc.defaultlrl=4096
odbc.defaultbinmode=1
[Interbase]
ibase.allow_persistent=1
ibase.max_persistent=-1
ibase.max_links=-1
ibase.timestampformat="%Y-%m-%d %H:%M:%S"
ibase.dateformat="%Y-%m-%d"
ibase.timeformat="%H:%M:%S"
[MySQL]
mysql.allow_local_infile=On
mysql.allow_persistent=On
mysql.cache_size=2000
mysql.max_persistent=-1
mysql.max_links=-1
mysql.default_port=
mysql.default_socket=
mysql.default_host=
mysql.default_user=
mysql.default_password=
mysql.connect_timeout=60
mysql.trace_mode=Off
[MySQLi]
mysqli.max_persistent=-1
mysqli.max_links=-1
mysqli.cache_size=2000
mysqli.default_port=3306
mysqli.default_socket=
mysqli.default_host=
mysqli.default_user=
mysqli.default_pw=
mysqli.reconnect=Off
[mysqlnd]
mysqlnd.collect_statistics=On
mysqlnd.collect_memory_statistics=On
[OCI8]
[PostgresSQL]
pgsql.allow_persistent=On
pgsql.auto_reset_persistent=Off
pgsql.max_persistent=-1
pgsql.max_links=-1
pgsql.ignore_notice=0
pgsql.log_notice=0
[Sybase-CT]
sybct.allow_persistent=On
sybct.max_persistent=-1
sybct.max_links=-1
sybct.min_server_severity=10
sybct.min_client_severity=10
[bcmath]
bcmath.scale=0
[browscap]
[Session]
session.save_handler=files
session.save_path="/opt/lampp/temp/"
session.use_cookies=1
session.use_only_cookies=1
session.name=PHPSESSID
session.auto_start=0
session.cookie_lifetime=0
session.cookie_path=/
session.cookie_domain=
session.cookie_httponly=1
session.serialize_handler=php
session.gc_probability=1
session.gc_divisor=1000
session.gc_maxlifetime=1440
session.bug_compat_42=On
session.bug_compat_warn=On
session.referer_check=
session.entropy_length=0
session.entropy_file=
session.cache_limiter=nocache
session.cache_expire=180
session.use_trans_sid=1
session.hash_function=0
session.hash_bits_per_character=5
url_rewriter.tags="a=href,area=href,frame=src,input=src,form=fakeentry"
[MSSQL]
mssql.allow_persistent=On
mssql.max_persistent=-1
mssql.max_links=-1
mssql.min_error_severity=10
mssql.min_message_severity=10
mssql.compatability_mode=Off
mssql.secure_connection=Off
[Assertion]
[COM]
[mbstring]
[gd]
[exif]
[Tidy]
tidy.clean_output=Off
[soap]
soap.wsdl_cache_enabled=1
soap.wsdl_cache_dir="/tmp"
soap.wsdl_cache_ttl=86400
soap.wsdl_cache_limit=5
[sysvshm]
[ldap]
ldap.max_links=-1
[mcrypt]
[dba]
openssl.cafile=/opt/lampp/share/curl/curl-ca-bundle.crt
' >>/opt/lampp/etc/php.ini
#mysql
echo "
use mysql;
UPDATE user SET password=PASSWORD('$spassword') WHERE User='root';
FLUSH PRIVILEGES;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '$spassword';
FLUSH PRIVILEGES;
" >>/change_password_mysql.sql
echo ">>press Enter to pass ask below<<"
mysql -u root -p mysql </change_password_mysql.sql
rm -f /change_password_mysql.sql
rm -f /opt/lampp/etc/my.cnf
echo '
[client]
port		= 3306
socket		= /opt/lampp/var/mysql/mysql.sock
[mysqld]
user = mysql
port=3306
socket		= /opt/lampp/var/mysql/mysql.sock
skip-external-locking
key_buffer = 160M
max_allowed_packet = 10M
table_open_cache = 64
sort_buffer_size = 5M
net_buffer_length = 80K
read_buffer_size = 2M
read_rnd_buffer_size = 5M
myisam_sort_buffer_size = 80M
plugin_dir = /opt/lampp/lib/mysql/plugin/
server-id	= 1
innodb_data_home_dir = /opt/lampp/var/mysql/
innodb_data_file_path = ibdata1:10M:autoextend
innodb_log_group_home_dir = /opt/lampp/var/mysql/
innodb_buffer_pool_size = 160M
innodb_log_file_size = 50M
innodb_log_buffer_size = 80M
innodb_flush_log_at_trx_commit = 1
innodb_lock_wait_timeout = 50
[mysqldump]
quick
max_allowed_packet = 160M
[mysql]
no-auto-rehash
[isamchk]
key_buffer = 200M
sort_buffer_size = 200M
read_buffer = 20M
write_buffer = 20M
[myisamchk]
key_buffer = 200M
sort_buffer_size = 200M
read_buffer = 20M
write_buffer = 20M
[mysqlhotcopy]
interactive-timeout
!include /opt/lampp/mysql/my.cnf
' >>/opt/lampp/etc/my.cnf
#elasticsearch
rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch
echo "[elasticsearch-6.x]" >>/etc/yum.repos.d/elasticsearch.repo
echo "name=Elasticsearch repository for 6.x packages" >>/etc/yum.repos.d/elasticsearch.repo
echo "baseurl=https://artifacts.elastic.co/packages/6.x/yum" >>/etc/yum.repos.d/elasticsearch.repo
echo "gpgcheck=1" >>/etc/yum.repos.d/elasticsearch.repo
echo "gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch" >>/etc/yum.repos.d/elasticsearch.repo
echo "enabled=1" >>/etc/yum.repos.d/elasticsearch.repo
echo "autorefresh=1" >>/etc/yum.repos.d/elasticsearch.repo
echo "type=rpm-md" >>/etc/yum.repos.d/elasticsearch.repo
yum -y install elasticsearch
/bin/systemctl daemon-reload
/bin/systemctl enable elasticsearch.service
systemctl start elasticsearch.service
lampp restart
echo "===========SERVER DEPLOY SCRIPT============"
echo "==domain              : $domainname"
echo "==user                   : $tusername"
echo "==pass                  : $tpassword"
echo "==pass root mysql: $spassword"
echo "========================================="
```
