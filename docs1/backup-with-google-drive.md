# Cài đặt Gdrive trên Centos

Đối với centos 64bit sẽ chạy file gdrive-linux-x64, đối với 32bit chạy file gdrive-linux-386

[File 64bit](../files/gdrive-linux-x64)

[File 32bit](../files/gdrive-linux-386)

```bash
yum install wget
wget -O drive http://document.dotb.vn/files/gdrive-linux-x64
mv drive /usr/sbin/drive
chmod 755 /usr/sbin/drive

```

# Xác thực tài khoản Google Drive

```bash
drive about

Go to the following link in your browser:  
https://accounts.google.com/o/oauth2/auth?client_id=123456789123-7n0vf5akeru7on6o2fjinrecpdoe99eg.apps.googleusercontent.com&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive&state=state

Enter verification code: 4/9gKYAFAJ326XIP6JJHAEhs342t35LPiA5QGW0935GHWHy9

```

# Tạo file sh để execute

```bash
#!/bin/bash

#thư mục lưu file backup, KHÔNG chứa dấu / ở cuối
BACKUPDIR='/home/backup'

#thông tin nơi chứa source cần backup
SOURCENAME='dotb_tomato_crm'
SOURCEDIR='/opt/lampp/htdocs/crm.tomato.edu.vn'

#tài khoản truy cập database
DBUSER='root'
DBPASSWORD='hD41B*7l9e^S'
DBNAME='online_crm_tomato'

#path to mysqldump execute
PATHMYSQLDUMP='/opt/lampp/bin/mysqldump'

#số ngày lưu backup
DATESUB=7

#folder google drive id
FOLDER_GDRIVE='1qFMC-bO3FqbNCpS0nlQLx3dHoMtvn9Qz'

#script xử lý
#DO NOT EDIT
DATENOW=`date +%Y-%m-%d`
DATEDEL=$(date --date="${DATENOW} -${DATESUB} day" +%Y_%m_%d)
rm -f $BACKUPDIR/`echo $DATEDEL`_$SOURCENAME.zip
DBOUT="$BACKUPDIR/$DBNAME.sql"
`echo $PATHMYSQLDUMP` --force --opt -u $DBUSER --password=$DBPASSWORD $DBNAME > $DBOUT
zip -r $BACKUPDIR/$SOURCENAME.zip $SOURCEDIR
zip $BACKUPDIR/`date +%Y_%m_%d`_$SOURCENAME.zip $DBOUT $BACKUPDIR/$SOURCENAME.zip
rm -f $DBOUT
rm -f $BACKUPDIR/$SOURCENAME.zip
drive upload -p $FOLDER_GDRIVE $BACKUPDIR/`date +%Y_%m_%d`_$SOURCENAME.zip
```

# Cài đặt cronjob
```bash
crontab -e

#bấm i để vào chết độ insert
#chèn dòng thực thi backup hằng ngày vào 0h
0 0 * * * path_to_file_bash_backup
```