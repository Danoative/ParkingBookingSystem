<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a id="readme-top"></a>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->



<!-- PROJECT LOGO -->
<h3 align="center">Booking Parking System</h3>

  <p align="center">
    This is Group 6's project for Principles of Database Management course.
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#configuration">Configuration</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#starting-the-website">Starting the Website</a></li>
        <li><a href="#using-the-website">Using the Website</a></li>
      </ul>
    </li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Group Member</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project


A Parking Booking System allows users to register, log in, and manage profiles with different access levels (customer, administrator). Customers can search for available parking slots, select a suitable location, reserve a space for a specific time period, and complete payments either online or offline. 

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

- [Node.js](https://nodejs.org/)
- [MySQL](https://dev.mysql.com/downloads/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started



### Prerequisites

- **Node.js** and **npm** installed on your machine.
  ```sh 
  # Verify installations
  node -v
  npm -v
  ```

- **Database Server** installed on your machine
  - Install **MySQL** Community from [here](https://dev.mysql.com/downloads/).
  - Execute the script in   cd "<YOUR_PATH>\QueryScriptforDB\parking.sql"
  - Configure the database in db.js running in localhost:3306,
   default "root" password "12345".
  - 


- **General Server**
  - To install the necessary modules for the General server, navigate to the directory and run:
  ```
  cd "<YOUR_PATH>\Server"
    npm install express
    npm install mysql2
  ```
- **General Server**
  - To install the necessary modules for the General server, navigate to the directory and run:
  ```
  cd "<YOUR_PATH>"
    npm install http
  ```
### Configuration

1. **Run the server**

2. **Clone the repo**
   ```sh
   git clone https://github.com/Danoative/ParkingBookingSystem.git
   ```
3. ***Run the webserver**
- Navigate to the reposity's folder, run "http-server" with command prompt.

4. **Set Up MySQL Connection** (Optional due to the database is in the cloud)
- Open "**MySQL Workbench**."
- Configure the database in db.js running in localhost:3306,
  default "root" password "12345".


<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

### Starting the Website

1. **Start MySQL Server** (Optional because the database is in the cloud)
- Type "node server.js" in command prompt "<YOUR_PATH>\Server\server.js" 

2. **Host the Web Server**
- Type "http-server" in command prompt "<YOUR_PATH>" to host all the webpages in the project's folder.
3. **Open the webs**
- Type [http://localhost:3036/src/BookingPage/index.html] in browser to open up the main page for customer.
- Type [http://localhost:3036/src/AdminDash/index.html] in browser to open up the dashboard for administrator.

### Using the Website
#### For Users
1. **Login**
  - Click on the **Login** button.
  - Click on the **Sign Up** line to register a new account.
  - Once you have registered, log in using your credentials.
  

2. **Using The Booking Parking**
  - Once logged in, you can already access the form to fill in your information.
  - When submitted, a prompt for choose payment methods will appear (only pay in cash available)

#### For Admin
1. **Sign Up**
  - Register a new account at Admin Dashboard website.

2. **Login to Dashboard**
  - You can login using the admin credentials via the **Login** button in `index.html` of the Admin Dashboard website.

3. **Using Dashboard**
  - You can view the total available, booked parking slots, total users/admins.
  - You can look at the price per hour, which slots available or taken.
  - Able to edit/remove user role to Customer/Admin.
  - Able to change payment status, detailed info of the booking.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the GPL-3.0. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>w



<!-- CONTACT -->
## Group Member

- Đào Nguyên Công Danh    - ITITWE22111 - ITITWE22111@student.hcmiu.edu.vn
- Phan Trọng Tín          - ITDSIU20088 - ITDSIU20088@student.hcmiu.edu.vn
- Nguyễn Đức Quốc Anh     - ITITIU21008 - ITITIU21008@student.hcmiu.edu.vn

Project Link: [https://github.com/Danoative/ParkingBookingSystem](https://github.com/Danoative/ParkingBookingSystem)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

m/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[product-screenshot]: src/images/sample/sample.png
