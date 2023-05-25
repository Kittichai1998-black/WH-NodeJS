const express = require("express");
const router = express.Router();
const { set, ref, get, update, remove } = require("firebase/database");
const db = require("../config/connectFirebase");

router.post("/stock", (req, res) => {
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
    set(ref(db, "product/stock1/" + ProductName), {
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
      message: "success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ statusCode: 500, message: error.message });
  }
});

router.get("/stock", (req, res) => {
  try {
    get(ref(db, "product/stock1"))
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

router.put("/stock", (req, res) => {
  var ProductName = req.body.ProductName;
  var UnitsOnOrder = req.body.UnitsOnOrder;
  var UpdateBy = req.body.UpdateBy;

  try {
    var isWSUpdate = false;
    var isSTUpdate = false;

    var unitsInStock = 0;
    var maximumUnits = 0;
    //check stock1
    get(ref(db, "product/stock1/" + ProductName)).then((snapshot) => {
      if (snapshot.exists()) {
        unitsInStock = snapshot.val().UnitsInStock;
        maximumUnits = snapshot.val().MaximumUnits;
        console.log("unitsInStock = " + unitsInStock);
        console.log("maximumUnits = " + maximumUnits);

        if (unitsInStock >= maximumUnits) {
          return res.status(200).json({
            statusCode: 400,
            message: ProductName + " Units full stock",
            result: "",
          });
        }
      }
    });

    var WHResultUnits = 0;
    var WHUnitsInStock = 0;
    var WHUnitsOnOrder = 0;
    //check warehouse
    get(ref(db, "product/warehouse/" + ProductName)).then((snapshot) => {
      if (snapshot.exists()) {
        WHUnitsInStock = snapshot.val().UnitsInStock;
        WHUnitsOnOrder = snapshot.val().UnitsOnOrder;
        if (WHUnitsOnOrder == undefined) WHUnitsOnOrder = 0;

        console.log("WHUnitsInStock = " + WHUnitsInStock);
        console.log("WHUnitsInOrder = " + WHUnitsOnOrder);

        WHResultUnits = WHUnitsInStock - WHUnitsOnOrder;
        console.log("WHResultUnits = " + WHResultUnits);

        if (WHResultUnits > 0 && UnitsOnOrder <= WHResultUnits) {
          //update warehouse
          var wh_updates = {};
          wh_updates[`product/warehouse/${ProductName}/UnitsOnOrder`] =
            UnitsOnOrder + WHUnitsOnOrder;
          wh_updates[`product/warehouse/${ProductName}/UpdateBy`] = UpdateBy;
          wh_updates[`product/warehouse/${ProductName}/LastUpdate`] =
            new Date() + "";

          //update stock1
          var st_updates = {};
          st_updates[`product/stock1/${ProductName}/UnitsInStock`] =
            unitsInStock + UnitsOnOrder;
          st_updates[`product/stock1/${ProductName}/UpdateBy`] = UpdateBy;
          st_updates[`product/stock1/${ProductName}/LastUpdate`] =
            new Date() + "";

          update(ref(db), wh_updates)
            .then(() => {
              isWSUpdate = true;

              update(ref(db), st_updates)
                .then(() => {
                  isSTUpdate = true;

                  if (isWSUpdate == true && isSTUpdate == true) {
                    return res.status(200).json({
                      statusCode: 200,
                      message: "success",
                      result:
                        "Unit " + ProductName + "Order Insert Success",
                    });
                  } else {
                    return res.status(400).json({
                      statusCode: 400,
                      message:
                        "isWSUpdate : " +
                        isSTUpdate +
                        "| isSTUpdate : " +
                        isSTUpdate,
                    });
                  }
                })
                .catch((error) => {
                  return res
                    .status(400)
                    .json({ statusCode: 400, message: error.message });
                });
            })
            .catch((error) => {
              return res
                .status(400)
                .json({ statusCode: 400, message: error.message });
            });
        } else {
          return res.status(200).json({
            statusCode: 400,
            message: "Units " + ProductName + " Warehouse Out of stock",
            result: "",
          });
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ statusCode: 500, message: error.message });
  }
});

router.delete("/stock", (req, res) => {
  var ProductName = req.body.ProductName;
  try {
    remove(ref(db, "product/stock1/" + ProductName))
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
