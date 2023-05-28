const express = require("express");
const router = express.Router();
const { set, ref, get, update, remove } = require("firebase/database");
const db = require("../config/connectFirebase");

const request = require("request");

function lineNotify(text) {
  const url_line_notification = "https://notify-api.line.me/api/notify";
  const token = "Rev9spbvuB85s71VlNjIrj7tYSY1aRNszAkiDqO8Jui";
  request(
    {
      method: "POST",
      uri: url_line_notification,
      header: {
        "Content-Type": "multipart/form-data",
      },
      auth: {
        bearer: token,
      },
      form: {
        message: text,
      },
    },
    (err, httpResponse, body) => {
      if (err) {
        console.log(err);
      } else {
        console.log(body);
      }
    }
  );
}

router.post("/stock", (req, res) => {
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
    set(ref(db, "product/stock1/" + ID), {
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

router.put("/stock/addstock", (req, res) => {
  var ID = req.body.ID;
  var UnitsOnOrder = req.body.UnitsOnOrder;
  var UpdateBy = req.body.UpdateBy;

  try {
    var updates = {};
    updates[`product/stock1/${ID}/UnitsOnOrder`] = UnitsOnOrder;
    updates[`product/stock1/${ID}/UpdateBy`] = UpdateBy;
    updates[`product/stock1/${ID}/LastUpdate`] = new Date() + "";

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

router.put("/stock/checkstock", (req, res) => {
  var ID = req.body.ID;
  var UnitsOnOrder = req.body.UnitsOnOrder;
  var UpdateBy = req.body.UpdateBy;

  try {
    var isWSUpdate = false;
    var isSTUpdate = false;

    var unitsInStock = 0;
    var maximumUnits = 0;
    var LineMessage = "";
    //check stock1
    get(ref(db, "product/stock1/" + ID)).then((snapshot) => {
      if (snapshot.exists()) {
        unitsInStock = snapshot.val().UnitsInStock;
        maximumUnits = snapshot.val().MaximumUnits;
        console.log("unitsInStock = " + unitsInStock);
        console.log("maximumUnits = " + maximumUnits);

        if (unitsInStock >= maximumUnits) {
          LineMessage = ID +":"+ " Units full stock";
          lineNotify(LineMessage)
          return res.status(200).json({
            statusCode: 400,
            message: ID + " Units full stock"
          });
        }
      }
    });

    var WHResultUnits = 0;
    var WHUnitsInStock = 0;
    var WHUnitsOnOrder = 0;
    
    //check warehouse
    get(ref(db, "product/warehouse/" + ID)).then((snapshot) => {
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
          wh_updates[`product/warehouse/${ID}/UnitsOnOrder`] =
            UnitsOnOrder + WHUnitsOnOrder;
          wh_updates[`product/warehouse/${ID}/UpdateBy`] = UpdateBy;
          wh_updates[`product/warehouse/${ID}/LastUpdate`] =
            new Date() + "";

          //update stock1
          var st_updates = {};
          st_updates[`product/stock1/${ID}/UnitsInStock`] =
            unitsInStock + UnitsOnOrder;
          st_updates[`product/stock1/${ID}/UpdateBy`] = UpdateBy;
          st_updates[`product/stock1/${ID}/LastUpdate`] =
            new Date() + "";

          update(ref(db), wh_updates)
            .then(() => {
              isWSUpdate = true;

              update(ref(db), st_updates)
                .then(() => {
                  isSTUpdate = true;

                  if (isWSUpdate == true && isSTUpdate == true) {
                    LineMessage = ID + " ถูกเพิ่มจำนวน :"+ WHUnitsOnOrder +"\n"+"คงเหลือจำนวน : " + WHUnitsInStock;
                    lineNotify(LineMessage)
                    return res.status(200).json({
                      statusCode: 200,
                      message: "success",
                      result: "Unit " + ID + "Order Insert Success",
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
          LineMessage = ID + " Warehouse Out of stock";
          lineNotify(LineMessage)
          return res.status(200).json({
            statusCode: 400,
            message: "Units " + ID + " Warehouse Out of stock",
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

router.put("/stock/editday", (req, res) => {
  var ID = req.body.ID;
  var Day = req.body.Day;
  var UpdateBy = req.body.UpdateBy;

  try {
    var updates = {};
    updates[`product/stock1/${ID}/Day`] = Day;
    updates[`product/stock1/${ID}/UpdateBy`] = UpdateBy;
    updates[`product/stock1/${ID}/LastUpdate`] = new Date() + "";

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

router.delete("/stock", (req, res) => {
  var ID = req.body.ID;
  try {
    remove(ref(db, "product/stock1/"+ID))
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
