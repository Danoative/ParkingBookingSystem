Create Table ParkingAreas (
	AreaID int identity(1,1) primary key,
	ParkName nvarchar(100) not null,
	Location nvarchar(255),
	TotalSlots int not null,
	AvailableSlots Int not null,
	PricePerHour Decimal(10,2) not null,
	CreateAt Datetime Default getdate()
);