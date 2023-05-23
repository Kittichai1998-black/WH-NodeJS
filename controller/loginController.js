const express = require('express');
const router = express.Router();
const { set,ref,get,update,remove } = require('firebase/database');
const db = require('../config/connectFirebase');

router.post("/login", function(req, res, next) {
  try {
    var username = req.body.username;
    var password = req.body.password;
    get(ref(db, "users/" + username)).then((response) => {
      const userData = response.val();
      if (!response.exists()) {
        return res.status(200).json({
          statusCode: 200,
          message: "Username/Password is invalid1",
        });
      }
      
      if (userData.Password !== password) {
        return res.status(200).json({
          status: 200,
          message: "Username/Password is invalid2",
        });
      } else {
        return res.status(200).json({
          status: 200,
          message: "success",
          result: response.val()
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: error.message
    });
  }
});

router.get("/account", function(req, res, next) {
  try {
    get(ref(db, "users"))
      .then((result) => {
        if (result.exists()) {
          return res.status(200).json({
            statusCode: 200,
            message: "success",
            result: result.val()
          });
        } else {
          return res.status(200).json({
            statusCode: 200,
            message: "success",
            result: "not found data"
          });
        }
      })
      .catch((error) => {
        return res.status(400).json({
          statusCode: 400,
          message: error.message
        });
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statusCode: 500,
      message: error.message
    });
  }
});

module.exports = router;