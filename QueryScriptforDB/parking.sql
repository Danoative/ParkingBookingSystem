-- User
CREATE TABLE Users(
	UserID INT IDENTITY(1,1) PRIMARY KEY,
	Username NVARCHAR(20) NOT NULL,
	FullName NVARCHAR(100) NOT NULL,
	LastName NVARCHAR(100) NOT NULL,
	Email NVARCHAR(100) UNIQUE NOT NULL,
	PasswordHash NVARCHAR(255) NOT NULL,
	Address NVARCHAR(255) NOT NULL,
	Role NVARCHAR(50) DEFAULT 'CUSTOMER',
	CreateAt DATETIME DEFAULT GETDATE()
);

-- Admin
CREATE TABLE Admins(
	AdminID INT IDENTITY(1,1) PRIMARY KEY,
	FullName NVARCHAR(100) NOT NULL,
	Email NVARCHAR(100) UNIQUE NOT NULL,
	PasswordHash NVARCHAR(255) NOT NULL,
	Role NVARCHAR(50) DEFAULT 'MANAGER',
	CreateAt DATETIME DEFAULT GETDATE()
);
-- Vehicle
CREATE TABLE Vehicle(
	VehID INT IDENTITY(1,1) PRIMARY KEY,
	UserID int,
	FOREIGN KEY (UserID) references Users,
	VehType NVARCHAR(100) NOT NULL,
	PlateNum NVARCHAR(100) NOT NULL,
	Email NVARCHAR(100) UNIQUE NOT NULL,
	PasswordHash NVARCHAR(255) NOT NULL,
	Address NVARCHAR(255) NOT NULL,
	Role NVARCHAR(50) DEFAULT 'CUSTOMER',
	CreateAt DATETIME DEFAULT GETDATE()
);

-- Parking SLot
CREATE TABLE ParkingSlot(
	SlotID INT IDENTITY(1,1) PRIMARY KEY,
	AreaID INT,
	VehID INT,
	SlotLocation varchar(100),
	SlotStatus varchar(20) check (SlotStatus IN ('available', 'not available')),
	FOREIGN KEY (AreaID) references ParkingAreas(AreaID),
	FOREIGN KEY (VehID) references Vehicle(VehID)
);
-- Parking Area
Create Table ParkingAreas (
	AreaID int identity(1,1) primary key,
	ParkName nvarchar(100) not null,
	Location nvarchar(255),
	TotalSlots int not null,
	AvailableSlots Int not null,
	PricePerHour Decimal(10,2) not null,
	CreateAt Datetime Default getdate()
);
-- Booking
CREATE TABLE Booking (
 BookingID INT IDENTITY(1,1) PRIMARY KEY,
 UserID INT FOREIGN KEY REFERENCES Users(UserID),
 AreaID INT FOREIGN KEY REFERENCES ParkingAreas(AreaID),
 SlotNumber INT,
FirstName NVARCHAR(100) NOT NULL,
 LastName NVARCHAR(100) NOT NULL,
Email NVARCHAR(255) NOT NULL,
Phone NVARCHAR(50) NOT NULL,
 UserAddress NVARCHAR(255) NOT NULL,
 StartTime DATETIME NOT NULL,
 EndTime DATETIME NOT NULL,
Status NVARCHAR(50) DEFAULT 'PENDING',
 CreateAt DATETIME DEFAULT GETDATE()
);
-- Payment
CREATE TABLE Payment (
    transacID INT PRIMARY KEY AUTO_INCREMENT,
    transacTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    UserID INT NOT NULL,
    BookingID INT NOT NULL,
    TotalCost DECIMAL(12, 0) NOT NULL, -- Price in VND, adjust precision if needed
    PayStat ENUM('Paid', 'Unpaid') NOT NULL DEFAULT 'Unpaid',
    PayMethod ENUM('Online Banking', 'Credit Card', 'Pay In Cash') NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (BookingID) REFERENCES Bookings(BookingID)
);
