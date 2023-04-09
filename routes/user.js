const express = require("express");
const User = require("../models/User");

const jwt = require("jsonwebtoken");

const router = express.Router();

const backendRoutes = {
  createUser: "/create-user",
  updateUser: "/update-user",
  getUser: "/get-user",
  deleteUser: "/delete-user",
  authenticateUser: "/authenticate-user",
  verifyUser: "/verify-user",
};

const JWT_SECRET = process.env.JWT_SECRET;

//* Create User
router.post(backendRoutes.createUser, async (req, res) => {
  const userDetails = req.body;

  try {
    const response = await User.findOne({ email: userDetails.email });
    if (response) {
      res.status(400).send({ success: true, message: "User already exists." });
      return;
    }

    const newUser = await User.create({
      ...userDetails,
    });
    res.status(200).send({ success: true, data: newUser });
    return;
  } catch (errors) {
    console.error(errors);
    res.status(400).send({ success: false, errors: errors });
    return;
  }
});

//* Get User
router.post(backendRoutes.getUser, async (req, res) => {
  const token = req.header("auth-token");
  if (!token) {
    res
      .status(400)
      .send({ success: false, message: "User not authenticated." });
    return;
  }

  const data = jwt.verify(token, JWT_SECRET);
  if (data.expires < Date.now()) {
    res.status(400).send({
      success: false,
      message: "Authentication expired, Login again.",
    });
    return;
  }

  try {
    const response = await User.findOne({ email: data.user._doc.email });
    if (!response) {
      res.status(400).send({ success: false, message: "User does not exist." });
      return;
    }

    res.status(200).send({ success: true, data: response });
    return;
  } catch (errors) {
    console.error(errors);
    res.status(400).send({ success: false, errors: errors });
    return;
  }
});

//* Verify User
router.post(backendRoutes.verifyUser, async (req, res) => {
  const email = req.body.email;
  // const deviceUID = req.body.deviceUID;
  try {
    const response = await User.findOne({ email: email });
    if (!response) {
      res.status(400).send({ success: false, message: "User does not exist." });
      return;
    }

    // if(deviceUID !== response.deviceUID) {
    //   res.status(400).send({ success: false, message: "Request sent from unauthorized device." });
    // }

    const date = new Date();

    if(response.expires < date) {
      res.status(400).send({ success: false, message: "Authentication expired." });
      return;
    }
    const data = {
      user: {
        ...response,
      },
    };
    const authToken = jwt.sign(data, JWT_SECRET);

    res.status(200).send({ success: true, data: { authToken } });
    return;
  } catch (errors) {
    console.error(errors);
    res.status(400).send({ success: false, errors: errors });
    return;
  }
});

//* Authenticate User
router.patch(backendRoutes.authenticateUser, async (req, res) => {
  const email = req.body.email;

  try {
    const response = await User.findOne({ email: email });
    if (!response) {
      res.status(400).send({ success: false, message: "User does not exist." });
      return;
    }

    var ms = new Date().getTime() + 86400000;
    var tomorrow = new Date(ms);

    const authenticatedUser = await User.findOneAndUpdate(
      { email: email },
      { expires: tomorrow },
      { new: true }
    );

    res.status(200).send({ success: true, data: { authenticatedUser } });
    return;
  } catch (errors) {
    console.error(errors);
    res.status(400).send({ success: false, errors: errors });
    return;
  }
});

// //* Update User
// router.patch(backendRoutes.updateUser, async (req, res) => {
//   const { profilePictureData, ...userDetails } = req.body;
//   let profilePictureResponse = "";

//   try {
//     const user = await User.findOne({ authID: userDetails.authID });
//     if (!user) {
//       res.status(400).send({ success: false, message: "User does not exist." });
//       return;
//     }

//     if (profilePictureData) {
//       const profilePictureBuffer = Buffer.from(
//         profilePictureData.split(",")[1],
//         "base64"
//       );
//       profilePictureResponse = await ProfilePicture.replaceImage(
//         userDetails.authID,
//         user.profilePictureLink,
//         profilePictureBuffer
//       );
//     }

//     const response = await User.findOneAndUpdate(
//       { authID: userDetails.authID },
//       {
//         ...userDetails,
//         profilePictureLink: profilePictureResponse
//           ? profilePictureResponse
//           : undefined,
//       },
//       { new: true }
//     );
//     if (!response) {
//       res.status(400).send({ success: false, message: "User does not exist." });
//       return;
//     }
//     const updatedUser = response;
//     res.status(200).send({ success: true, data: updatedUser });
//     return;
//   } catch (errors) {
//     console.error(errors);
//     res.status(400).send({ success: false, errors: errors });
//     return;
//   }
// });

// //* Delete User
// router.delete(backendRoutes.createUser, async (req, res) => {
//   const authID = req.body.authID;

//   try {
//     const user = await User.findOne({ authID: authID });
//     if (!user) {
//       res.status(400).send({ success: false, message: "User does not exist." });
//       return;
//     }

//     await ProfilePicture.deleteImage(user.profilePictureLink);

//     const response = await User.findOneAndDelete({ authID: authID });
//     const deletedUser = response;
//     res.status(200).send({ success: true, data: deletedUser });
//     return;
//   } catch (errors) {
//     console.error(errors);
//     res.status(400).send({ success: false, errors: errors });
//     return;
//   }
// });

module.exports = router;
