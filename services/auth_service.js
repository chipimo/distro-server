const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { registerValidation, loginValidation } = require("../utils/validation");
const { createSecureToken, createRefreshToken } = require("../routes/token");
const { error_json, success_json } = require("../utils/helpers");

module.exports = class AuthService {
  static async login(credentials) {
    // check if data is valid
    const { error } = loginValidation(credentials);
    if (error) return error_json(400, "Email or Password invalid!");
    // return error_json(400, error.details[0].message);

    // Check if user exists
    const user = await User.findOne({ email: credentials.email });
    // console.log(user);
    if (!user) return error_json(400, "Email or Password invalid!");

    // check if password hash OK
    const result = await bcrypt.compare(credentials.password, user.password);
    if (!result) return error_json(400, "Email or Password invalid!");

    // create and assign JWT token
    const accessToken = createSecureToken(user._id);
    if (!accessToken) return error_json(500, "Error creating token");

    const refreshToken = createRefreshToken(user._id);
    if (!refreshToken) return error_json(500, "Error creating token");

    const userData = {
      id: user._doc._id,
      username: user._doc.username,
      email: user._doc.email,
      fullName: "",
      avatar: null,
      role: "admin",
      ability: [
        {
          action: "manage",
          subject: "all",
        },
      ],
    };

    // console.log(userData);

    const response = {
      userData,
      accessToken,
      refreshToken,
    };

    return success_json(200, response);
  }

  static async register(data) {
    // Check if data is valid
    const { error } = registerValidation(data);
    if (error) return error_json(400, error.details[0].message);

    // Check if user exists
    const usernameExist = await User.findOne({ username: data.username });
    const errorEmail = {
      email: null,
      username: "This username is already in use.",
    };
    if (usernameExist) return error_json(400, errorEmail);

    const emailExist = await User.findOne({ email: data.email });
    const errorUsername = {
      email: "This email is already in use.",
      username: null,
    };
    if (emailExist) return error_json(400, errorUsername);

    // check if passwords match
    // if (data.password !== data.confirm_password)
    //     return error_json(400, "Passwords doesn't match");

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Create and save the user
    const user = new User({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role: "admin",
      releases: {
        music: { single: [] },
        videos: { single: [] },
        temp: {
          list: []
        },
      }
    });

    const userData = {
      username: data.username,
      email: data.email,
      fullName: "",
      avatar: null,
      role: "admin",
      ability: [
        {
          action: "manage",
          subject: "all",
        },
      ],
    };

    var registeredUser = await user.save();
    if (!registerValidation)
      return error_json(500, "Error registering user ... please try again");

    var privateKey = process.env.PRIVATE_KEY;

    const accessToken = jwt.sign({ id: user._id }, privateKey, {
      expiresIn: "12h",
    });
    const userInfo = Object.assign({}, userData);
    const response = { userInfo, accessToken };

    // console.log(response);

    return success_json(200, response);
  }
};
