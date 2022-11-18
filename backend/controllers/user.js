const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { encrypt, decrypt } = require("../utils/confirmation");
const { User, validate } = require("../models/user");

const { OAuth2 } = google.auth;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.OAUTH_CLIENT_ID,
    process.env.OAUTH_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.OAUTH_REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject();
      }
      resolve(token);
    });
  });

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.GMAIL_EMAIL,
      accessToken,
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
  });
};

const sendEmail = async ({ email, username, res }) => {
  // Create a unique confirmation token
  const confirmationToken = encrypt(username);
  const apiUrl = process.env.API_URL || "http://0.0.0.0:4000";

  // Initialize the Nodemailer with your Gmail credentials
  const Transport = await createTransporter();

  // Configure the email options
  const mailOptions = {
    from: "User Authorization System",
    to: email,
    subject: "Email Confirmation",
    html: `Press the following link to verify your email: <a href=${apiUrl}/api/confirmation/${confirmationToken}>Verification Link</a>`,
  };

  // Send the email
  await Transport.sendMail(mailOptions, (error, response) => {
    if (error) {
      res.status(400).send(error);
    } else {
      res.status(201).json({
        message: "Account created successfully, please verify your email.",
      });
    }
  });
};

// eslint-disable-next-line consistent-return
exports.verifyEmail = async (req, res) => {
  try {
    // Get the confirmation token
    const { confirmationToken } = req.params;

    // Decrypt the username
    const username = decrypt(confirmationToken);

    // Check if there is anyone with that username
    const user = await User.findOne({ username: username });

    if (user) {
      // If there is anyone, mark them as confirmed account
      user.isConfirmed = true;
      await user.save();

      // Return the created user data
      res
        .status(201)
        .json({ message: "User verified successfully", data: user });
    } else {
      return res.status(409).send("User Not Found");
    }
  } catch (err) {
    console.error(err);
    return res.status(400).send(err);
  }
};

exports.signup = async (req, res) => {
  try {
    // Validate the user data
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Get the user data
    const { firstName, lastName, username, email, password } = req.body;

    // Check if the user exists in the database
    const emailExists = await User.findOne({ email, username });
    const usernameExists = await User.findOne({ username });
    if (emailExists) {
      return res.status(409).send("Email Already Exist. Please Login");
    }
    if (usernameExists) {
      return res.status(409).send("Username Already Exist. Please Login");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a user object
    const user = await User.create({
      firstName,
      lastName,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Create the user token
    user.token = jwt.sign(
      // eslint-disable-next-line no-underscore-dangle
      { userId: user._id, email },
      process.env.TOKEN_SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );

    // Send the email verification link
    return sendEmail({ email, username, res });
  } catch (err) {
    console.error(err);
    return res.status(400).send(err.message);
  }
};
