import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api/ApiConfig";
import "../scss/ViewProfile.scss";
import { FaArrowLeft } from "react-icons/fa";

const ViewProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${api}/getReciever/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [id, token]);

  return (
    <div className="view-profile">
      {/* Navbar */}
      <div className="navbar">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <span className="title">Profile</span>
      </div>

      {/* Profile Details */}
      <div className="profile-container">
        {profile ? (
          <>
            <div className="profile-picture">
              <img
                src={
                  profile.profile ||
                  "https://randomuser.me/api/portraits/men/1.jpg"
                }
                alt="Profile"
              />
            </div>
            <div className="profile-info">
              <h3 className="profile-name">{profile.username}</h3>
              <div className="profile-detail">
                {/* <strong>Email:</strong> */}
                <p>{profile.email}</p>
              </div>
              <div className="profile-detail">
                {/* <strong>Phone:</strong> */}
                <p>{profile.phone || "Not available"}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="loading">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default ViewProfile;
