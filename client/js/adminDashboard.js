const admin = JSON.parse(localStorage.getItem("admin"));
const role = localStorage.getItem("role");

if (!admin || role !== "admin") {
  alert("Admin access only");
  window.location.href = "login.html";
}

/* ================= SIDEBAR ================= */

function toggleAdminSidebar() {
  const sidebar = document.getElementById("adminSidebar");

  sidebar.classList.toggle("active");
  sidebar.classList.toggle("collapsed");

  document
    .querySelector(".admin-dashboard__main")
    .classList.toggle("full");
}

/* ================= DROPDOWNS ================= */

function closeAdminDropdowns() {
  document.getElementById("adminNotifDropdown").style.display = "none";
  document.getElementById("adminProfileDropdown").style.display = "none";
}

function toggleAdminNotifications() {
  closeAdminDropdowns();

  const box = document.getElementById("adminNotifDropdown");

  box.style.display =
    box.style.display === "block"
      ? "none"
      : "block";

  adminNotifCount = 0;

  document.getElementById("adminNotifCount").textContent = 0;

  localStorage.setItem("adminNotifCount", 0);
}

function toggleAdminProfile() {
  closeAdminDropdowns();

  const box = document.getElementById("adminProfileDropdown");

  box.style.display =
    box.style.display === "block"
      ? "none"
      : "block";
}

document.addEventListener("click", (e) => {
  const inside = e.target.closest(".admin-dashboard__right");

  if (!inside) {
    closeAdminDropdowns();
  }
});

/* ================= ADMIN USER ================= */

document.addEventListener("DOMContentLoaded", () => {

  const loggedAdmin =
    JSON.parse(localStorage.getItem("admin")) || {};

  const adminNameValue =
    loggedAdmin.name ||
    loggedAdmin.fullName ||
    "Admin";

  const adminEmailValue =
    loggedAdmin.email ||
    loggedAdmin.emailId ||
    loggedAdmin.registeredEmail ||
    "---";

  const adminIdValue =
    loggedAdmin.customerId ||
    loggedAdmin.customerID ||
    loggedAdmin.adminId ||
    loggedAdmin._id ||
    "---";

  /* TOP PROFILE */

  document.getElementById("adminName").textContent =
    adminNameValue;

  document.getElementById("adminEmail").textContent =
    adminEmailValue;

  document.getElementById("adminId").textContent =
    adminIdValue;

  document.getElementById("adminWelcomeName").textContent =
    adminNameValue;

  /* SETTINGS PROFILE */

  const sidebarEmail =
    document.getElementById("sidebarAdminEmail");

  const sidebarId =
    document.getElementById("sidebarAdminId");

  if (sidebarEmail) {
    sidebarEmail.textContent =
      adminEmailValue;
  }

  if (sidebarId) {
    sidebarId.textContent =
      adminIdValue;
  }

  loadAllComplaints();

  const saved =
    JSON.parse(localStorage.getItem("adminNotifications")) || [];

  const list =
    document.getElementById("adminNotifList");

  if (saved.length && list) {

    list.innerHTML = "";

    saved.forEach(msg => {

      const div =
        document.createElement("div");

      div.className =
        "admin-dashboard__dropdown-item";

      div.textContent = msg;

      list.appendChild(div);
    });
  }

  loadAdminSettings();
});

/* ================= SOCKET ================= */

const socket = io("http://localhost:5000");

let adminNotifCount =
  Number(localStorage.getItem("adminNotifCount")) || 0;

document.getElementById("adminNotifCount").textContent =
  adminNotifCount;

function addAdminNotification(message) {

  const list =
    document.getElementById("adminNotifList");

  const count =
    document.getElementById("adminNotifCount");

  if (!list || !count) return;

  if (adminNotifCount === 0) {
    list.innerHTML = "";
  }

  adminNotifCount++;

  count.textContent = adminNotifCount;

  const item =
    document.createElement("div");

  item.className =
    "admin-dashboard__dropdown-item";

  item.textContent = message;

  const old =
    JSON.parse(
      localStorage.getItem("adminNotifications")
    ) || [];

  old.unshift(message);

  localStorage.setItem(
    "adminNotifications",
    JSON.stringify(old.slice(0, 20))
  );

  list.prepend(item);
}

/* ================= LOAD COMPLAINTS ================= */

let allComplaints = [];

let currentAdminStatus = "All";

async function loadAllComplaints() {

  try {

    document.getElementById(
      "adminComplaintsTableBody"
    ).innerHTML = `
      <tr>
        <td colspan="6">
          <div class="admin-dashboard__loader"></div>
        </td>
      </tr>
    `;

    const res = await fetch(
      "http://localhost:5000/api/complaints/all"
    );

    const result = await res.json();

    console.log("Admin complaints:", result);

    allComplaints = result.data || result || [];

    renderDashboardComplaints(allComplaints);
    renderComplaints(allComplaints);
    updateStats(allComplaints);

  } catch (err) {

    console.error("Load complaints error:", err);
  }
}

/* ================= RENDER TABLE ================= */

function renderComplaints(complaints) {

  const tbody =
    document.getElementById(
      "adminComplaintsTableBody"
    );

  tbody.classList.remove("admin-dashboard__table-refresh");

  void tbody.offsetWidth;

  tbody.classList.add("admin-dashboard__table-refresh");

  tbody.innerHTML = "";

  if (!complaints.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          No complaints found
        </td>
      </tr>
    `;

    return;
  }

  complaints.forEach(c => {

    const status =
      c.status || "Pending";

    const row =
      document.createElement("tr");

    row.className =
      `admin-dashboard__row--${status.toLowerCase()}`;

    row.innerHTML = `

      <td>${c._id}</td>

      <td>${c.email || "---"}</td>

      <td>${c.category || "---"}</td>

      <td>
        <span class="
          admin-dashboard__status
          admin-dashboard__status--${status.toLowerCase()}
        ">
          ${status}
        </span>
      </td>

      <td>
        ${new Date(
          c.createdAt || Date.now()
        ).toLocaleString()}
      </td>

      <td>

        <button
          class="admin-dashboard__btn-view"
          onclick='viewComplaint(${JSON.stringify(c)})'
        >
          View
        </button>

        <button
          class="admin-dashboard__btn-resolve"
          onclick="updateComplaintStatus('${c._id}', 'Resolved')"
        >
          Resolve
        </button>

        <button
          class="admin-dashboard__btn-escalate"
          onclick="updateComplaintStatus('${c._id}', 'Escalated')"
        >
          Escalate
        </button>

        <button
          class="admin-dashboard__btn-reject"
          onclick="updateComplaintStatus('${c._id}', 'Rejected')"
        >
          Reject
        </button>

        <button
          class="admin-dashboard__btn-delete"
          onclick="deleteAdminComplaint('${c._id}')"
        >
          Delete
        </button>

      </td>
    `;

    tbody.appendChild(row);
  });
}

function renderDashboardComplaints(complaints) {
  const tbody = document.getElementById("dashboardComplaintsTableBody");

  tbody.innerHTML = "";

  if (!complaints.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">No complaints found</td>
      </tr>
    `;
    return;
  }

  complaints.slice(0, 1).forEach(c => {
    const status = c.status || "Pending";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${c._id}</td>
      <td>${c.email || "---"}</td>
      <td>${c.category || "---"}</td>
      <td>
        <span class="admin-dashboard__status admin-dashboard__status--${status.toLowerCase()}">
          ${status}
        </span>
      </td>
      <td>${new Date(c.createdAt || Date.now()).toLocaleString()}</td>
    `;

    tbody.appendChild(row);
  });
}

/* ================= UPDATE STATUS ================= */

async function updateComplaintStatus(id, status) {

  const confirmUpdate = confirm(
    `Are you sure you want to mark this complaint as ${status}?`
  );

  if (!confirmUpdate) return;

  const buttons =
    document.querySelectorAll("button");

  buttons.forEach(btn => {
    btn.disabled = true;
  });

  try {

    const res = await fetch(
      "http://localhost:5000/api/complaints/update-status",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          complaintId: id,
          status
        })
      }
    );

    const result = await res.json();

    if (!result.success) {
      alert(result.message);
      return;
    }

    const msg =
      `Complaint marked as ${status}`;

    addAdminNotification(msg);

    showAdminToast(msg);

    loadAllComplaints();

  } catch (err) {

    console.error(err);

    alert("Failed to update complaint");

  } finally {

    buttons.forEach(btn => {
      btn.disabled = false;
    });
  }
}

async function deleteAdminComplaint(id) {

  const confirmDelete = confirm(
    "Are you sure you want to permanently delete this complaint?"
  );

  if (!confirmDelete) return;

  try {

    const res = await fetch(
      `http://localhost:5000/api/complaints/delete/${id}`,
      {
        method: "DELETE"
      }
    );

    const result = await res.json();

    if (!result.success) {
      alert(result.message || "Delete failed");
      return;
    }

    addAdminNotification("Complaint deleted");

    showAdminToast("Complaint deleted successfully");

    loadAllComplaints();

  } catch (err) {

    console.error(err);

    alert("Delete failed");
  }
}

/* ================= STATS ================= */

function updateStats(complaints) {

  let pending = 0;
  let resolved = 0;
  let escalated = 0;
  let rejected = 0;

  complaints.forEach(c => {

    const status =
      (c.status || "Pending").toLowerCase();

    if (status === "pending") pending++;
    if (status === "resolved") resolved++;
    if (status === "escalated") escalated++;
    if (status === "rejected") rejected++;
  });

  const statIds = [
    "adminTotalComplaints",
    "adminPendingComplaints",
    "adminResolvedComplaints",
    "adminEscalatedComplaints",
    "adminRejectedComplaints"
  ];

  statIds.forEach(id => {
    const el =
      document.getElementById(id);

    if (!el) return;

    const card =
      el.closest(".admin-dashboard__stat-card");

    if (!card) return;

    card.classList.remove("animate");

    void card.offsetWidth;

    card.classList.add("animate");
  });

    document.getElementById("analyticsTotalComplaints").textContent = complaints.length;
    document.getElementById("analyticsPendingComplaints").textContent = pending;
    document.getElementById("analyticsResolvedComplaints").textContent = resolved;
    document.getElementById("analyticsEscalatedComplaints").textContent = escalated;
    document.getElementById("analyticsRejectedComplaints").textContent = rejected;
}

/* ================= MODAL ================= */

function viewComplaint(c) {

  const modal =
    document.getElementById("adminComplaintModal");

  const content =
    document.getElementById("adminModalContent");

  const status = c.status || "Pending";

  content.innerHTML = `
    <div class="admin-dashboard__modal-header">
      <h2>Complaint Details</h2>
      <span class="admin-dashboard__status admin-dashboard__status--${status.toLowerCase()}">
        ${status}
      </span>
    </div>

    <div class="admin-dashboard__modal-grid">

      <div>
        <label>Complaint ID</label>
        <p>${c._id || "N/A"}</p>
      </div>

      <div>
        <label>User Email</label>
        <p>${c.email || "---"}</p>
      </div>

      <div>
        <label>Category</label>
        <p>${c.category || "---"}</p>
      </div>

      <div>
        <label>Priority</label>
        <p>${c.priority || "Normal"}</p>
      </div>

      <div>
        <label>Date / Time</label>
        <p>${new Date(c.createdAt || Date.now()).toLocaleString()}</p>
      </div>

      <div>
        <label>Customer ID</label>
        <p>${c.customerId || c.customerID || "---"}</p>
      </div>

    </div>

        <div class="admin-dashboard__modal-description">
      <label>Description</label>
      <p>
        ${
          c.description ||
          c.issueDescription ||
          c.message ||
          c.complaintText ||
          c.details ||
          "No description available"
        }
      </p>
    </div>

    <div class="admin-dashboard__modal-actions">

      <button
        class="admin-dashboard__btn-resolve"
        onclick="updateComplaintStatus('${c._id}', 'Resolved'); closeAdminModal();">
        Resolve
      </button>

      <button
        class="admin-dashboard__btn-escalate"
        onclick="updateComplaintStatus('${c._id}', 'Escalated'); closeAdminModal();">
        Escalate
      </button>

      <button
        class="admin-dashboard__btn-reject"
        onclick="updateComplaintStatus('${c._id}', 'Rejected'); closeAdminModal();">
        Reject
      </button>

    </div>
  `;

  modal.style.display = "flex";
}

function closeAdminModal() {
  document.getElementById("adminComplaintModal").style.display = "none";
}

document
  .getElementById("adminComplaintModal")
  .addEventListener("click", function(e) {
    if (e.target.id === "adminComplaintModal") {
      closeAdminModal();
    }
  });

/* ================= SEARCH + FILTER ================= */

document
  .getElementById("adminSearchInput")
  .addEventListener("input", filterComplaints);

document
  .getElementById("adminStatusFilter")
  .addEventListener("change", filterComplaints);

function filterComplaints() {

  const search =
    document.getElementById(
      "adminSearchInput"
    ).value.toLowerCase();

  const dropdownStatus =
    document.getElementById(
      "adminStatusFilter"
    ).value;

  const filtered = allComplaints.filter(c => {

    const complaintStatus =
      c.status || "Pending";

    const matchSearch =
      String(c._id).toLowerCase().includes(search) ||
      String(c.category).toLowerCase().includes(search) ||
      String(c.email).toLowerCase().includes(search);

    const matchDropdown =
      dropdownStatus === "All" ||
      complaintStatus === dropdownStatus;

    const matchTab =
      currentAdminStatus === "All" ||
      complaintStatus === currentAdminStatus;

    return (
      matchSearch &&
      matchDropdown &&
      matchTab
    );
  });

  renderComplaints(filtered);
}
 
function showAdminToast(message) {

  const toast =
    document.getElementById("adminToast");

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* ================= SOCKET EVENTS ================= */

socket.on("newComplaint", complaint => {

  addAdminNotification(
    `New complaint submitted: ${complaint.category}`
  );

  showAdminToast(
    `New complaint: ${complaint.category}`
  );

  loadAllComplaints();
});

socket.on("complaintUpdated", complaint => {

  addAdminNotification(
    `Complaint updated: ${complaint.status}`
  );

  loadAllComplaints();
});

socket.on("complaintDeleted", complaint => {

  addAdminNotification(
    "Complaint deleted"
  );

  loadAllComplaints();
});

window.filterByStatus = function(status, event) {

  currentAdminStatus = status;

  document
    .querySelectorAll(".admin-dashboard__status-tabs button")
    .forEach(btn =>
      btn.classList.remove("active")
    );

  if (event) {
    event.target.classList.add("active");
  }

  filterComplaints();
};

function exportComplaintsCSV() {
  if (!allComplaints.length) {
    alert("No complaints available to export");
    return;
  }

  const headers = [
    "Complaint ID",
    "User Email",
    "Category",
    "Status",
    "Priority",
    "Date"
  ];

  const rows = allComplaints.map(c => [
    c._id || "",
    c.email || "",
    c.category || "",
    c.status || "Pending",
    c.priority || "Normal",
    new Date(c.createdAt || Date.now()).toLocaleString()
  ]);

  let csvContent =
    headers.join(",") +
    "\n" +
    rows.map(row => row.map(value => `"${value}"`).join(",")).join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "complaints-report.csv";
  a.click();

  URL.revokeObjectURL(url);
}

const adminThemeSelect = document.getElementById("adminThemeSelect");

if (localStorage.getItem("adminDarkMode") === "true") {
  document.body.classList.add("admin-dashboard-dark");
  adminThemeSelect.value = "dark";
}

adminThemeSelect?.addEventListener("change", () => {
  if (adminThemeSelect.value === "dark") {
    document.body.classList.add("admin-dashboard-dark");
    localStorage.setItem("adminDarkMode", "true");
  } else {
    document.body.classList.remove("admin-dashboard-dark");
    localStorage.setItem("adminDarkMode", "false");
  }
});

function showAdminSection(section, event) {
  document
    .querySelectorAll(".admin-dashboard__page")
    .forEach(page => page.classList.remove("active"));

  document
    .querySelectorAll(".admin-dashboard__sidebar a")
    .forEach(link => link.classList.remove("active"));

  document
    .getElementById(section + "Page")
    .classList.add("active");

  if (event && event.target.tagName === "A") {
    event.target.classList.add("active");
  }
}

function toggleAdminSettingsMenu() {
  const menu = document.getElementById("adminSettingsMenu");

  if (!menu) return;

  menu.style.display =
    menu.style.display === "block" ? "none" : "block";
}

function changeAdminThemeFromToggle() {
  const toggle = document.getElementById("adminDarkModeToggle");

  if (!toggle) return;

  if (toggle.checked) {
    document.body.classList.add("admin-dashboard-dark");
    localStorage.setItem("adminDarkMode", "true");
  } else {
    document.body.classList.remove("admin-dashboard-dark");
    localStorage.setItem("adminDarkMode", "false");
  }
}

function changeAdminNotificationSetting() {
  const toggle = document.getElementById("adminNotificationToggle");
  const notifIcon = document.querySelector(".admin-dashboard__right .admin-dashboard__icon");
  const notifCount = document.getElementById("adminNotifCount");
  const notifList = document.getElementById("adminNotifList");

  if (!toggle) return;

  localStorage.setItem(
    "adminNotificationsEnabled",
    toggle.checked ? "true" : "false"
  );

  if (notifIcon) {
    notifIcon.style.opacity = toggle.checked ? "1" : "0.45";
  }

  if (!toggle.checked) {
    adminNotifCount = 0;

    if (notifCount) notifCount.textContent = "0";

    if (notifList) {
      notifList.innerHTML =
        `<div class="admin-dashboard__dropdown-item">Notifications are turned off</div>`;
    }

    localStorage.setItem("adminNotifCount", "0");
  } else {
    if (notifList) {
      notifList.innerHTML =
        `<div class="admin-dashboard__dropdown-item">No notifications yet</div>`;
    }
  }
}

function loadAdminSettings() {
  const darkToggle = document.getElementById("adminDarkModeToggle");
  const notifToggle = document.getElementById("adminNotificationToggle");

  const sidebarEmail = document.getElementById("sidebarAdminEmail");
  const sidebarId = document.getElementById("sidebarAdminId");

  const loggedAdmin = JSON.parse(localStorage.getItem("admin")) || {};

  const adminEmail =
    loggedAdmin.email ||
    loggedAdmin.emailId ||
    loggedAdmin.adminEmail ||
    loggedAdmin.registeredEmail ||
    loggedAdmin.registeredEmailId ||
    "---";

  const adminCustomerId =
    loggedAdmin.customerId ||
    loggedAdmin.customerID ||
    loggedAdmin.adminId ||
    loggedAdmin.AdminID ||
    loggedAdmin.id ||
    "---";

  if (sidebarEmail) {
    sidebarEmail.textContent = adminEmail;
  }

  if (sidebarId) {
    sidebarId.textContent = adminCustomerId;
  }

  if (darkToggle) {
    darkToggle.checked =
      localStorage.getItem("adminDarkMode") === "true";

    if (darkToggle.checked) {
      document.body.classList.add("admin-dashboard-dark");
    } else {
      document.body.classList.remove("admin-dashboard-dark");
    }
  }

  if (notifToggle) {
    notifToggle.checked =
      localStorage.getItem("adminNotificationsEnabled") !== "false";

    changeAdminNotificationSetting();
  }
}

/* ================= LOGOUT ================= */

function adminLogout() {
  localStorage.removeItem("admin");
  localStorage.removeItem("role");
  localStorage.removeItem("adminNotifCount");
  localStorage.removeItem("adminNotifications");

  window.location.href = "login.html";
}