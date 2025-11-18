INSERT INTO Users (username, FullName, LastName, email, PasswordHash, address, role)
VALUES 
('tinphantrong','TRONG TIN','PHAN','phantrongtin2357@gmail.com',
 '$2a$10$1f2g3h4i5j6k7l8m9n0oOuQf2g6Qe5SxG3nQ2hVQkD7y1lQh1E7iG',
 '120 Truong Chinh','CUSTOMER'),
('daonguyendanh','CONG DANH','DAO','daonguyendanh@gmail.com',
 '$2a$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg',
 '417 Dien Bien Phu','CUSTOMER'),
('nguyenducquocanh','QUOC ANH','NGUYEN','nguyenducquocanh@gmail.com',
 '$2a$10$123456abcdef7890abcdef123456abcdef7890abcdef123456abcdef7890',
 '719 Le Van Viet','CUSTOMER');

INSERT INTO Vehicles (UserID, VehType, PlateNum)
VALUES
(1,'Car','50A-22235'),
(2,'Car','50B-52191'),
(3,'Car','52C-67591');

INSERT INTO ParkingAreas (ParkName, ParkingLocation, TotalSlots, AvailableSlots, PricePerHour)
VALUES
('Sun Parking','121 Nguyen Van Cu, HCM',50,50,20000),
('Moon Parking','450 Le Loi, HCM',30,30,15000),
('Star Parking','710 Tran Hung Dao, HCM',40,40,18000);

INSERT INTO ParkingSlot (AreaID, SlotNum, SlotLocation, SlotStatus)
VALUES
(1,1,'Near Entrance','available'),
(2,1,'Near Elevator','available'),
(3,1,'Near Gate','available');

INSERT INTO Booking (UserID, AreaID, SlotID, SlotNumber, FirstName, LastName, Email, Phone, UserAddress, StartTime, EndTime, BookingStat)
VALUES
(1,1,1,1,'TRONG TIN','PHAN','phantrongtin2357@gmail.com','0909123456','120 Truong Chinh','2025-11-20 08:00:00','2025-11-20 12:00:00','CONFIRMED'),
(2,2,2,1,'CONG DANH','DAO','daonguyendanh@gmail.com','0912345678','417 Dien Bien Phu','2025-11-21 09:00:00','2025-11-21 11:00:00','PENDING'),
(3,3,3,1,'QUOC ANH','NGUYEN','nguyenducquocanh@gmail.com','0987654321','719 Le Van Viet','2025-11-22 07:30:00','2025-11-22 10:30:00','CONFIRMED');

INSERT INTO Payment (UserID, BookingID, TotalCost, PayStat, PayMethod)
VALUES
(1,1,80000,'Paid','Credit Card'),
(2,2,30000,'Unpaid','Pay In Cash'),
(3,3,54000,'Paid','Online Banking');
