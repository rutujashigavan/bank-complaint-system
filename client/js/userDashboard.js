function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("user-dashboard__sidebar--collapsed");
  document.body.classList.toggle("sidebar-collapsed");
}

function toggleNotifications() {
  closeAll();
  const box = document.getElementById("notifDropdown");
  box.style.display = box.style.display === "block" ? "none" : "block";
}

function toggleProfile() {
  closeAll();
  const box = document.getElementById("profileDropdown");
  box.style.display = box.style.display === "block" ? "none" : "block";
}

function closeAll() {
  document.getElementById("notifDropdown").style.display = "none";
  document.getElementById("profileDropdown").style.display = "none";
}

document.addEventListener("click", function (e) {
  const isInside = e.target.closest(".user-dashboard__right");
  if (!isInside) closeAll();
});

function toggleSidebarSettings() {
  const el = document.getElementById("sidebarSettings");
  el.style.display = el.style.display === "block" ? "none" : "block";
}

function toggleProfileSettings() {
  const el = document.getElementById("profileSettings");
  el.style.display = el.style.display === "block" ? "none" : "block";
}

function closeModal(e) {
  if (!e || e.target.id === "modal") {
    document.getElementById("modal").style.display = "none";
  }
}

const user = JSON.parse(localStorage.getItem("loggedInUser"));

if (!user) {
  alert("Please login first");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const displayName = user.name || user.userName || user.fullName || "User";
  const email = (user.email || user.emailId || "Not available").toLowerCase();
  const customerId = user.customerId || user.customerID || user.userId || "Not available";

  document.getElementById("userName").textContent = displayName;
  document.getElementById("profileDropdownName").textContent = displayName;
  document.getElementById("email").textContent = email;
  document.getElementById("userId").textContent = customerId;

  document.getElementById("profileName").textContent = displayName;
  document.getElementById("profileEmail").textContent = email;
  document.getElementById("profileId").textContent = customerId;

  fillComplaintUserData();
  setupDarkMode();
  setupHelpFaq();

  showDashboard();
});

/* ================= SECTION CONTROL ================= */

function hideAllSections() {
  document.querySelectorAll(".dashboard-section").forEach(section => {
    section.style.display = "none";
  });
}

function showDashboard() {
  hideAllSections();
  document.getElementById("dashboardSection").style.display = "block";
  loadComplaints();
}

function showRaiseComplaint() {
  hideAllSections();
  document.getElementById("raiseComplaintSection").style.display = "block";
  fillComplaintUserData();
}

function showMyComplaints() {
  hideAllSections();
  document.getElementById("myComplaintsSection").style.display = "block";
  loadMyComplaints();
}

function showTrackSection() {
  hideAllSections();
  document.getElementById("trackSection").style.display = "block";
  loadTrackComplaints();
}

function showHelpSection() {
  hideAllSections();
  document.getElementById("helpSection").style.display = "block";
}

/* ================= COMPLAINT FORM ================= */

const complaintSchema = {
  "ATM Card Issues": [
    { name: "cardNumber", label: "Card Number", type: "text", required: true },
    { name: "atmLocation", label: "ATM Location", type: "text", required: true },
    { name: "incidentDate", label: "Date of Incident", type: "date", required: true }
  ],
  "Debit Card / Credit Card Problems": [
    { name: "cardNumber", label: "Card Number", type: "text", required: true },
    { name: "cardType", label: "Card Type", type: "text", required: true },
    { name: "issueDescription", label: "Issue Description", type: "textarea", required: true }
  ],
  "Unauthorized Transactions": [
    { name: "accountNumber", label: "Account Number", type: "text", required: true },
    { name: "transactionId", label: "Transaction ID", type: "text", required: true },
    { name: "amount", label: "Amount", type: "number", required: true },
    { name: "transactionDate", label: "Transaction Date", type: "date", required: true }
  ],
  "Net Banking Login Issues": [
    { name: "username", label: "Net Banking Username", type: "text", required: true },
    { name: "errorMessage", label: "Error Message", type: "textarea", required: true }
  ],
  "UPI / Payment Failure": [
    { name: "upiId", label: "UPI ID", type: "text", required: true },
    { name: "transactionId", label: "Transaction ID", type: "text", required: true },
    { name: "amount", label: "Amount", type: "number", required: true }
  ],
  "Account Freeze / Blocked Account": [
    { name: "accountNumber", label: "Account Number", type: "text", required: true },
    { name: "reason", label: "Known Reason", type: "textarea", required: false }
  ],
  "Loan Related Issues": [
    { name: "loanAccount", label: "Loan Account Number", type: "text", required: true },
    { name: "loanType", label: "Loan Type", type: "text", required: true }
  ],
  "Bank Charges Dispute": [
    { name: "chargeType", label: "Charge Type", type: "text", required: true },
    { name: "amount", label: "Amount", type: "number", required: true }
  ],
  "Cheque / Cheque Bounce Issues": [
    { name: "chequeNumber", label: "Cheque Number", type: "text", required: true },
    { name: "issue", label: "Issue Details", type: "textarea", required: true }
  ],
  "Mobile Banking App Issues": [
    { name: "appVersion", label: "App Version", type: "text", required: false },
    { name: "issue", label: "Issue Details", type: "textarea", required: true }
  ],
  "Account Statement / Balance Issues": [
    { name: "accountNumber", label: "Account Number", type: "text", required: true },
    { name: "statementPeriod", label: "Statement Period", type: "text", required: true },
    { name: "issue", label: "Issue Details", type: "textarea", required: true }
  ],
  "Other Banking Complaints": [
    { name: "otherIssue", label: "Describe Your Issue", type: "textarea", required: true }
  ]
};

function handleCategoryChange() {
  const category = document.getElementById("category").value;
  renderDynamicFormFields(category);
}

function renderDynamicFormFields(category) {
  const box = document.getElementById("dynamicFields");
  box.innerHTML = "";

  const fields = complaintSchema[category] || [];

  fields.forEach(f => {
    const div = document.createElement("div");
    div.className = "form-group";

    let inputHTML = "";

    if (f.type === "textarea") {
      inputHTML = `
        <textarea name="${f.name}" placeholder="Enter ${f.label}" ${f.required ? "required" : ""}></textarea>
      `;
    } else {
      inputHTML = `
        <input type="${f.type}" name="${f.name}" placeholder="Enter ${f.label}" ${f.required ? "required" : ""}>
      `;
    }

    div.innerHTML = `
      <label>${f.label}${f.required ? " *" : ""}</label>
      ${inputHTML}
    `;

    box.appendChild(div);
  });
}

function validateForm() {
  const inputs = document.querySelectorAll(
    "#complaintForm input, #complaintForm textarea, #complaintForm select"
  );

  for (let input of inputs) {
    if (input.required && !input.value.trim()) {
      alert(`${input.placeholder || input.name} is required`);
      return false;
    }
  }

  return true;
}

function showToast(message = "Complaint Submitted Successfully ✅") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerText = message;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}

function fillComplaintUserData() {
  document.getElementById("complaintFullName").value =
    user.name || user.userName || user.fullName || "";

  document.getElementById("complaintEmail").value =
    (user.email || user.emailId || "").toLowerCase();

  document.getElementById("complaintCustomerId").value =
    user.customerId || user.customerID || user.userId || "";
}

async function submitComplaint(event) {
  event.preventDefault();

  if (!validateForm()) return;

  const form = document.getElementById("complaintForm");
  const formData = new FormData(form);

  const fields = {};
  formData.forEach((value, key) => {
    fields[key] = value;
  });

  const complaint = {
    name: user.name || user.userName || user.fullName || "",
    email: (user.email || user.emailId || "").toLowerCase(),
    customerId: user.customerId || user.customerID || user.userId || "",
    mobile: fields.mobile || "",
    category: fields.category || "",
    priority: fields.priority || "Low",
    description: fields.description || "",
    fields: fields,
    status: "Pending",
    time: new Date().toISOString()
  };

  try {
    const res = await fetch("http://localhost:5000/api/complaints/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(complaint)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Submission failed");
    }

    showToast("Complaint Submitted Successfully ✅");
    resetComplaintForm();
    fillComplaintUserData();

    loadComplaints();
    loadMyComplaints();
    loadTrackComplaints();

  } catch (error) {
    console.error(error);
    showToast("Submission failed ❌");
  }
}

function resetComplaintForm() {
  document.getElementById("complaintForm").reset();
  document.getElementById("dynamicFields").innerHTML = "";
  fillComplaintUserData();
}

/* ================= LOAD DASHBOARD COMPLAINTS ================= */

async function loadComplaints() {
  try {
    const userEmail = (user.email || user.emailId || "").toLowerCase();

    const res = await fetch(`http://localhost:5000/api/complaints/user/${userEmail}`);
    const result = await res.json();

    const complaints = result.data || result || [];

    dashboardComplaints = complaints;

    const tableBody = document.getElementById("complaintsTableBody");

    const totalEl = document.getElementById("totalComplaints");
    const pendingEl = document.getElementById("pendingComplaints");
    const resolvedEl = document.getElementById("resolvedComplaints");
    const escalatedEl = document.getElementById("escalatedComplaints");

    tableBody.innerHTML = "";

    let pending = 0;
    let resolved = 0;
    let escalated = 0;

    if (!complaints.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5">No complaints found</td>
        </tr>
      `;

      totalEl.textContent = 0;
      pendingEl.textContent = 0;
      resolvedEl.textContent = 0;
      escalatedEl.textContent = 0;
      return;
    }

    complaints.forEach(c => {
      const status = c.status || "Pending";
      const statusClass = status.toLowerCase().replace(/\s+/g, "-");

      if (statusClass === "pending") pending++;
      if (statusClass === "resolved") resolved++;
      if (statusClass === "escalated") escalated++;

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${c._id || "N/A"}</td>
        <td>${c.category || "N/A"}</td>
        <td class="status-${statusClass}">${status}</td>
        <td>${new Date(c.createdAt || c.time || Date.now()).toLocaleString()}</td>
        <td>
          <button onclick="viewComplaintDetails('${c._id}')">View</button>
        </td>
      `;

      tableBody.appendChild(row);
    });

    totalEl.textContent = complaints.length;
    pendingEl.textContent = pending;
    resolvedEl.textContent = resolved;
    escalatedEl.textContent = escalated;

  } catch (err) {
    console.error("Error loading dashboard complaints:", err);
  }
}

/* ================= MY COMPLAINTS ================= */
let allComplaints = [];
let dashboardComplaints = [];
let currentFilter = "All";


async function loadMyComplaints() {
  try {
    const userEmail = (user.email || user.emailId || "").toLowerCase();

    const res = await fetch(`http://localhost:5000/api/complaints/user/${userEmail}`);
    const result = await res.json();

    allComplaints = result.data || result || [];

    renderMyComplaintsTable();

  } catch (err) {
    console.error("My complaints error:", err);

    const tbody = document.getElementById("myComplaintsTableBody");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">Unable to load complaints</td>
        </tr>
      `;
    }
  }
}

function renderMyComplaintsTable() {
  const tbody = document.getElementById("myComplaintsTableBody");
  tbody.innerHTML = "";

  const filteredComplaints =
    currentFilter === "All"
      ? allComplaints
      : allComplaints.filter(c => (c.status || "Pending") === currentFilter);

  if (!filteredComplaints.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">No complaints found</td>
      </tr>
    `;
    return;
  }

  filteredComplaints.forEach(c => {
    const status = c.status || "Pending";
    const statusClass = status.toLowerCase().replace(/\s+/g, "-");

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${c._id || "N/A"}</td>
      <td>${new Date(c.createdAt || c.time || Date.now()).toLocaleString()}</td>
      <td>${c.category || "N/A"}</td>
      <td class="status-${statusClass}">${status}</td>
      <td style="display:flex; gap:8px; justify-content:center;">
        <button 
          class="view-complaint-btn"
          onclick="viewComplaintDetails('${c._id}')">
          View Details
        </button>

        <button 
          onclick="deleteComplaint('${c._id}')"
          style="background:#dc2626;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">
          Delete
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function filterComplaints(status, event) {
  currentFilter = status;

  document.querySelectorAll(".filters button").forEach(btn => {
    btn.classList.remove("active");
  });

  if (event) event.target.classList.add("active");

  renderMyComplaintsTable();
}

function viewComplaintDetails(id) {

  const complaint =
    allComplaints.find(c => String(c._id) === String(id)) ||
    dashboardComplaints.find(c => String(c._id) === String(id));

  if (!complaint) {
    alert("Complaint details not found");
    return;
  }

  const description =
    complaint.description ||
    complaint.fields?.description ||
    complaint.fields?.issueDescription ||
    complaint.fields?.issue ||
    complaint.fields?.otherIssue ||
    "No description available";

  const details = `
Complaint ID: ${complaint._id}

Date: ${new Date(complaint.createdAt || complaint.time || Date.now()).toLocaleString()}

Category: ${complaint.category || "N/A"}

Status: ${complaint.status || "Pending"}

Priority: ${complaint.priority || "Low"}

Description: ${description}

Admin Response: ${complaint.adminResponse || complaint.adminNote || "No response yet"}
  `;

  alert(details);
}
/* ================= TRACK COMPLAINTS ================= */

async function loadTrackComplaints() {
  try {
    const userEmail = (user.email || user.emailId || "").toLowerCase();

    const res = await fetch(`http://localhost:5000/api/complaints/user/${userEmail}`);
    const result = await res.json();

    const complaints = result.data || result || [];

    const tbody = document.getElementById("trackTableBody");
    tbody.innerHTML = "";

    if (!complaints.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">No complaints found</td>
        </tr>
      `;
      return;
    }

    complaints.forEach(c => {
      const status = c.status || "Pending";
      const statusClass = status.toLowerCase().replace(/\s+/g, "-");

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${c._id || "N/A"}</td>
        <td>${c.category || "N/A"}</td>
        <td class="status-${statusClass}">${status}</td>
        <td>${c.priority || "Low"}</td>
        <td>${new Date(c.createdAt || c.time || Date.now()).toLocaleString()}</td>
      `;

      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("Track complaints error:", err);
  }
}

/* ================= DELETE ================= */

async function deleteComplaint(id) {
  const confirmDelete = confirm("Are you sure you want to delete this complaint?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`http://localhost:5000/api/complaints/delete/${id}`, {
      method: "DELETE"
    });

    const result = await res.json();

    if (!result.success) {
      alert(result.message || "Failed to delete complaint");
      return;
    }

    alert("Complaint deleted successfully ✅");

    loadComplaints();
    loadMyComplaints();
    loadTrackComplaints();

  } catch (err) {
    console.error("Delete Error:", err);
    alert("Failed to delete complaint ❌");
  }
}

/* ================= HELP FAQ ================= */

function setupHelpFaq() {
  const faqs = document.querySelectorAll("#helpSection .faq");

  faqs.forEach(faq => {
    const question = faq.querySelector(".question");

    question.addEventListener("click", function () {
      faqs.forEach(item => {
        if (item !== faq) item.classList.remove("active");
      });

      faq.classList.toggle("active");
    });
  });
}

/* ================= AUTO REFRESH ================= */

setInterval(() => {
  const dashboardVisible = document.getElementById("dashboardSection").style.display !== "none";
  const myVisible = document.getElementById("myComplaintsSection").style.display !== "none";
  const trackVisible = document.getElementById("trackSection").style.display !== "none";

  if (dashboardVisible) loadComplaints();
  if (myVisible) loadMyComplaints();
  if (trackVisible) loadTrackComplaints();

}, 10000);

/* ================= REAL TIME ================= */

const socket = io("http://localhost:5000");

let notificationCount = 0;

function addNotification(message) {
  const notifList = document.getElementById("notifList");
  const notifCount = document.getElementById("notifCount");

  if (!notifList || !notifCount) return;

  if (notificationCount === 0) {
    notifList.innerHTML = "";
  }

  notificationCount++;
  notifCount.textContent = notificationCount;

  const item = document.createElement("div");
  item.className = "user-dashboard__dropdown-item";
  item.textContent = message;

  notifList.prepend(item);
}

socket.on("newComplaint", complaint => {
  const userEmail = (user.email || user.emailId || "").toLowerCase();

  if (complaint.email === userEmail || complaint.emailId === userEmail) {
    addNotification(`Your complaint was submitted: ${complaint.category}`);
    loadComplaints();
    loadMyComplaints();
    loadTrackComplaints();
  }
});

socket.on("complaintUpdated", complaint => {
  const userEmail = (user.email || user.emailId || "").toLowerCase();

  if (complaint.email === userEmail || complaint.emailId === userEmail) {
    addNotification(`Complaint status updated to: ${complaint.status}`);
    loadComplaints();
    loadMyComplaints();
    loadTrackComplaints();
  }
});

/* ================= DARK MODE ================= */

function setupDarkMode() {
  const darkToggle = document.getElementById("darkModeToggle");

  if (!darkToggle) return;

  const userEmail = user.email || user.emailId || "guest";
  const themeKey = `systemTheme_${userEmail}`;
  const savedTheme = localStorage.getItem(themeKey);

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    darkToggle.checked = true;
  } else {
    document.body.classList.remove("dark-mode");
    darkToggle.checked = false;
  }

  darkToggle.addEventListener("change", function () {
    if (darkToggle.checked) {
      document.body.classList.add("dark-mode");
      localStorage.setItem(themeKey, "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem(themeKey, "light");
    }
  });
}