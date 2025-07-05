const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const methodOverride = require("method-override");
require("dotenv").config();

// Initialize Express app
// const app = express();
const app = express();
app.use(methodOverride("_method"));
const port = process.env.PORT || 3000;


app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error connecting to DB:", err);
  } else {
    console.log("✅ Connected to Railway MySQL!");
  }
});

app.get("/healthz", (req, res) => {
  res.send(" health is OK");
});

app.get("/", (req, res) => {  
  const statsQuery = `
  SELECT
    (SELECT COUNT(*) FROM student) AS total_students,
    (SELECT COUNT(*) FROM payment WHERE status = 'Pending') AS pending_payments,
    (SELECT COUNT(*) FROM maintenance WHERE priority = 'High') AS maintenance_issues,
    (SELECT COUNT(*) FROM room) AS total_rooms,
    (SELECT COUNT(*) FROM visitor) AS total_visitors;
`;

  const recentPaymentsQuery = `
    SELECT s.name AS student_name, p.amount, p.payment_type, p.payment_date
    FROM payment p
    JOIN student s ON p.student_id = s.id
    ORDER BY p.payment_date DESC
    LIMIT 5;
  `;

  const recentVisitorsQuery = `
    SELECT s.name AS student_name, v.visitor_name, v.visit_date, v.check_in_time
    FROM visitor v
    JOIN student s ON v.student_id = s.id
    ORDER BY v.visit_date DESC, v.check_in_time DESC
    LIMIT 5;
  `;

  const roomQuery = "SELECT * FROM room"; // ✅ Declare only once

  db.query(statsQuery, (err, statsResult) => {
    if (err) throw err;
    const stats = statsResult[0];
    const cdate = new Date();

    db.query(recentPaymentsQuery, (err, paymentsResult) => {
      if (err) throw err;

      db.query(recentVisitorsQuery, (err, visitorsResult) => {
        if (err) throw err;

        db.query(roomQuery, (err, roomResult) => {
          if (err) throw err;

          res.render("index.ejs", {
            totalStudents: stats.total_students,
            pendingPayments: stats.pending_payments,
            maintenanceIssues: stats.maintenance_issues,
            totalRooms: stats.total_rooms,
            totalVisitors: stats.total_visitors,
            recentPayments: paymentsResult,
            recentVisitors: visitorsResult,
            rooms: roomResult,
            cdate,
          });
        });
      });
    });
  });
});


app.get("/student", (req, res) => {
  const studentQuery = `
    SELECT s.*, r.room_number, g.name AS guardian_name 
    FROM student s
    LEFT JOIN room r ON s.room_id = r.id
    LEFT JOIN guardian g ON g.student_id = s.id
  `;

  const roomQuery = `SELECT * FROM room`;
  const usedBedsQuery = `SELECT room_id, bed_number FROM student WHERE bed_number IS NOT NULL`;

  db.query(studentQuery, (err, students) => {
    if (err) {
      console.error("❌ Student query error:", err);
      return res.status(500).send("Error loading students");
    }

    db.query(roomQuery, (err, rooms) => {
      if (err) {
        console.error("❌ Room query error:", err);
        return res.status(500).send("Error loading rooms");
      }

      db.query(usedBedsQuery, (err, usedBedsRows) => {
        if (err) {
          console.error("❌ Used beds query error:", err);
          return res.status(500).send("Error loading used beds");
        }

        console.log("✅ Used beds:", usedBedsRows);

        // Group used beds by room_id
        const usedBeds = {};
        usedBedsRows.forEach(row => {
          if (!usedBeds[row.room_id]) usedBeds[row.room_id] = new Set();
          usedBeds[row.room_id].add(row.bed_number);
        });

        res.render("student", {
          students,
          rooms,
          usedBeds
        });
      });
    });
  });
});


app.get("/room", (req, res) => {
  const roomQuery = "SELECT * FROM room";
  db.query(roomQuery, (err, roomResult) => {
    if (err) throw err;
    res.render("room.ejs", { rooms: roomResult });
  });
});

app.get("/payment", (req, res) => {
  const paymentQuery = "SELECT * FROM payment";
  const studentsQuery = "SELECT id, name, roll_number FROM student";

  db.query(paymentQuery, (err, paymentResult) => {
    if (err) throw err;

    db.query(studentsQuery, (err, studentResult) => {
      if (err) throw err;

      res.render("payment.ejs", {
        payments: paymentResult,
        students: studentResult, // 👈 pass this to EJS
      });
    });
  });
});


app.get("/guardian", (req, res) => {
  const guardianQuery = "SELECT * FROM guardian";
  db.query(guardianQuery, (err, guardianResult) => {
    if (err) throw err;
    res.render("guardian.ejs", { guardians: guardianResult });
  });
});

app.get("/visitor", (req, res) => {
  const visitorQuery = "SELECT * FROM visitor";
  const studentsQuery = "SELECT id, name, roll_number FROM student";

  db.query(visitorQuery, (err, visitorResult) => {
    if (err) throw err;
    
    db.query(studentsQuery, (err, studentResult) => {
      if (err) throw err;
      
      res.render("visitor.ejs", {
        visitors: visitorResult,
        students: studentResult,
      });
    });
  });
});

app.get("/maintenance", (req, res) => {
  const maintenanceQuery = "SELECT * FROM maintenance";
  const roomsQuery = "SELECT * FROM room";

  db.query(maintenanceQuery, (err, maintenanceResult) => {
    if (err) throw err;
    
    db.query(roomsQuery, (err, roomsResult) => {
      if (err) throw err;
      
      res.render("maintenance.ejs", {
        maintenances: maintenanceResult,
        rooms: roomsResult,
      });
    });
  });
});

// ////////////////////////////////DELETION////////////////////////
// DELETE Student
app.delete("/student/:roll_number", (req, res) => {
  const rollNumber = req.params.roll_number;

  // Step 1: Get student ID from roll number
  const getStudentId = "SELECT id FROM student WHERE roll_number = ?";

  db.query(getStudentId, [rollNumber], (err, result) => {
    if (err || result.length === 0) {
      console.error("❌ Failed to find student:", err);
      return res.status(404).send("Student not found");
    }

    const studentId = result[0].id;

    // Step 2: Delete guardian first (if any)
    const deleteGuardian = "DELETE FROM guardian WHERE student_id = ?";
    db.query(deleteGuardian, [studentId], (err) => {
      if (err) {
        console.error("❌ Failed to delete guardian:", err);
        return res.status(500).send("Error deleting guardian");
      }

      // Step 3: Delete student
      const deleteStudent = "DELETE FROM student WHERE roll_number = ?";
      db.query(deleteStudent, [rollNumber], (err) => {
        if (err) {
          console.error("❌ Failed to delete student:", err);
          return res.status(500).send("Error deleting student");
        }

        res.redirect("/student");
      });
    });
  });
});


app.delete("/room/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM room WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Failed to delete room:", err);
      return res.status(500).send("Server error");
    }
    res.redirect("/room"); // or wherever your room list is rendered
  });
});

app.delete("/payment/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM payment WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Failed to delete payment:", err);
      return res.status(500).send("Server error");
    }
    res.redirect("/payment"); // or wherever your payment list is rendered
  });
});

app.delete("/guardian/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM guardian WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Failed to delete guardian:", err);
      return res.status(500).send("Server error");
    }
    res.redirect("/guardian"); // or wherever your guardian list is rendered
  });
});

app.delete("/visitor/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM visitor WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Failed to delete visitor:", err);
      return res.status(500).send("Server error");
    }
    res.redirect("/visitor"); // or wherever your visitor list is rendered
  });
});

app.delete("/maintenance/:id", (req, res) => {
  const id = req.params.id;

  const sql = "DELETE FROM maintenance WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Failed to delete maintenance:", err);
      return res.status(500).send("Server error");
    }
    res.redirect("/maintenance"); // or wherever your maintenance list is rendered
  });
});


//////////////////////////////INSERTION////////////////////////
// INSERT Student
app.post("/student", (req, res) => {
  console.log("📥 Received Form Data:", req.body);

  const {
    name,
    email,
    Phone,
    RollNo,
    Course,
    year,
    Address,
    Room, // room_id
    Bed,
    GuardianName,
    GuardianRelationship,
    GuardianEmail,
    GuardianPhone,
    GuardianAddress,
  } = req.body;

  const parsedYear = parseInt(year);
  const parsedRoomId = parseInt(Room);
  const parsedBed = parseInt(Bed);

  if (isNaN(parsedYear) || isNaN(parsedRoomId) || isNaN(parsedBed)) {
    return res.status(400).send("❌ Invalid year, room, or bed number.");
  }

  const admission_date = new Date().toISOString().slice(0, 10);
  const created_at = new Date();
  const updated_at = new Date();
  const status = "active";

  const insertStudent = `
    INSERT INTO student (
      name, email, phone, roll_number, course, year, address,
      admission_date, status, created_at, updated_at, room_id, bed_number
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const studentValues = [
    name,
    email,
    Phone,
    RollNo,
    Course,
    parsedYear,
    Address,
    admission_date,
    status,
    created_at,
    updated_at,
    parsedRoomId,
    parsedBed,
  ];

  db.query(insertStudent, studentValues, (err, studentResult) => {
    if (err) {
      console.error("❌ Error inserting student:", err.sqlMessage);
      return res.status(500).send("❌ Error inserting student: " + err.sqlMessage);
    }

    const studentId = studentResult.insertId;

    // Optional: insert guardian if name is provided
    if (GuardianName) {
      const insertGuardian = `
        INSERT INTO guardian (
          student_id, name, relationship, email, phone, address, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const guardianValues = [
        studentId,
        GuardianName,
        GuardianRelationship || null,
        GuardianEmail || null,
        GuardianPhone || null,
        GuardianAddress || null,
        created_at,
      ];

      db.query(insertGuardian, guardianValues, (err, guardianResult) => {
        if (err) {
          console.error("❌ Error inserting guardian:", err.sqlMessage);
          return res.status(500).send("❌ Error inserting guardian: " + err.sqlMessage);
        }

        console.log("✅ Guardian added");
        res.redirect("/student");
      });
    } else {
      res.redirect("/student");
    }
  });
});

app.post("/room", (req, res) => {
  const {
    room_number,
    capacity,
    floor,
    room_type,
    rent_amount,
    status
  } = req.body;

  // Validate numeric fields
  const parsedCapacity = parseInt(capacity);
  const parsedFloor = parseInt(floor);
  const parsedRent = parseFloat(rent_amount);

  if (
    !room_number ||
    isNaN(parsedCapacity) ||
    isNaN(parsedFloor) ||
    isNaN(parsedRent)
  ) {
    return res.status(400).send("❌ Invalid room data.");
  }

  const created_at = new Date();
  const updated_at = new Date();

  const insertQuery = `
    INSERT INTO room (
      room_number, capacity, floor, room_type, rent_amount, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    room_number,
    parsedCapacity,
    parsedFloor,
    room_type,
    parsedRent,
    status || 'available',
    created_at,
    updated_at
  ];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error("❌ Error inserting room:", err.sqlMessage);
      return res.status(500).send("❌ Failed to add room.");
    }

    console.log("✅ Room added:", result.insertId);
    res.redirect("/room"); // Redirect back to room list
  });
});


app.post("/payment", (req, res) => {
  const {
    student_id,
    amount,
    payment_date,
    payment_type,
    payment_method,
    status,
    receipt_number,
    remarks,
  } = req.body;

  const insertQuery = `
    INSERT INTO payment (
      student_id, amount, payment_date,
      payment_type, payment_method, status,
      receipt_number, remarks
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    student_id,
    amount,
    payment_date,
    payment_type,
    payment_method,
    status,
    receipt_number,
    remarks,
  ];

  db.query(insertQuery, values, (err, result) => {
    if (err) throw err;
    res.redirect("/payment");
  });
});

app.post("/maintenance", (req, res) => {
  const {
    room_id,
    issue_type,
    description,
    reported_date,
    resolved_date,
    status,
    priority,
    cost,
    assigned_to,
    remarks,
  } = req.body;

  const sql = `
    INSERT INTO maintenance (
      room_id, issue_type, description, reported_date, resolved_date,
      status, priority, cost, assigned_to, remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      room_id,
      issue_type,
      description,
      reported_date,
      resolved_date || null,
      status || 'reported',
      priority || 'medium',
      cost || 0.0,
      assigned_to,
      remarks,
    ],
    (err, result) => {
      if (err) {
        console.error("❌ Maintenance Insert Error:", err); // SHOW THIS TO ME
        return res.status(500).send("Internal Server Error");
      }
      res.redirect("/maintenance");
    }
  );
});

app.post('/visitor', (req, res) => {
  const {
    student_id,
    visitor_name,
    relationship,
    phone,
    visit_date,
    check_in_time,
    check_out_time,
    purpose,
  } = req.body;

  const insertQuery = `
    INSERT INTO visitor 
    (student_id, visitor_name, relationship, phone, visit_date, check_in_time, check_out_time, purpose) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    student_id,
    visitor_name,
    relationship,
    phone,
    visit_date,
    check_in_time,
    check_out_time,
    purpose,
  ];

  db.query(insertQuery, values, (err, result) => {
    if (err) return res.status(500).send('Error saving visitor');
    res.redirect('/visitor'); // or wherever you list visitors
  });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
