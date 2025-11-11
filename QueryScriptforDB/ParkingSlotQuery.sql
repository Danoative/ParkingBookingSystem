CREATE TABLE ParkingSlot(
	SlotID INT IDENTITY(1,1) PRIMARY KEY,
	AreaID INT,
	VehID INT,
	SlotLocation varchar(100),
	SlotStatus varchar(20) check (SlotStatus IN ('available', 'not available')),
	FOREIGN KEY (AreaID) references ParkingAreas(AreaID),
	FOREIGN KEY (VehID) references Vehicle(VehID)
);