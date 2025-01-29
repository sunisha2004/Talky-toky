import userSchema from "./models/user.model.js"
import chatListSchema from "./models/chatList.model.js"
import chatSchema from "./models/chat.model.js"

import { io } from "./app.js";
import nodemailer from 'nodemailer'

import bcrypt from "bcrypt"
import pkg from "jsonwebtoken"

import crypto from 'crypto'

const secretKey = "a3f1b2c4d5e6f7g8h9i0j1k2l3m4n5o6"; // Ensure it's 32 characters long

function encryptMessage(message) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(secretKey), iv);
  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

function decryptMessage(encryptedMessage) {
  const [iv, encrypted] = encryptedMessage.split(":");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(secretKey), Buffer.from(iv, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

const { sign } = pkg

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
         user: "sunishams2004@gmail.com",
         pass: "xgrj cojw wpfl stau",
       },
})


export async function addUser(req, res) {
    const { profile, username, email, phone, pwd, cpwd } = req.body;
    const user = await userSchema.findOne({ email });
    if (!user) {
      if (!(username && email && pwd && cpwd))
        return res.status(500).send({ msg: "fields are empty" });
      if (pwd !== cpwd) return res.status(500).send({ msg: "pass not match" });
      bcrypt
        .hash(pwd, 10)
        .then((hpwd) => {
          userSchema.create({profile, username, email, phone, pass: hpwd });
          res.status(201).send({ msg: "Successfull" });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send({ msg: "Error creating user." });
        });
    } else {
      res.status(500).send({ msg: "email already used" });
    }
  }



export async function verifyEmail(req, res) {
    const { email } = req.body
    // console.log(email);
    if (!email) {
      return res.status(500).send({ msg: "fields are empty" })
    }
    const user = await userSchema.findOne({ email })
    if (!user) {
      const info = await transporter.sendMail({
        from: "sunishams2004@gmail.com",
        to: email,
        subject: "verify",
        text: "VERIFY! your email",
        html: `
      <div class="page" style="width: 500px; height: 300px; display: flex; 
      align-items: center; justify-content: center; flex-direction: column;
      background-color: #f9f9f9; border-radius: 10px; padding: 20px;
      box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 20px;">
  <h2 style="font-size: 24px; color: #333; margin-bottom: 10px;">Verify Your Email</h2>
  <p style="font-size: 16px; color: #555; margin-bottom: 20px; text-align: center;">
    Please confirm your email address by clicking the button below.
  </p>
  <a href="http://localhost:5173/register" style="text-decoration: none;">
    <button style="padding: 10px 20px; border: none; border-radius: 25px; 
        background-color: #007BFF; color: white; font-size: 16px; 
        cursor: pointer; transition: background-color 0.3s ease;">
      Verify Email
    </button>
  </a>
</div>
`,
      })
      console.log("Message sent: %s", info.messageId)
      res.status(200).send({ msg: "Verificaton email sented" })
    } else {
      return res.status(500).send({ msg: "email exist" })
    
    }
}



export async function login(req, res) {
    const { email, pass } = req.body;
    if (!(email && pass))
      return res.status(500).send({ msg: "fields are empty" });
    const user = await userSchema.findOne({ email });
    if (!user) return res.status(500).send({ msg: "email doesn't exist" });
    const success = await bcrypt.compare(pass, user.pass);
    if (success !== true)
      return res.status(500).send({ msg: "email or password not exist" });
    const token = await sign({ UserID: user._id }, process.env.JWT_KEY, {
      expiresIn: "24h",
    });
    res.status(201).send({ token });
}

export async function getUser(req, res) {  
  const usr = await userSchema.findOne({ _id: req.user.UserID }); 
  res.status(200).send({ profile: usr.profile });
}


export async function getReciever(req, res) {
  try {
    const user = await userSchema.findOne({ _id: req.params.id});
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
}



export async function getUsers(req, res) {
  try {
    const users = await userSchema.find({ _id: { $ne: req.user.UserID } });
    res.status(200).send({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ message: "An error occurred while fetching users", error: error.message });
  }
}


export async function addMessage(req, res) {
  try {
    const { message, receiverID } = req.body;
    const time = new Date();
    const encryptedMessage = encryptMessage(message);

    const check = await chatListSchema.findOne({ senderID: req.user.UserID, receiverID });
    await chatSchema.create({ senderID: req.user.UserID, receiverID, message: encryptedMessage, time, seen: false });

    if (!check) {
      await chatListSchema.create({ senderID: req.user.UserID, receiverID });
      await chatListSchema.create({ senderID: receiverID, receiverID: req.user.UserID });
    }

    io.emit("newMessage", { senderID: req.user.UserID, receiverID, message, time });
    res.status(201).send({ msg: "Successful" });
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).send({ message: "An error occurred while adding message", error: error.message });
  }
}

export async function getMessages(req, res) {
  try {
    const sendmsg = await chatSchema.find({ senderID: req.user.UserID, receiverID: req.params.id });
    const receivemsg = await chatSchema.find({ senderID: req.params.id, receiverID: req.user.UserID });

    const messages = [...sendmsg, ...receivemsg].map(msg => ({
      ...msg._doc,
      message: decryptMessage(msg.message),
    }));

    messages.sort((a, b) => a.time - b.time);
    res.status(200).send({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send({ message: "An error occurred while fetching messages", error: error.message });
  }
}


export async function getRecievers(req, res) {
  try {
    const data = await chatListSchema.find({ senderID: req.user.UserID });
    const users = await Promise.all(
      data.map(async (item) => {
        const usr = await userSchema.findOne({ _id: item.receiverID });
        const lastmsg = await chatSchema.findOne({ senderID: item.receiverID, receiverID: req.user.UserID, seen: false }).sort({ time: -1 });
        const count = await chatSchema.countDocuments({ senderID: item.receiverID, receiverID: req.user.UserID, seen: false });

        return {
          id: usr._id,
          profile: usr?.profile || null,
          name: usr?.username || "Unknown",
          lastmsg: lastmsg ? decryptMessage(lastmsg.message) : "No new message !",
          lastmsgtime: lastmsg?.time || null,
          count: count,
        };
      })
    );
    res.status(200).send({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ message: "An error occurred while fetching users", error: error.message });
  }
}


export async function updateSeen(req, res) {
  try {
    const { senderID } = req.body;
    await chatSchema.updateMany({ senderID, receiverID: req.user.UserID }, { $set: { seen: true } });
    res.status(200).send({ msg: "Updated" });
  } catch (error) {
    console.error("Error updating seen status:", error);
    res.status(500).send({ message: "An error occurred while updating messages", error: error.message });
  }
}


export async function getProfile(req, res) {
  try {
    const data = await userSchema.findOne({_id: req.user.UserID});
    
    res.status(200).send({ data });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ message: "An error occurred while fetching users", error: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const {profile,username,email,phone,pass}=req.body    
    const update = await userSchema.updateOne({_id: req.user.UserID},{ $set: { profile, username, email, phone } });
    res.status(200).send({message:"Updated"});
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({ message: "An error occurred while fetching users", error: error.message });
  }
}