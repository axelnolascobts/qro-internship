document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const lastname = document.getElementById("lastname").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const birthdate = document.getElementById("birthdate").value;
  const address = document.getElementById("address").value.trim();
  const role = document.getElementById("role").value;

  // Clear previous errors
  ["name", "lastname", "email", "password", "birthdate", "address"].forEach(field => {
    document.getElementById(field + "Error").textContent = "";
  });

  // Validation
  let hasError = false;

  if (!name) {
    document.getElementById("nameError").textContent = "First name is required";
    hasError = true;
  }

  if (!lastname) {
    document.getElementById("lastnameError").textContent = "Last name is required";
    hasError = true;
  }

  if (!email) {
    document.getElementById("emailError").textContent = "Email is required";
    hasError = true;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("emailError").textContent = "Invalid email format";
    hasError = true;
  }

  if (!password) {
    document.getElementById("passwordError").textContent = "Password is required";
    hasError = true;
  } else if (password.length < 6) {
    document.getElementById("passwordError").textContent = "Password must be at least 6 characters";
    hasError = true;
  }

  if (!birthdate) {
    document.getElementById("birthdateError").textContent = "Birth date is required";
    hasError = true;
  }

  if (!address) {
    document.getElementById("addressError").textContent = "Address is required";
    hasError = true;
  }

  if (hasError) return;

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, lastname, email, password, birthdate, address, role })
    });

    const data = await response.json();

    if (response.ok) {
      setToken(data.token);
      setUser(data.user);
      showMessage("message", "Registration successful! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "/catalog";
      }, 1000);
    } else {
      showMessage("message", data.error || "Registration failed");
    }
  } catch (error) {
    console.error("Registration error:", error);
    showMessage("message", "An error occurred. Please try again.");
  }
});
