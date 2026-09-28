// ✅ WAIT FOR DOM TO LOAD
document.addEventListener("DOMContentLoaded", function () {

    console.log("✅ register.js loaded");

    const form = document.getElementById("registerForm");

    if (!form) {
        console.error("❌ registerForm not found in HTML");
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        console.log("✅ Form submission triggered");

        // 🔹 GET VALUES
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();

        // ✅ accountNumber removed
        const customerId = document.getElementById("customerId").value.trim();

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // 🔹 REQUIRED CHECK
        if (!name || !email || !customerId || !password || !confirmPassword) {
            alert("⚠️ All fields are required!");
            return;
        }

        // 🔹 PASSWORD MATCH CHECK
        if (password !== confirmPassword) {
            alert("❌ Passwords do not match!");
            return;
        }

        try {

            const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },

                // ✅ accountNumber removed
                body: JSON.stringify({
                    name,
                    email,
                    customerId,
                    password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert("❌ " + (data.message || "Registration failed"));
                return;
            }

            console.log("✅ Registration Success:", data);

            alert("✅ Account created successfully!");

            // 🔹 REDIRECT TO LOGIN
            window.location.href = "login.html";

        } catch (error) {

            console.error("Register error:", error);

            alert("⚠️ Server not connected. Please start backend.");
        }
    });

});