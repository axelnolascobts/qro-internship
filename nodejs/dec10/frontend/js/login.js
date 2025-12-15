document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Clear previous errors
  document.getElementById("emailError").textContent = "";
  document.getElementById("passwordError").textContent = "";

  // Validation
  if (!email) {
    document.getElementById("emailError").textContent = "Email is required";
    return;
  }

  if (!password) {
    document.getElementById("passwordError").textContent = "Password is required";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      setToken(data.token);
      setUser(data.user);
      showMessage("message", "Login successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "/catalog";
      }, 1000);
    } else {
      showMessage("message", data.error || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    showMessage("message", "An error occurred. Please try again.");
  }
});
