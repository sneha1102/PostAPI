function getInfo(req, res, next) {
  const url = req.url;
  const method = req.method;
  const content = req.body;
  const headers = req.headers;
  let output = {
    url: url,
    method: method,
    bodyContent: content,
    headerContent: headers,
  };
  console.log(output);
  next();
}
module.exports = getInfo;
