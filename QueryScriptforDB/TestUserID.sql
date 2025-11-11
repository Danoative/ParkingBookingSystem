Set Identity_Insert dbo.Users ON;
INSERT into dbo.Users(Username, Email) Values ('TestUser', 'test@example.com');
Set Identity_Insert dbo.Users OFF;