-- Tạo schema
CREATE SCHEMA bookingparkingsystem;
USE bookingparkingsystem;

----------------------------------------------------
-- USERS TABLE
----------------------------------------------------
CREATE TABLE Users(
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(20) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    Role ENUM('CUSTOMER','ADMIN','MANAGER') NOT NULL DEFAULT 'CUSTOMER',
    CreateAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAT DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT CheckNameLength CHECK (CHAR_LENGTH(Username) BETWEEN 3 AND 20)
);

----------------------------------------------------
-- VEHICLES TABLE
----------------------------------------------------
CREATE TABLE Vehicles(
    VehID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    VehType VARCHAR(100) NOT NULL,
    PlateNum VARCHAR(100) NOT NULL,
    CreateAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_user
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

----------------------------------------------------
-- PARKING AREAS
----------------------------------------------------
CREATE TABLE ParkingAreas (
    AreaID INT PRIMARY KEY AUTO_INCREMENT,
    ParkName VARCHAR(100) NOT NULL,
    ParkingLocation VARCHAR(255),
    TotalSlots INT NOT NULL,
    AvailableSlots INT NOT NULL,
    PricePerHour DECIMAL(10,2) NOT NULL,
    CreateAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_slots_nonneg CHECK (TotalSlots >= 0 AND AvailableSlots >= 0),
    CONSTRAINT chk_slots_cap CHECK (AvailableSlots <= TotalSlots),
    CONSTRAINT chk_price_positive CHECK (PricePerHour >= 0)
);

----------------------------------------------------
-- PARKING SLOT (tạo sau ParkingAreas)
----------------------------------------------------
CREATE TABLE ParkingSlot(
    SlotID INT PRIMARY KEY AUTO_INCREMENT,
    AreaID INT NOT NULL,
    SlotNum INT NOT NULL,
    CurrentVehID INT NULL,
    SlotLocation VARCHAR(100),
    SlotStatus ENUM('available','not available') NOT NULL DEFAULT 'available',

    UNIQUE KEY uq_area_slot (AreaID, SlotNum),

    CONSTRAINT fk_slot_area
        FOREIGN KEY (AreaID) REFERENCES ParkingAreas(AreaID)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_slot_vehicle
        FOREIGN KEY (CurrentVehID) REFERENCES Vehicles(VehID)
        ON DELETE SET NULL ON UPDATE CASCADE
);

----------------------------------------------------
-- BOOKING
----------------------------------------------------
CREATE TABLE Booking (
    BookingID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    AreaID INT NOT NULL,
    SlotID INT NOT NULL,
    SlotNumber INT,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Phone VARCHAR(50) NOT NULL,
    UserAddress VARCHAR(255) NOT NULL,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    BookingStat ENUM('PENDING','CONFIRMED','CANCELLED','COMPLETED') NOT NULL DEFAULT 'PENDING',
    CreateAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_user
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_booking_area
        FOREIGN KEY (AreaID) REFERENCES ParkingAreas(AreaID)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_booking_slot
        FOREIGN KEY (SlotID) REFERENCES ParkingSlot(SlotID)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_time_order CHECK (EndTime > StartTime)
);

----------------------------------------------------
-- PAYMENT
----------------------------------------------------
CREATE TABLE Payment (
    TransacID INT PRIMARY KEY AUTO_INCREMENT,
    TransacTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UserID INT NOT NULL,
    BookingID INT NOT NULL,
    TotalCost DECIMAL(12,0) NOT NULL,
    PayStat ENUM('Paid','Unpaid','Refunded') NOT NULL DEFAULT 'Unpaid',
    PayMethod ENUM('Online Banking','Credit Card','Pay In Cash') NOT NULL,

    CONSTRAINT fk_payment_user
        FOREIGN KEY (UserID) REFERENCES Users(UserID)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT fk_payment_booking
        FOREIGN KEY (BookingID) REFERENCES Booking(BookingID)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT chk_total_cost CHECK (TotalCost >= 0)
);
