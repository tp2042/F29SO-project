#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Jan 20 22:39:19 2025

@author: fidha
"""
"""
from flask import Flask, jsonify
import mysql.connector

app = Flask(__name__)

conn = mysql.connector.connect(
    host="localhost",           
    user="root",                
    password="pw",     
    database="My_Watt" )

@app.route('/getTable', methods = ['GET'])
def get_tables():
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall() 
    cursor.close()
    conn.close()
    tablenames= [table[0] for table in tables]
    return jsonify({'tables': tablenames})


@app.route('/getUsers', methods=['GET'])
def get_users():
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Users")  
    users = cursor.fetchall()  
    cursor.close()
    
    # Return the data as JSON response
    return jsonify({'users': users})

if __name__ == '__main__':
    app.run(debug = True, port=5001)

"""

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect
from sqlalchemy import Enum
import datetime

app = Flask(__name__)


app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:pw@localhost/My_Watt'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = 'Users'
    
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    user_pfp = db.Column(db.LargeBinary)  # For profile picture (BLOB)
    date_of_birth = db.Column(db.Date, nullable=False)
    user_password = db.Column(db.String(100), nullable=False)
    Notifications_enabled = db.Column(db.Boolean, default=True, nullable=False)
    user_role = db.Column(Enum('Home Manager', 'Home User', 'Guest'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def __repr__(self):
        return f"<User {self.username}>"



@app.route('/getTable', methods=['GET'])
def get_tables():
  
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()  
    return jsonify({'tables': tables})

@app.route('/getUsers', methods=['GET'])
def get_users():
    
    users = User.query.all()
    users_data = [{'user_id': user.user_id, 'username': user.username, 'email': user.email, 
                   'user_role': user.user_role, 'created_at': user.created_at} for user in users]
    return jsonify({'users': users_data})


if __name__ == '__main__':
    app.run(debug=True, port=5001)