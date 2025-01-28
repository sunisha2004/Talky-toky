import { useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import Login from './components/Login'
import Register from './components/Register';
import VerifyEmail from './components/VerifyEmail';
import EmailNotification from './components/EmailNotification';
import Nav from './components/Nav';
import Home from './components/Home';
import Profile from './components/Profile';
import AddChat from './components/AddChat';
import ChatPage from './components/ChatPage';


function App() {
  const [profile, setProfile] = useState(null);
  const [name,setName]=useState("")
  const location = useLocation(); 
  const isChatPage = location.pathname.startsWith("/chatPage");


  return (
    <>
      {profile && !isChatPage && <Nav profile={profile} setName={setName} />}
      <Routes>
      <Route path="/" element={<Home setProfile={setProfile} name={name} />} />
      <Route path="/profile" element={<Profile />} />

    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/verifyEmail" element={<VerifyEmail />} />
    <Route path="/emailNotification" element={<EmailNotification />} />
    <Route path="/addChat" element={<AddChat />} />
    <Route path="/chatPage/:id" element={<ChatPage />} />



    </Routes>
      
    </>
  )
}

function WrappedApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default WrappedApp;

