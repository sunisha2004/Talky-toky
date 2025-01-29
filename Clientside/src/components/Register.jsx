import React, { useState } from "react";
import axios from "axios";
import "../scss/Register.scss";
import api from "../api/ApiConfig";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const email = localStorage.getItem("email"); // Get email from localStorage

  // Convert file to Base64
  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle profile photo change
  const handleProfilePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const base64 = await convertBase64(file);
      setProfilePhoto(base64);
    }
  };

  // Password validation function
  const validatePassword = (password) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validatePassword(password)) {
      alert("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const data = {
      profile: profilePhoto,
      username,
      email,
      phone,
      pwd: password,
      cpwd: confirmPassword,
    };

    try {
      const response = await axios.post(`${api}/adduser`, data);
      console.log(response.data);
      alert("Registration successful!");
      localStorage.removeItem("email");
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h1 className="title">Register</h1>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            {profilePhoto && (
              <img
                src={profilePhoto}
                alt="Profile Preview"
                className="profile-preview"
              />
            )}
            <label htmlFor="profile-photo">Profile Photo</label>
            <input
              type="file"
              id="profile-photo"
              accept="image/*"
              onChange={handleProfilePhotoChange}
            />
          </div>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email || ""}
              disabled
              placeholder="Email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your 10-digit phone number"
              pattern="[0-9]{10}"
              maxLength="10"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>
          <button type="submit" className="register-button">
            Register
          </button>
        </form>
        <div className="login-link">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="login-link-text">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
