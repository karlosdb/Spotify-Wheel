window.onload = async (event) => {
  fetch("/authenticated").then((data) => {
    return data.json();
  }).then((data) => {
    console.log(window.location);
    if (!data.authenticated && window.location.pathname !== '/') {
      window.location.href = "/";
    }
  })
};


document.getElementById('submit-login').addEventListener('click', async (event) => {
  event.preventDefault();
  const loginForm = document.getElementById("login-form");
  if(document.getElementById("submit-login").value === "Register") {
    if (document.getElementById("password").value.length < 5) {
      alert("password too short, choose a password longer than 5 characters long");
    }
    else if (document.getElementById("password").value === document.getElementById("confirm-password").value) {
      const response = await fetch("/api/checkUsername", {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
          username: document.getElementById("username").value,
        })
      });
      if (response.ok) {
        const is_valid = await response.json();
        if (is_valid.success) {
          alert("successfully registered, please login now");
          loginForm.requestSubmit();
        }
        else {
          alert("username taken");
        }
      }
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