const queryServices = require("./queriesFunc");
const Queries = require("./Queries");
var express = require("express");
const {
  Query
} = require("mongoose");
var router = express.Router();

router.get("/getApi", async (req, response) => {
  const query = await queryServices.checkApiExist(req.headers["authorization"]);
  return response.json({
    keyObject: query[0],
  });
});

router.post("/updateApi", async (req, response) => {
  let accessApi = req.headers["authorization"];

  const query = await queryServices.checkApiExist(accessApi);
  const newApi = req.headers["newkey"];

  if (
    query[0].api == accessApi &&
    query[0].apiCheck1 == req.headers["apicheck1"] &&
    query[0].apiCheck2 == req.headers["apicheck2"]
  ) {
    const updateQuery = await queryServices.updateApi(accessApi, newApi);
    if (updateQuery) {
      return response.json({
        updated: true,
      });
    }
  } else {
    return response.status(400).json({
      updated: false,
      msg: 'invalid api checks',
    });
  }
});

module.exports = router;