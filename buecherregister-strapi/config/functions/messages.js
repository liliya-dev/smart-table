const ERRORS = {
  OWNER: "Only library owner can make this request!",
  CODE: "The request missing CODE parameter!",
  SERVER: "Something bad is happen!",
  PHONE: "The phone number is required!",
  VALID_PHONE: "The phone number is not valid!",
  TAKEN_PHONE: "This phone number is already taken!",
  VALID_EMAIL: "This email is not valid!",
  TAKEN_EMAIL: "This email is already taken!",
  TITLE: "Parametr TITLE is required!",
  DATE: "The date is required!",
  ID: "The id number is required!",
  ID_EDITION: "There is no edition with this ID!",
  CODE_LIBRARY: "There is no library with this CODE!",
  SENDER_LIBRARY: "There is no sender with this CODE!",
  SENDER: "Parametr SENDER is required!",
  RECIPIENT: "Parametr RECIPIENT is required!",
  MESSAGE: "Parametr MESSAGE is required!",
  NAME: "The name is required!",
  SURNAME: "The surname is required!",
  STREET: "The street is required!",
  POST_CODE: "The post code is required!",
  FILES: "The files upload is required!",
};

const SUCCESS = {
  DEFAULT: "Your request has been processed.",
  FILE_UPLOAD: "Your file has been uploaded successfully",
};

module.exports = { ERRORS, SUCCESS };
