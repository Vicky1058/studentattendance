const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2'); // Import mysql2

const app = express();

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies

// MySQL database connection setup
const db = mysql.createConnection({
    host: 'localhost', // Your database host
    user: 'root',      // Your database user
    password: 'Vign-2005', // Your database password
    database: 'attendancesystem' // Your database name
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

// POST endpoint to mark attendance
app.post('/attendance', (req, res) => {
    console.log('Received request:', req.body); // Log the incoming request

    const attendanceData = req.body;

    // Validate the incoming data
    if (!Array.isArray(attendanceData)) {
        return res.status(400).json({ error: "Invalid data format, expected an array." });
    }

    // Process the attendance data
    const attendanceRecords = attendanceData.map(record => {
        const { name, year, date, status } = record;
        return { name, year, date, status };
    });

    // Insert attendance records into the database
    const sql = 'INSERT INTO attendance (student_id, date, status) VALUES ?';
    const values = attendanceRecords.map(record => [record.student_id, record.date, record.status]);

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.error('Error inserting attendance:', err);
            return res.status(500).json({ error: 'Database insertion failed' });
        }

        // Send a success response
        res.json({ message: "Attendance marked successfully" });
    });
});

// GET endpoint to view attendance
app.get('/attendance/view/:date', (req, res) => {
    const { date } = req.params;

    // Query to get attendance records for the specified date
    const sql = 'SELECT * FROM attendance WHERE date = ?';
    db.query(sql, [date], (err, results) => {
        if (err) {
            console.error('Error retrieving attendance:', err);
            return res.status(500).json({ error: 'Database retrieval failed' });
        }

        // Send the attendance records for the specified date
        res.json(results);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack
    res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
