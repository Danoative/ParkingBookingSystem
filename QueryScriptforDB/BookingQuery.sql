create table Booking(
	BookingID int identity(1,1) primary key,
	UserID int foreign key references Users(UserID),
	AreaID int foreign key references ParkingAreas(AreaID),
	SlotNumber int,
	StartTime DATETIME not null,
	EndTIme DATETIME not null,
	Status nvarchar(50) DEFAULT 'PENDING',
	CreateAt DateTime Default getdate()
);