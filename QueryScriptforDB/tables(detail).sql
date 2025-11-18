-- 1️⃣ Xem dữ liệu Users
SELECT * FROM Users;

-- 2️⃣ Xem dữ liệu Vehicles
SELECT v.VehID, v.VehType, v.PlateNum, u.Username, u.Email
FROM Vehicles v
JOIN Users u ON v.UserID = u.UserID;

-- 3️⃣ Xem dữ liệu ParkingAreas
SELECT * FROM ParkingAreas;

-- 4️⃣ Xem dữ liệu ParkingSlot kèm tên bãi và trạng thái
SELECT s.SlotID, s.SlotNum, s.SlotLocation, s.SlotStatus, p.ParkName, s.CurrentVehID
FROM ParkingSlot s
JOIN ParkingAreas p ON s.AreaID = p.AreaID;

-- 5️⃣ Xem dữ liệu Booking kèm thông tin user, slot, bãi
SELECT b.BookingID, u.Username, u.Email, p.ParkName, s.SlotNum, b.StartTime, b.EndTime, b.BookingStat
FROM Booking b
JOIN Users u ON b.UserID = u.UserID
JOIN ParkingSlot s ON b.SlotID = s.SlotID
JOIN ParkingAreas p ON b.AreaID = p.AreaID;

-- 6️⃣ Xem dữ liệu Payment kèm tên user và booking
SELECT pay.TransacID, u.Username, u.Email, b.BookingID, pay.TotalCost, pay.PayStat, pay.PayMethod, pay.TransacTime
FROM Payment pay
JOIN Users u ON pay.UserID = u.UserID
JOIN Booking b ON pay.BookingID = b.BookingID;

