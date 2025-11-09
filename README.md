A Group Project for CSE IU PDM Course.

 Installation:

 Database Setup
- Microsoft SQL Server Management Studio (2021)
- Microsft SQL Express Server (2019)
- Node.js (Latest)

1. When installing SQL Express Server (2019), choose either Basic or Custom but it is prefered to choose Basic when the installation is done.

2. After the installation, download SQL Server Management Studio to be able to manage the database inside the created Express Server
                ![alt text](image-1.png)

        To check if the server is actually in your local machine

3. Copy/Paste the Query Scripts in QueryScriptforDB to create the table in the database of the SQLServerExpress in the SQL Server Management that's connected in

Create the query in object explorer and copy/paste code in QueryScriptforDB
![alt text](image-2.png)

Execute the script in the current query script and restart the database to 
![alt text](image-3.png)

Run "node server.js" in the command prompt of the destination of where the server.js is located in your folder, to test if the api of the database is working change the table instance in server.js  "api/test-db"