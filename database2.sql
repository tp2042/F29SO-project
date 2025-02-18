-- Create the database (Run this in psql or use a GUI like pgAdmin)
CREATE DATABASE My_Watt;
-- Connect to the database
-- \c My_Watt;

-- Define ENUM types first (PostgreSQL requires this for ENUM fields)
CREATE TYPE user_role_enum AS ENUM ('Home Manager', 'Home User', 'Guest');
CREATE TYPE device_status_enum AS ENUM ('ON', 'OFF', 'ERROR');
CREATE TYPE notification_type_enum AS ENUM ('ALERT', 'REMINDER', 'SUGGESTION');
CREATE TYPE activity_status_enum AS ENUM ('Success', 'Failure');
CREATE TYPE goal_type_enum AS ENUM ('Consumption', 'Cost', 'Carbon');
CREATE TYPE reward_type_enum AS ENUM ('Badge', 'Vouchers', 'Discounts', 'Achievement');
CREATE TYPE intensity_enum AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE link_type_enum AS ENUM ('password_reset', 'user_verification');

-- USERS TABLE
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    user_pfp BYTEA,
    date_of_birth DATE NOT NULL,
    user_password VARCHAR(100) NOT NULL,
    notifications_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    user_role user_role_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USER STATUS TABLE
CREATE TABLE User_Status (
    status_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HOUSEHOLDS TABLE
CREATE TABLE Households (
    household_id SERIAL PRIMARY KEY,
    household_name VARCHAR(100) NOT NULL,
    h_id VARCHAR(100) UNIQUE NOT NULL,
    household_icon BYTEA,
    home_manager_id INT REFERENCES Users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MANY-TO-MANY RELATIONSHIP BETWEEN USERS AND HOUSEHOLDS
CREATE TABLE HomeUser_Household (
    userhouse_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    household_id INT REFERENCES Households(household_id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, household_id)
);

-- HOUSEHOLD ENERGY TABLE
CREATE TABLE Household_Energy (
    household_energy_id SERIAL PRIMARY KEY,
    household_id INT REFERENCES Households(household_id) ON DELETE CASCADE,
    energy_consumed DECIMAL(10,2),
    energy_generated DECIMAL(10,2),
    renewable_percentage DECIMAL,
    carbon_emission DECIMAL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ROOMS TABLE
CREATE TABLE Rooms (
    room_id SERIAL PRIMARY KEY,
    household_id INT REFERENCES Households(household_id) ON DELETE CASCADE,
    room_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ROOM ENERGY TABLE
CREATE TABLE Room_Energy (
    room_energy_id SERIAL PRIMARY KEY,
    room_id INT REFERENCES Rooms(room_id) ON DELETE CASCADE,
    energy_consumed DECIMAL(10,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEVICES TABLE
CREATE TABLE Devices (
    device_id SERIAL PRIMARY KEY,
    room_id INT REFERENCES Rooms(room_id) ON DELETE CASCADE,
    household_id INT REFERENCES Households(household_id) ON DELETE CASCADE,
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEVICE ENERGY TABLE
CREATE TABLE Device_Energy (
    device_energy_id SERIAL PRIMARY KEY,
    device_id INT REFERENCES Devices(device_id) ON DELETE CASCADE,
    energy_consumed DECIMAL(10,2),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEVICE STATUS TABLE
CREATE TABLE Device_Status (
    device_status_id SERIAL PRIMARY KEY,
    device_id INT REFERENCES Devices(device_id) ON DELETE CASCADE,
    status device_status_enum DEFAULT 'OFF',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEVICE SCHEDULE TABLE
CREATE TABLE Device_Schedule (
    device_schedule_id SERIAL PRIMARY KEY,
    device_id INT REFERENCES Devices(device_id) ON DELETE CASCADE,
    start_time TIME,
    end_time TIME,
    repeat_days VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS TABLE
CREATE TABLE Notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type notification_type_enum,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ACTIVITY LOG TABLE
CREATE TABLE Activity_Log (
    act_log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    action VARCHAR(200),
    target VARCHAR(200),
    status activity_status_enum DEFAULT 'Success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PERMISSIONS TABLE
CREATE TABLE Permissions (
    permission_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    device_id INT REFERENCES Devices(device_id) ON DELETE CASCADE,
    can_view BOOLEAN,
    can_control BOOLEAN DEFAULT FALSE,
    easy_mode BOOLEAN DEFAULT FALSE
);

-- ENERGY GOALS TABLE
CREATE TABLE Energy_Goals (
    goals_id SERIAL PRIMARY KEY,
    household_id INT REFERENCES Households(household_id) ON DELETE CASCADE,
    goal_type goal_type_enum,
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    deadline DATE,
    achieved BOOLEAN DEFAULT FALSE
);

-- REWARDS TABLE
CREATE TABLE Rewards (
    rewards_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    reward_type reward_type_enum,
    reward_name VARCHAR(50),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEVICE FAULTS TABLE
CREATE TABLE Device_Faults (
    fault_id SERIAL PRIMARY KEY,
    device_id INT REFERENCES Devices(device_id) ON DELETE CASCADE,
    fault_description TEXT NOT NULL,
    intensity intensity_enum,
    resolved BOOLEAN,
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AUTOMATION RULES TABLE
CREATE TABLE Automation_Rules (
    rules_id SERIAL PRIMARY KEY,
    household_id INT REFERENCES Households(household_id) ON DELETE CASCADE,
    condition_N TEXT,
    action TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USER VERIFICATION TABLE
CREATE TABLE User_verification (
    verification_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    link VARCHAR(200) UNIQUE NOT NULL,
    link_type link_type_enum,
    link_used BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);
