console.log("JS LOADED");

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const customerId = document.getElementById("customerId").value.trim();
  const password = document.getElementById("password").value;

  try {

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        email,
        customerId,
        password
      })
    });

    const data = await res.json();

    console.log("Response:", data);

    // ✅ LOGIN SUCCESS
    if (res.ok) {

      alert("Login Successful");

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "role",
        data.role
      );

      // =============================
      // ADMIN LOGIN
      // =============================
      if (data.role === "admin") {

        localStorage.setItem(
          "admin",
          JSON.stringify({
            name:
              data.user.name ||
              "Admin",

            email:
              data.user.email ||
              data.user.emailId,

            adminId:
              data.user.adminId ||
              data.user.customerId ||
              data.user.customerID
          })
        );

        window.location.href =
          "adminDashboard.html";

      } else {

        window.location.href =
          "userDashboard.html";
      }

    } else {

      alert(
        data.message ||
        "Invalid login credentials"
      );
    }

  } catch (err) {

    console.error("ERROR:", err);

    alert(
      "Server error - backend not running?"
    );
  }
});

function forgotPassword() {
  document.getElementById("forgotModal").classList.add("active");
}

function closeForgotModal() {
  document.getElementById("forgotModal").classList.remove("active");
  document.getElementById("forgotMsg").innerText = "";
  document.getElementById("otpSection").style.display = "none";
}

async function sendResetOtp() {
  const email = document.getElementById("forgotEmail").value.trim().toLowerCase();
  const msg = document.getElementById("forgotMsg");

  if (!email) {
    msg.innerText = "Please enter your registered email";
    msg.style.color = "red";
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (res.ok) {
      msg.innerText = data.message || "OTP sent successfully";
      msg.style.color = "green";
      document.getElementById("otpSection").style.display = "block";
    } else {
      msg.innerText = data.message || "Email not found";
      msg.style.color = "red";
    }

  } catch (err) {
    console.error(err);
    msg.innerText = "Server error - backend not running?";
    msg.style.color = "red";
  }
}

async function resetPassword() {
  const email = document.getElementById("forgotEmail").value.trim().toLowerCase();
  const otp = document.getElementById("resetOtp").value.trim();
  const newPassword = document.getElementById("newPassword").value;
  const msg = document.getElementById("forgotMsg");

    if (newPassword.length < 6) {

      msg.innerText =
        "Password must be at least 6 characters";

      msg.style.color = "red";

      return;
    }

  try {
    const res = await fetch("http://localhost:5000/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        otp,
        newPassword
      })
    });

    const data = await res.json();

    if (res.ok) {
      msg.innerText = data.message || "Password reset successful";
      msg.style.color = "green";
document.getElementById("otpSection").style.display = "none";

    setTimeout(() => {

      closeForgotModal();

    }, 1500);

    } else {
      msg.innerText = data.message || "Invalid OTP";
      msg.style.color = "red";
    }

  } catch (err) {
    console.error(err);
    msg.innerText = "Server error - backend not running?";
    msg.style.color = "red";
  }
}