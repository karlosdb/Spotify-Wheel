

document.getElementById('submit-login').addEventListener('click', (event) => {
  event.preventDefault();
  const loginForm = document.getElementById("login-form");
  if(document.getElementById("submit-login").value === "Register") {
    if (document.getElementById("password").value.length < 5) {
      alert("password too short, choose a password longer than 5 characters long");
    }
    else if (document.getElementById("password").value === document.getElementById("confirm-password").value) {
      loginForm.requestSubmit();
    }
    else {
      alert("passwords don't match");
    }
  }
  else {
    loginForm.requestSubmit();
  }
});

document.getElementById("show-password").addEventListener('click', (event) => {
  const passwordField = document.getElementById("password");
  passwordField.type = (passwordField.type === "password") ? "text": "password";
  document.getElementById("show-password").classList.toggle('bi-eye');
});

document.getElementById("is-registering").addEventListener('click', (event) => {
  document.getElementById("confirm-password").classList.toggle("hidden");
  const passwordField = document.getElementById("password");
  const submitLogin = document.getElementById("submit-login");
  if (submitLogin.value === "Log In") {
    document.getElementById("login-form").action = "register";
    submitLogin.value = "Register";
    passwordField.autocomplete = "new-password";
  }
  else {
    document.getElementById("login-form").action = "login";
    submitLogin.value = "Log In";
    passwordField.autocomplete = "current-password";
  }
});