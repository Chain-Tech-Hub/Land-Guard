-- USERS TABLE
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    private_key TEXT NOT NULL,
    public_key TEXT NOT NULL,
    nation_id_number VARCHAR(20) UNIQUE,
    role VARCHAR(50),
    gender VARCHAR(10),
    street VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(50)
);

-- Insert data into Users table
INSERT INTO Users (full_name, date_of_birth, password_hash, phone_number, private_key, public_key, nation_id_number, role, gender, street, city, postal_code, country)
VALUES 
('John Banda', '1990-05-14', 'e99a18c428cb38d5f260853678922e03', '0888001347', 'samplePrivateKey1', 'samplePublicKey1', 'MWN123456', 'Landowner', 'Male', 'Njamba Road', 'Blantyre', 'BT101', 'Malawi'),
('Grace Mbewe', '1985-11-02', 'd8578edf8458ce06fbc5bb76a58c5ca4', '0999002567', 'samplePrivateKey2', 'samplePublicKey2', 'MWN654321', 'Landlord', 'Female', 'Chirimba', 'Lilongwe', 'LL300', 'Malawi');

-- LAND TABLE
CREATE TABLE Land (
    land_id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(100),
    coordinates TEXT NOT NULL,
    state VARCHAR(50),
    owner_id INT,
    landlord VARCHAR(255),
    size DECIMAL(10, 2),
    price DECIMAL(15, 2),
    FOREIGN KEY (owner_id) REFERENCES Users(user_id)
);

-- Insert data into Land table
INSERT INTO Land (type, coordinates, state, owner_id, landlord, size, price)
VALUES 
('Residential', '15.786,-34.946', 'Available', 1, 'Grace Mbewe', 500.00, 2000000.00),
('Commercial', '15.700,-35.002', 'Sold', 2, 'John Banda', 800.00, 5000000.00);

-- APPLICATIONS TABLE
CREATE TABLE Applications (
    application_id INT PRIMARY KEY AUTO_INCREMENT,
    land_id INT,
    user_id INT,
    application_date DATE NOT NULL,
    state VARCHAR(50),
    description TEXT,
    FOREIGN KEY (land_id) REFERENCES Land(land_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Insert data into Applications table
INSERT INTO Applications (land_id, user_id, application_date, state, description)
VALUES 
(1, 1, '2024-01-10', 'Pending', 'Application for residential land purchase.'),
(2, 2, '2024-02-05', 'Approved', 'Application for commercial land.');

-- OFFERS TABLE
CREATE TABLE Offers (
    offer_id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT,
    offer_date DATE,
    state VARCHAR(50),
    developmental_charge DECIMAL(15, 2),
    transaction_id VARCHAR(255),
    FOREIGN KEY (application_id) REFERENCES Applications(application_id)
);

-- Insert data into Offers table
INSERT INTO Offers (application_id, offer_date, state, developmental_charge, transaction_id)
VALUES 
(1, '2024-01-15', 'Offered', 10000.00, 'TX12345'),
(2, '2024-02-10', 'Accepted', 15000.00, 'TX67890');

-- TITLE DEEDS TABLE
CREATE TABLE Title_Deeds (
    title_deed_id INT PRIMARY KEY AUTO_INCREMENT,
    offer_id INT,
    state VARCHAR(50),
    title_deed TEXT,
    deed_number VARCHAR(50),
    type VARCHAR(50),
    expire_date DATE,
    FOREIGN KEY (offer_id) REFERENCES Offers(offer_id)
);

-- Insert data into Title Deeds table
INSERT INTO Title_Deeds (offer_id, state, title_deed, deed_number, type, expire_date)
VALUES 
(1, 'Active', 'Title Deed 1 for residential land', 'TD12345', 'Residential', '2034-01-15'),
(2, 'Active', 'Title Deed 2 for commercial land', 'TD67890', 'Commercial', '2034-02-10');

-- PAYMENTS TABLE
CREATE TABLE Payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    service_provider VARCHAR(100),
    amount DECIMAL(15, 2),
    transaction_id VARCHAR(255),
    deed_number VARCHAR(50),
    type VARCHAR(50),
    payment_date DATE
);

-- Insert data into Payments table
INSERT INTO Payments (service_provider, amount, transaction_id, deed_number, type, payment_date)
VALUES 
('Airtel Money', 2000000.00, 'TX12345', 'TD12345', 'Purchase', '2024-01-18'),
('TNM Mpamba', 5000000.00, 'TX67890', 'TD67890', 'Purchase', '2024-02-12');

-- BLOCKCHAIN TRANSACTIONS TABLE
CREATE TABLE Blockchain_Transactions (
    blockchain_tran_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    land_id INT,
    transaction_hash VARCHAR(255),
    payment_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (land_id) REFERENCES Land(land_id),
    FOREIGN KEY (payment_id) REFERENCES Payments(payment_id)
);

-- Insert data into Blockchain Transactions table
INSERT INTO Blockchain_Transactions (user_id, land_id, transaction_hash, payment_id)
VALUES 
(1, 1, '0xabcdef1234567890abcdef', 1),
(2, 2, '0x1234567890abcdefabcdef', 2);

