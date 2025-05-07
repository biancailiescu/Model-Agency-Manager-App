import React from "react";
import { useNavigate } from "react-router-dom";

function Login({
  inputUsername,
  inputPassword,
  handleUsernameChange,
  handlePasswordChange,
  fetchedUsernames,
  fetchedPasswords,
}) {
  const navigate = useNavigate();

  const checkCredentials = () => {
    const usernameMatchFound = fetchedUsernames.some(
      (username) => username.Mail === inputUsername
    );
    const passwordMatchFound = fetchedPasswords.some(
      (password) => password.Parola === inputPassword
    );

    if (usernameMatchFound && passwordMatchFound) {
      localStorage.setItem("userEmail", inputUsername);
      navigate("/myaccount");
    } else {
      alert("Invalid username or password.");
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      <input
        type="text"
        value={inputUsername}
        onChange={handleUsernameChange}
        placeholder="Enter username"
        className="input-field"
      />
      <input
        type="password"
        value={inputPassword}
        onChange={handlePasswordChange}
        placeholder="Enter password"
        className="input-field"
      />
      <button onClick={checkCredentials} className="submit-button">
        Check Credentials
      </button>
    </div>
  );
}

export default Login;
