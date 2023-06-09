const express = require('express');
const router = express.Router();
const { set,ref,get,update,remove } = require('firebase/database');
const db = require('../config/connectFirebase');

router.post("/warehouse" , (req, res) => {
  var ID = req.body.ID;
  var ProductID = req.body.ProductID;
  var Branch = req.body.Branch;
  var ProductName = req.body.ProductName;
  var ProductDescription = req.body.ProductDescription;
  var MaximumUnits = req.body.MaximumUnits;
  var MinimumUnits = req.body.MinimumUnits;
  var UnitsPrice = req.body.UnitsPrice;
  var UnitsInStock = req.body.UnitsInStock;
  var UnitsOnOrder = req.body.UnitsOnOrder;
  var Type = req.body.Type;
  var Day = req.body.Day;
  var UpdateBy = req.body.UpdateBy;

  try {
    set(ref(db, "product/warehouse/" + ID), {
      ProductID: ProductID,
      Branch: Branch,
      ProductName: ProductName,
      ProductDescription: ProductDescription,
      MaximumUnits: MaximumUnits,
      MinimumUnits: MinimumUnits,
      UnitsPrice: UnitsPrice,
      UnitsInStock: UnitsInStock,
      UnitsOnOrder: UnitsOnOrder,
      Type: Type,
      Day: Day,
      UpdateBy: UpdateBy,
      LastUpdate: new Date() + "",
    });
    return res.status(200).json({
      statusCode: 200,
      message: "success"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ statusCode: 500, message: error.message });
  }
})

router.get("/warehouse", (req, res) => {
    try {
        get(ref(db, "product/warehouse"))
          .then((snapshot) => {
            if (snapshot.exists()) {
                return res.status(200).json({
                  statusCode: 200,
                  message: "success",
                  result: snapshot.val()
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
            return res
              .status(400)
              .json({ statusCode: 400, message: error.message });
          });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ statusCode: 500, message: error.message });
      }
});

router.put("/warehouse/addstock", (req, res) => {
  var ID = req.body.ID;
  var UnitsOnOrder = req.body.UnitsOnOrder;
  var UpdateBy = req.body.UpdateBy;

  try {
    var updates = {};
    updates[`product/warehouse/${ID}/UnitsOnOrder`] = UnitsOnOrder;
    updates[`product/warehouse/${ID}/UpdateBy`] = UpdateBy;
    updates[`product/warehouse/${ID}/LastUpdate`] = new Date() + "";

    update(ref(db), updates)
      .then(() => {
        return res.status(200).json({
          statusCode: 200,
          message: "success"
        });
      })
      .catch((error) => {
        return res.status(400).json({ statusCode: 400, message: error.message });
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ statusCode: 500, message: error.message });
  }

});

router.put("/warehouse/checkstock", (req, res) => {
  var ID = req.body.ID;
  var UnitsInStock = req.body.UnitsInStock;
  var UpdateBy = req.body.UpdateBy;

  try {
    var updates = {};
    updates[`product/warehouse/${ID}/UnitsInStock`] = UnitsInStock;
    updates[`product/warehouse/${ID}/UpdateBy`] = UpdateBy;
    updates[`product/warehouse/${ID}/LastUpdate`] = new Date() + "";

    update(ref(db), updates)
      .then(() => {
        return res.status(200).json({
          statusCode: 200,
          message: "success"
        });
      })
      .catch((error) => {
        return res.status(400).json({ statusCode: 400, message: error.message });
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ statusCode: 500, message: error.message });
  }

});

router.put("/warehouse/editday", (req, res) => {
  var ID = req.body.ID;
  var Day = req.body.Day;
  var UpdateBy = req.body.UpdateBy;

  try {
    var updates = {};
    updates[`product/warehouse/${ID}/Day`] = Day;
    updates[`product/warehouse/${ID}/UpdateBy`] = UpdateBy;
    updates[`product/warehouse/${ID}/LastUpdate`] = new Date() + "";

    update(ref(db), updates)
      .then(() => {
        return res.status(200).json({
          statusCode: 200,
          message: "success"
        });
      })
      .catch((error) => {
        return res.status(400).json({ statusCode: 400, message: error.message });
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ statusCode: 500, message: error.message });
  }

});


router.delete("/warehouse", (req, res) => {
  var ID = req.body.ID;
  try {
    remove(ref(db, "product/warehouse/"+ID))
      .then(() => {
        return res.status(200).json({
          statusCode: 200,
          message: "success",
        });
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
