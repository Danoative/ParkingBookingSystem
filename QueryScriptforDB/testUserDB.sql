-- Use only for quick local test if you already have a hash
INSERT INTO users (username, email, PasswordHash, Address, role)
VALUES ('testuser','testuser@example.com',
        '$2a$10$1f2g3h4i5j6k7l8m9n0oOuQf2g6Qe5SxG3nQ2hVQkD7y1lQh1E7iG', -- example only; replace with real hash
        '123 Test Street','CUSTOMER');
-- Insert Admin 
INSERT INTO users (username, email, PasswordHash, Address, role)
VALUES ('admin','admin@example.com',
        '$2a$10$1f2g3h4i5j6k7l8m9n0oOuQf2g6Qe5SxG3nQ2hVQkD7y1lQh1E7iG', -- example only; replace with real hash
        '123 Test Street','Admin');
        
-- Insert into ParkingArea
INSERT INTO ParkingAreas (ParkName, ParkingLocation, TotalSlots, AvailableSlots, PricePerHour)
VALUES ('My Park', 'Downtown Center', 12, 12, 5000);

-- Assume AreaID = 1 and SlotNum runs 1-12
INSERT INTO ParkingSlot (AreaID, SlotLocation, SlotStatus)
VALUES (1, 'A1', 'available'),
       (1, 'A2', 'available'),
       (1, 'A3', 'available'),
       (1, 'A4', 'available'),
       (1, 'A5', 'available'),
       (1, 'A6', 'available'),
       (1, 'A7', 'available'),
       (1, 'A8', 'available'),
       (1, 'A9', 'available'),
       (1, 'A10', 'available'),
       (1, 'A11', 'available'),
       (1, 'A12', 'available');
-- Booking test
INSERT INTO Booking (
    UserID,
    AreaID,
    SlotID,
    FirstName,
    LastName,
    Email,
    Phone,
    UserAddress,
    StartTime,
    EndTime,
    BookingStat
) VALUES (
    3,                 -- UserID (existing user)
    1,                 -- AreaID (existing parking area)
    5,                 -- SlotID (existing slot)
    'Lisa',            -- FirstName
    'Tran',            -- LastName
    'lisa.tran@email.com',  -- Email
    '0912345678',      -- Phone
    '12 Main St, Hanoi',    -- UserAddress
    '2025-11-22 08:30:00',  -- StartTime (YYYY-MM-DD HH:MM:SS)
    '2025-11-22 10:30:00',  -- EndTime   (YYYY-MM-DD HH:MM:SS)
    'CONFIRMED'             -- BookingStat (can be PENDING, CONFIRMED, CANCELLED, COMPLETED)
);
-- Insert a test vehicle
 INSERT INTO vehicles (VehID, UserID, VehType, PlateNum)
VALUES ('1', '1', 'Car', '12345A3');



SELECT SlotID, SlotLocation FROM ParkingSlot;