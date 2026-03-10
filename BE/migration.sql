CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    ALTER DATABASE CHARACTER SET utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE TABLE `Services` (
        `Id` int NOT NULL AUTO_INCREMENT,
        `Name` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
        `Description` varchar(1000) CHARACTER SET utf8mb4 NULL,
        `PricePerHour` decimal(18,2) NOT NULL,
        `ContractPricePerMonth` decimal(18,2) NULL,
        `Type` longtext CHARACTER SET utf8mb4 NOT NULL,
        `IsActive` tinyint(1) NOT NULL,
        `CreatedAt` datetime(6) NOT NULL,
        CONSTRAINT `PK_Services` PRIMARY KEY (`Id`)
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE TABLE `Users` (
        `Id` int NOT NULL AUTO_INCREMENT,
        `Email` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
        `Phone` varchar(20) CHARACTER SET utf8mb4 NULL,
        `PasswordHash` longtext CHARACTER SET utf8mb4 NOT NULL,
        `Role` longtext CHARACTER SET utf8mb4 NOT NULL,
        `IsActive` tinyint(1) NOT NULL,
        `CreatedAt` datetime(6) NOT NULL,
        `UpdatedAt` datetime(6) NULL,
        CONSTRAINT `PK_Users` PRIMARY KEY (`Id`)
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE TABLE `Caregivers` (
        `Id` int NOT NULL AUTO_INCREMENT,
        `UserId` int NOT NULL,
        `FullName` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
        `Specialization` varchar(100) CHARACTER SET utf8mb4 NULL,
        `ExperienceYears` int NOT NULL,
        `Bio` varchar(1000) CHARACTER SET utf8mb4 NULL,
        `ImageUrl` varchar(500) CHARACTER SET utf8mb4 NULL,
        `IsAvailable` tinyint(1) NOT NULL,
        `HourlyRate` decimal(18,2) NOT NULL,
        `CreatedAt` datetime(6) NOT NULL,
        CONSTRAINT `PK_Caregivers` PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Caregivers_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE TABLE `Families` (
        `Id` int NOT NULL AUTO_INCREMENT,
        `UserId` int NOT NULL,
        `FullName` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
        `Address` varchar(500) CHARACTER SET utf8mb4 NULL,
        `EmergencyContact` varchar(20) CHARACTER SET utf8mb4 NULL,
        `CreatedAt` datetime(6) NOT NULL,
        CONSTRAINT `PK_Families` PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Families_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE TABLE `Patients` (
        `Id` int NOT NULL AUTO_INCREMENT,
        `FamilyId` int NOT NULL,
        `FullName` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
        `DateOfBirth` datetime(6) NOT NULL,
        `Gender` varchar(20) CHARACTER SET utf8mb4 NULL,
        `MedicalHistory` varchar(2000) CHARACTER SET utf8mb4 NULL,
        `Allergies` varchar(500) CHARACTER SET utf8mb4 NULL,
        `CurrentCondition` varchar(500) CHARACTER SET utf8mb4 NULL,
        `Address` varchar(500) CHARACTER SET utf8mb4 NULL,
        `CreatedAt` datetime(6) NOT NULL,
        CONSTRAINT `PK_Patients` PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Patients_Families_FamilyId` FOREIGN KEY (`FamilyId`) REFERENCES `Families` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE TABLE `Contracts` (
        `Id` int NOT NULL AUTO_INCREMENT,
        `FamilyId` int NOT NULL,
        `PatientId` int NOT NULL,
        `ServiceId` int NOT NULL,
        `AssignedCaregiverId` int NULL,
        `StartDate` datetime(6) NOT NULL,
        `EndDate` datetime(6) NOT NULL,
        `TotalAmount` decimal(18,2) NOT NULL,
        `Status` longtext CHARACTER SET utf8mb4 NOT NULL,
        `WeeklySchedule` varchar(1000) CHARACTER SET utf8mb4 NULL,
        `CreatedAt` datetime(6) NOT NULL,
        CONSTRAINT `PK_Contracts` PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Contracts_Caregivers_AssignedCaregiverId` FOREIGN KEY (`AssignedCaregiverId`) REFERENCES `Caregivers` (`Id`) ON DELETE SET NULL,
        CONSTRAINT `FK_Contracts_Families_FamilyId` FOREIGN KEY (`FamilyId`) REFERENCES `Families` (`Id`) ON DELETE RESTRICT,
        CONSTRAINT `FK_Contracts_Patients_PatientId` FOREIGN KEY (`PatientId`) REFERENCES `Patients` (`Id`) ON DELETE RESTRICT,
        CONSTRAINT `FK_Contracts_Services_ServiceId` FOREIGN KEY (`ServiceId`) REFERENCES `Services` (`Id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE TABLE `Payments` (
        `Id` int NOT NULL AUTO_INCREMENT,
        `ContractId` int NULL,
        `FamilyId` int NOT NULL,
        `Amount` decimal(18,2) NOT NULL,
        `Status` longtext CHARACTER SET utf8mb4 NOT NULL,
        `Method` longtext CHARACTER SET utf8mb4 NOT NULL,
        `TransactionId` varchar(100) CHARACTER SET utf8mb4 NULL,
        `Description` varchar(500) CHARACTER SET utf8mb4 NULL,
        `CreatedAt` datetime(6) NOT NULL,
        `PaidAt` datetime(6) NULL,
        CONSTRAINT `PK_Payments` PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Payments_Contracts_ContractId` FOREIGN KEY (`ContractId`) REFERENCES `Contracts` (`Id`),
        CONSTRAINT `FK_Payments_Families_FamilyId` FOREIGN KEY (`FamilyId`) REFERENCES `Families` (`Id`) ON DELETE RESTRICT
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE TABLE `Schedules` (
        `Id` int NOT NULL AUTO_INCREMENT,
        `PatientId` int NOT NULL,
        `CaregiverId` int NOT NULL,
        `ContractId` int NULL,
        `Date` datetime(6) NOT NULL,
        `StartTime` time(6) NOT NULL,
        `EndTime` time(6) NOT NULL,
        `Status` longtext CHARACTER SET utf8mb4 NOT NULL,
        `CheckInTime` datetime(6) NULL,
        `CheckOutTime` datetime(6) NULL,
        `Notes` varchar(500) CHARACTER SET utf8mb4 NULL,
        `CreatedAt` datetime(6) NOT NULL,
        CONSTRAINT `PK_Schedules` PRIMARY KEY (`Id`),
        CONSTRAINT `FK_Schedules_Caregivers_CaregiverId` FOREIGN KEY (`CaregiverId`) REFERENCES `Caregivers` (`Id`) ON DELETE RESTRICT,
        CONSTRAINT `FK_Schedules_Contracts_ContractId` FOREIGN KEY (`ContractId`) REFERENCES `Contracts` (`Id`) ON DELETE SET NULL,
        CONSTRAINT `FK_Schedules_Patients_PatientId` FOREIGN KEY (`PatientId`) REFERENCES `Patients` (`Id`) ON DELETE RESTRICT
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    INSERT INTO `Services` (`Id`, `ContractPricePerMonth`, `CreatedAt`, `Description`, `IsActive`, `Name`, `PricePerHour`, `Type`)
    VALUES (1, 12000000.0, TIMESTAMP '2026-02-02 03:16:29', 'Essential daily care including medication reminders, meal assistance, and basic health monitoring.', TRUE, 'Basic Home Care', 150000.0, 'Basic'),
    (2, 20000000.0, TIMESTAMP '2026-02-02 03:16:29', 'Comprehensive care with specialized nursing, physical therapy assistance, and 24/7 monitoring.', TRUE, 'Premium Home Care', 250000.0, 'Premium'),
    (3, 28000000.0, TIMESTAMP '2026-02-02 03:16:29', 'Expert care for post-surgery recovery, chronic conditions, or specialized medical needs.', TRUE, 'Specialized Care', 350000.0, 'Specialized');

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE UNIQUE INDEX `IX_Caregivers_UserId` ON `Caregivers` (`UserId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE INDEX `IX_Contracts_AssignedCaregiverId` ON `Contracts` (`AssignedCaregiverId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE INDEX `IX_Contracts_FamilyId` ON `Contracts` (`FamilyId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE INDEX `IX_Contracts_PatientId` ON `Contracts` (`PatientId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE INDEX `IX_Contracts_ServiceId` ON `Contracts` (`ServiceId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE UNIQUE INDEX `IX_Families_UserId` ON `Families` (`UserId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE INDEX `IX_Patients_FamilyId` ON `Patients` (`FamilyId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE INDEX `IX_Payments_ContractId` ON `Payments` (`ContractId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE INDEX `IX_Payments_FamilyId` ON `Payments` (`FamilyId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE INDEX `IX_Schedules_CaregiverId` ON `Schedules` (`CaregiverId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE INDEX `IX_Schedules_ContractId` ON `Schedules` (`ContractId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE INDEX `IX_Schedules_PatientId` ON `Schedules` (`PatientId`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    CREATE UNIQUE INDEX `IX_Users_Email` ON `Users` (`Email`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20260202031629_InitialCreate') THEN

    INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
    VALUES ('20260202031629_InitialCreate', '8.0.11');

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

COMMIT;

