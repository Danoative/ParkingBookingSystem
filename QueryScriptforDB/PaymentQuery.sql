Create table PaymentOption(
	PaymentID int identity(1,1) primary key,
	BookingID int foreign key references Booking(BookingID),
	PaymentMethod NVARCHAR(50),
	PaymentStat NVARCHAR(50) default 'Unpaid',
	TranscationDate datetime default getdate()
);