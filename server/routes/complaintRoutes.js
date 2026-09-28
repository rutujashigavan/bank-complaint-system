const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  updateStatus,
  deleteComplaint
} = require("../controllers/complaintController");

/* ================= USER ROUTES ================= */

// Create a new complaint
router.post("/create", createComplaint);

// Get complaints for a specific user by email
router.get("/user/:email", getUserComplaints);

/* ================= ADMIN ROUTES ================= */

// Get all complaints (admin dashboard)
router.get("/all", getAllComplaints);

// Update status of a complaint (admin action)
// (kept POST to avoid breaking your existing frontend)
router.post("/update-status", updateStatus);

// Delete complaint
router.delete("/delete/:id", deleteComplaint);

module.exports = router;