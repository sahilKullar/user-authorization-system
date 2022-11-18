const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user");

// eslint-disable-next-line consistent-return
exports.signup = async (req, res) => {
  try {
    // validate the user data
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // get the user data
    const { firstName, lastName, username, email, password } = req.body;

    // check if the user exists in the database
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    // hash the password
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(password, salt);

    // create an user object
    const user = await User.create({
      firstName,
      lastName,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // create the user token
    user.token = jwt.sign(
      {
        // eslint-disable-next-line no-underscore-dangle
        userId: user._id,
        email,
      },
      process.env.TOKEN_SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );
    res.status(201).send(user);
  } catch (error) {
    console.log(error);
  }
};
