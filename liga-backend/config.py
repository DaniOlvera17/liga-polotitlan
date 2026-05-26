# config.py — Conexión a MariaDB para Liga Polotitlán
import pyodbc

def get_connection():
    conn = pyodbc.connect(
        'DRIVER={MariaDB ODBC 3.2.5 Driver};'
        'SERVER=localhost;'
        'PORT=3306;'
        'DATABASE=liga_polotitlan;'   
        'USER=root;'
        'PASSWORD= ;'       
        'OPTION=3;'
        'CHARSET=UTF8MB4;'
    )
    return conn
