const Queries = require("./Queries");

exports.checkApiExist = async function (api) {
  try {
    var exist = await Queries.find({
      api: api,
    });
    return exist;
  } catch (e) {
    // Log Errors
    console.log("Exception ::", e);
    throw e;
  }
};
exports.updateApi = async function (api, newApi) {
  try {
    var update = await Queries.updateOne(
      {
        api: api,
      },
      {
        api: newApi,
      }
    );
    return update;
  } catch (e) {
    // Log Errors
    console.log("Exception ::", e);
    throw e;
  }
};
