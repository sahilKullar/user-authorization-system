const router = require("express").Router(); // get the router instance from express
const userController = require("../controllers/user"); // get all the exported functions from the user controller

// match the signup request to the signup function
router.post("/signup", userController.signup);

module.exports = router;
