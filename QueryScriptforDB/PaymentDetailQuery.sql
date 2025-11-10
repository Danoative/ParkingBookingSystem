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
