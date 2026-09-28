const Complaint = require("../models/complaint");

/* ================= CREATE COMPLAINT ================= */
exports.createComplaint = async (req, res) => {
  try {
    const complaintData = {
      ...req.body,
      email: req.body.email?.trim().toLowerCase(),
      customerId: req.body.customerId?.trim(),
      createdAt: new Date()
    };

    const complaint = new Complaint(complaintData);
    await complaint.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("newComplaint", complaint);
    }

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: complaint
    });

  } catch (err) {
    console.error("Create Complaint Error:", err.message);

    res.status(500).json({
      success: false,
      message: "Failed to create complaint",
      error: err.message
    });
  }
};


/* ================= GET USER COMPLAINTS ================= */
exports.getUserComplaints = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const userEmail = email.trim().toLowerCase();

    const complaints = await Complaint.find({
      email: userEmail
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      data: complaints
    });

  } catch (err) {
    console.error("Get User Complaints Error:", err.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user complaints",
      error: err.message
    });
  }
};


/* ================= GET ALL (ADMIN) ================= */
exports.getAllComplaints = async (req, res) => {
  try {

    const complaints = await Complaint.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: complaints
    });

  } catch (err) {

    console.error("Get all complaints error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch complaints"
    });
  }
};


/* ================= UPDATE STATUS (ADMIN) ================= */
exports.updateStatus = async (req, res) => {
  try {

    const { complaintId, status } = req.body;

    if (!complaintId || !status) {
      return res.status(400).json({
        success: false,
        message: "Complaint ID and status are required"
      });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { status },
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    const io = req.app.get("io");

    if (io) {
      io.emit("complaintUpdated", updatedComplaint);
    }

    res.json({
      success: true,
      message: "Complaint status updated successfully",
      data: updatedComplaint
    });

  } catch (err) {

    console.error("Update status error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to update complaint status"
    });
  }
};

/* ================= DELETE COMPLAINT ================= */
exports.deleteComplaint = async (req, res) => {
  try {

    const { id } = req.params;

    const deletedComplaint = await Complaint.findByIdAndDelete(id);

    if (!deletedComplaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found"
      });
    }

    const io = req.app.get("io");

    if (io) {
      io.emit("complaintDeleted", deletedComplaint);
    }

    res.json({
      success: true,
      message: "Complaint deleted successfully"
    });

  } catch (err) {

    console.error("Delete Complaint Error:", err.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete complaint"
    });
  }
};