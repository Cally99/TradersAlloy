# Traders Alloy Backend

### **Dependencies**
- node 12.20

### **Setup**
- Create a **.env** file in the Backend folder.
- Add the following info as the example.

```
SERVER_ADDR=http://localhost
PORT=8081
DB_username=example
DB_password=example
DB_database=example
DB_host=127.0.0.1
DB_port=5432
DB_dialect=postgres
EMAIL_NEWS_INTERIM=false
EMAIL_NEWS_INSIDER=false
FINWIRE_PATH = example
IMAGE_ADDR=http://localhost:8081
```

### **Database**
  - Install postgres locally.
```sh
$ brew install postgresql@12
```
- In order to manage your local database, download pgAdmin.
```sh
$ brew install --cask pgadmin4
```
- Open pgAdmin, and create a database with the name **trader**.
```
Host: localhost
Port: 5432
Username: postgres
```
- Ask your colleqques for a db export of the **trader** database
- And then run the following command in order to create/popullate all tables
 ```sh
$ psql -U postgres -d trader -f {path_to_file}/dbexport.sql
```

### **Installation**
```sh
# Install the correct Node version 
$ nvm install
```

### **Development**
```sh
$  node src/app.js
# Once is running follow the steps in `frontend/readme.md` 
```