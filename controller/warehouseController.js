const express = require('express');
const router = express.Router();
const { set,ref,get,update,remove } = require('firebase/database');
const db = require('../config/connectFirebase');

router.get('/warehouse', (req, res) => {
    try {
        get(ref(db, "product/warehouse"))
          .then((snapshot) => {
            if (snapshot.exists()) {
                return res.status(200).json({
                  statusCode: 200,
                  message: "success",
                  result: snapshot.val(),
                });
              } else {
                return res.status(200).json({
                  StatusCode: 200,
                  message: "success",
                  result: "not found data",
                });
              }
            })
          .catch((error) => {
            return res
              .status(400)
              .json({ statusCode: 400, message: error.message });
          });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ statusCode: 500, message: error.message });
      }
});

module.exports = router; 
