const User = require("../../models/userModel");

exports.register = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    const token = user.getSignedJwtToken();
    res.status(200).json({ success: true, token });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide an email and password", 400)
      );
    }

    const user = await User.findOne({ email }).select("+password");
    console.log(user);

    if (!user) {
      return next(new ErrorResponse("Invalid Credentials", 401));
    }

    const isMatch = await user.matchPassword(password);
    console.log(isMatch);
    if (!isMatch) {
      return next(new ErrorResponse("Invalid Credentials", 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
  });
};

exports.allUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
  } catch (error) {
    next(error);
  }
};
