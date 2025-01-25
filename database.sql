CREATE DATABASE My_Watt;
USE My_Watt;

#USERS TABLE TO STORE DETAILS OF HOME MANAGERS AND HOME USERS 
CREATE TABLE Users (
user_id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(50) UNIQUE NOT NULL,
#EMAIL?
user_pfp BLOB,
date_of_birth DATE NOT NULL,
user_password VARCHAR(100) NOT NULL,
Notifications_enabled BOOLEAN DEFAULT TRUE NOT NULL,
user_role ENUM('Home Manager' , 'Home User', 'Guest') NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

#USERSTATUS TO CHECK IF THEY ARE CURRENTLY USING THE APP
CREATE TABLE User_Status (
status_id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
is_active BOOLEAN DEFAULT TRUE,
last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

#TABLE TO STORE THE DETAILS OF THE HOUSEHOLD AND THEIR RESPECTIVE MANAGERS
CREATE TABLE Households (
household_id INT AUTO_INCREMENT PRIMARY KEY,
household_name VARCHAR(100) NOT NULL,
h_id VARCHAR(100) UNIQUE NOT NULL,
household_icon BLOB,
home_manager_id INT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (home_manager_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

#MANY TO MANY RELATIONSHIP BETWEEN HOME USERS AND HOUSEHOLDS 
CREATE TABLE HomeUser_Household (
userhouse_id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
household_id INT, 
joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE,
UNIQUE(user_id,household_id)
);

#store household energy
CREATE TABLE Household_Energy(
household_energy_id INT AUTO_INCREMENT PRIMARY KEY,
household_id INT,
energy_consumed DECIMAL(10,2), #FAKE DATA EXTRACTION
energy_generated DECIMAL(10,2), 
renewable_percentage DECIMAL,
carbon_emission DECIMAL,
recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (household_id) REFERENCES Households(household_id) ON DELETE CASCADE
);

#ROOMS 
CREATE TABLE Rooms (
room_id INT AUTO_INCREMENT PRIMARY KEY,
household_id INT, 
room_name VARCHAR(100) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (household_id) REFERENCES Households(household_id) ON DELETE CASCADE
);

#To calculate the energy of the room 
CREATE TABLE Room_Energy (
room_energy_id INT AUTO_INCREMENT PRIMARY KEY,
room_id INT,
energy_consumed DECIMAL(10,2), #FAKE DATA EXTRACTION
recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE
);

#device details
CREATE TABLE Devices (
device_id INT AUTO_INCREMENT PRIMARY KEY,
room_id INT,
household_id INT, 
device_name VARCHAR(100) NOT NULL,
device_type VARCHAR(50),
is_active BOOLEAN DEFAULT TRUE,
installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (room_id) REFERENCES Rooms(room_id) ON DELETE CASCADE, 
FOREIGN KEY (household_id) REFERENCES Households(household_id) ON DELETE CASCADE
);

#STORE DEVICE ENERGY
CREATE TABLE Device_Energy (
device_energy_id INT AUTO_INCREMENT PRIMARY KEY,
device_id INT,
energy_consumed DECIMAL(10,2), #FAKE DATA EXTRACTION
recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (device_id) REFERENCES Devices(device_id) ON DELETE CASCADE
);

#record device status
CREATE TABLE Device_Status(
device_status_id INT AUTO_INCREMENT PRIMARY KEY,
device_id INT,
status ENUM( 'ON', 'OFF', 'ERROR') DEFAULT 'OFF',
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (device_id) REFERENCES Devices(device_id) ON DELETE CASCADE
);

#record device schedule
CREATE TABLE Device_Schedule(
device_schedule_id INT AUTO_INCREMENT PRIMARY KEY,
device_id INT,
start_time TIME,
end_time TIME,
repeat_days VARCHAR(20),
is_active BOOLEAN DEFAULT TRUE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (device_id) REFERENCES Devices(device_id) ON DELETE CASCADE
);

#ALERTS
CREATE TABLE Notifications (
notification_id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
message TEXT NOT NULL,
type ENUM('ALERT', 'REMINDER', 'SUGGESTION'),
is_read BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

#track user activities
CREATE TABLE Activity_Log (
act_log_id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
action VARCHAR(200),
target VARCHAR(200),
status ENUM ('Success' , 'Failure') DEFAULT 'Success',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

#to differentiate permissions of home manager and users
CREATE TABLE Permissions (
permission_id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
device_id INT,
can_view BOOLEAN,
can_control BOOLEAN DEFAULT FALSE,
easy_mode BOOLEAN DEFAULT FALSE,
FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
FOREIGN KEY (device_id) REFERENCES Devices(device_id) ON DELETE CASCADE
);

#leaderboard (share user goals with other houses or within the house? )
CREATE TABLE Energy_Goals(
goals_id INT AUTO_INCREMENT PRIMARY KEY,
household_id INT,
goal_type ENUM ('Consumption', 'Cost', 'Carbon'),
target_value DECIMAL(10,2),
current_value DECIMAL(10,2),
deadline DATE,
achieved BOOLEAN DEFAULT FALSE,
FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE
);

#rewards
CREATE TABLE Rewards (
rewards_id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT,
reward_type ENUM('Badge', 'Vouchers', 'Discounts', 'Achievement'),
reward_name VARCHAR(50),
earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

#to log device faults
CREATE TABLE Device_Faults (
fault_id INT AUTO_INCREMENT PRIMARY KEY,
device_id INT,
fault_description TEXT NOT NULL,
intensity ENUM('Low', 'Medium', 'High'),
resolved BOOLEAN,
reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (device_id) REFERENCES Devices(device_id) ON DELETE CASCADE
);

CREATE TABLE Automation_Rules (
rules_id INT AUTO_INCREMENT PRIMARY KEY,
household_id INT,
condition_N TEXT, #BETTER TO ADD A LIMIT ?
action TEXT,
is_active BOOLEAN,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (household_id) REFERENCES households(household_id) ON DELETE CASCADE
);

#password reset or verification
CREATE TABLE User_verification (
verification_id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
link VARCHAR(200) UNIQUE NOT NULL,
link_type ENUM('password_reset', 'user_verification'),
link_used BOOLEAN,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
expires_at TIMESTAMP NOT NULL,
FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);





















