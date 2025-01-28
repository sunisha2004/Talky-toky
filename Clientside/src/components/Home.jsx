import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlinePlus } from "react-icons/ai"; // Import the add-chat icon
import api from "../api/ApiConfig";
import '../scss/Home.scss';

const Home = ({ setProfile, name }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        navigate("/login");
      } else {
        try {
          const response = await axios.get(`${api}/getUser`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProfile(response.data.profile);
        } catch (error) {
          console.error("Error fetching profile:", error);
          navigate("/login");
        }
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${api}/getRecievers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        {users
        .filter((i)=>i.name?.toLowerCase().includes(name?.toLowerCase() || ""))
        .map((user, index) => (
          <div
            className="user-card"
            key={index}
            onClick={() => {
              navigate(`/chatPage/${user.id}`);
            }}
          >
            <img
              className="user-profile"
              src={user.profile || "/default-profile.png"}
              alt={user.name}
            />
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="last-message">
                {user.lastmsg || "No messages"}
              </div>
            </div>
            <div className="message-info">
              {user.count > 0 && (
                <span className="unread-count">{user.count}</span>
              )}
              <div className="last-message-time">
                {user.lastmsgtime
                  ? new Date(user.lastmsgtime).toLocaleTimeString("en-US", {
                      hour12: true,
                    })
                  : ""}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Chat Button */}
      <button
        className="add-chat-button"
        onClick={() => navigate("/addChat")}
        title="Add Chat"
      >
        <AiOutlinePlus size={24} />
      </button>
    </div>
  );
};

export default Home;
