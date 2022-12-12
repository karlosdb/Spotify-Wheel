

document.getElementById('submit-login').addEventListener('click', (event) => {
  window.location.href = 'dashboard';
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