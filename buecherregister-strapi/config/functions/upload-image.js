const fs = require("fs");
const Buffer = require("buffer").Buffer;

function decodeBase64Image(dataString) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  const response = {};
  if (matches.length !== 3) return new Error("Invalid input string");
  response.type = matches[1];
  response.data = Buffer.from(matches[2], "base64");

  return response;
}

const getImageProps = async (base64DataList) => {
  const attachments = [];
  const pathes = [];
  if (
    !base64DataList ||
    !base64DataList.length ||
    !Array.isArray(base64DataList)
  )
    return { attachments, pathes };
  for (let base64Data of base64DataList) {
    const imageTypeRegularExpression = /\/(.*?)$/;
    const crypto = require("crypto");
    const seed = crypto.randomBytes(20);
    const uniqueSHA1String = crypto
      .createHash("sha1")
      .update(seed)
      .digest("hex");
    const imageBuffer = decodeBase64Image(base64Data);
    const userUploadedFeedMessagesLocation = "./";
    const uniqueRandomImageName = "image-" + uniqueSHA1String;
    const imageTypeDetected = imageBuffer.type.match(
      imageTypeRegularExpression
    );
    const name = uniqueRandomImageName + "." + imageTypeDetected[1];
    const type = "image/" + imageTypeDetected[1];
    const path = userUploadedFeedMessagesLocation + name;

    fs.writeFileSync(path, imageBuffer.data);
    const ref = "edit-request";
    const refId = undefined;
    const attachment = await strapi.plugins.upload.services.upload.upload({
      data: { refId, ref },
      files: { path, name, type },
    });
    attachments.push(attachment["0"]);
    pathes.push(path);
  }
  return { attachments, pathes };
};

const deleteFiles = (pathes) => {
  for (let path of pathes) {
    fs.unlink(path, (err) => console.log(err));
  }
};

module.exports = {
  getImageProps,
  deleteFiles,
};
