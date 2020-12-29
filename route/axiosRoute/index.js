const axios = require("axios");
const client = require("../../service/cache");

//get movie or series or episode by title and year

exports.movieByYear = async (req, res) => {
  const year = req.query.year;
  const title = req.query.title;
  var axios_url = {
    url: "http://www.omdbapi.com",
    method: "get",

    params: {
      t: title,
      y: year,
      apikey: "5033303f",
    },
  };

  const cache_data = await client.getAsync("omdb" + title + year);
  if (cache_data) {
    res.status(200).json(JSON.parse(cache_data));
  } else {
    axios(axios_url)
      .then(async (response) => {
        await client.setAsync(
          "omdb" + title + year,
          JSON.stringify(response.data)
        );
        client.expire("omdb" + title + year, 60);
        res.status(200).send(response.data);
      })
      .catch((error) => {
        res.status(404).send({ error: error });
      });
  }
};
