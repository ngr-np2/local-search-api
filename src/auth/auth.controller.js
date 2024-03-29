const ERROR = require("../utils/Error");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { REFRESH_SEC, JWT_SEC } = require("../config/secrets");
const sendEMail = require("../helper/sendEmail");
const TokenModel = require("../models/token");
const crypto = require("crypto");
const register = async (req, res, next) => {
  const { firstName, lastName, userName, email, phone, password } = req.body;

  if (!userName) {
    return next(ERROR(400, "Choose Username name!!!"));
  }
  if (!firstName) {
    return next(ERROR(400, "enter your First name!!!"));
  }
  if (!lastName) {
    return next(ERROR(400, "enter your Last name!!!"));
  }
  if (!email) {
    return next(ERROR(400, "email is required!!!"));
  }
  if (!phone) {
    return next(ERROR(400, "enter your Phone Number!!!"));
  }
  if (!password) {
    return next(ERROR(400, "enter strong password!!!"));
  }
  try {
    const userFound = await User.findOne({
      $or: [{ email }, { phone }],
    });
    if (userFound?.userName === userName) {
      return next(ERROR(409, `${userName} Username is already Taken!`));
    }
    if (userFound?.email === email) {
      return next(ERROR(409, "Email is already registered!"));
    }
    if (userFound?.phone === phone) {
      return next(ERROR(409, "Phone number is already registered!"));
    }
    if (!userFound) {
      const salt = bcrypt.genSaltSync(5);
      const hash = bcrypt.hashSync(password, salt);
      const createUser = new User({
        firstName,
        lastName,
        userName,
        email,
        phone,
        password: hash,
      });
      await createUser.save();
      res.status(201).json({
        message: " 🎇 🎇 🎉 Account created successfully!",
      });
    }
  } catch (err) {
    next(err);
  }
};
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return next(ERROR(400, "enter your email!!"));
  }
  if (!password) {
    return next(ERROR(400, "enter your password!!"));
  }
  try {
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return next(ERROR(400, "Wrong Credentials!!!"));
    }
    if (userFound.status === "false") {
      const email = userFound.email;
      const length = 6;
      const verificationCode = crypto
        .randomBytes(Math.ceil(length / 2))
        .toString("hex")
        .slice(0, length);

      await sendEMail(next, verificationCode, email);
      const saveToken = new TokenModel({
        user: userFound._id,
        token: verificationCode,
      });
      await saveToken.save();
      return res.status(201).json({
        message:
          "A verification code has been sent to your email. Please check your inbox.",
        id: userFound._id,
      });
    }
    if (userFound) {
      const matchPassword = await bcrypt.compare(password, userFound.password);
      if (!matchPassword) {
        return next(ERROR(401, "Wrong Credentials!!!"));
      }
      if (matchPassword) {
        const accessToken = jwt.sign(
          {
            id: userFound._id,
            userName: userFound.userName,
            email: userFound.email,
            phone: userFound.phone,
            role: userFound.role,
          },
          JWT_SEC,
          { expiresIn: "1h" }
        );
        const refreshToken = jwt.sign(
          {
            id: userFound._id,
            role: userFound.role,
          },
          REFRESH_SEC,
          { expiresIn: "2m" }
        );
        userFound.refreshToken = refreshToken;
        const result = await userFound.save();
        const userName = result.userName;

        res
          .cookie("jwt", refreshToken, {
            httpOnly: true,
            maxAge: 2 * 60 * 1000,
          })
          .status(200)
          .json({
            message: `welcome Back ${userName}`,
            userName,
            accessToken,
          });
      }
    }
  } catch (err) {
    next(err);
  }
};
const verifyOtp = async (req, res, next) => {
  const { id, otp } = req.body;
  if (!id) return next(ERROR(400, "id not found!"));
  if (!otp) return next(ERROR(400, "enter you verification code!"));
  try {
    const isUserIdFound = await TokenModel.findOne({ user: id });
    console.log(isUserIdFound);
    if (!isUserIdFound) return next(ERROR(404, "user not found"));
    if (isUserIdFound.token !== otp) return next(Error(409));
    if (isUserIdFound.token === otp) {
      await User.findByIdAndUpdate(id, { status: "true" });
    }
    res.status(200).json({ message: "Account Verifyed successfully!" });
  } catch (err) {
    next(err);
  }
};
module.exports = { register, login, verifyOtp };
