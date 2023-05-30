import HTTP from "./HTTP";

const API = {
  Test: "test",
  SignIn: "signin_user",
  SignUp: "signup_user",
  CheckExistingID: "is_duplicate_id",
  CheckExistingEmail: "is_duplicate_email",
  SearchUserForMyID: "search_user_for_my_id",
  SearchUserForPW: "search_user_for_password",
  ModifyPassword: "modify_user_password",
  GetUser: "user",
  GetUsers: "users",
  EditUser: "edit_user",
};
Object.freeze(API);

/**
 *
 * @param {string} name - API 이름
 * @param {Object} args - API와 전달할 인자
 * @param {string | string[]} fields - 반환받을 필드
 *
 * @returns Axios Promise
 */
const apiRequest = function () {
  this.querySet = [];
};

apiRequest.prototype.push = function (name, args, fields) {
  let argString = "";
  for (const key of Object.keys(args)) {
    //Wrap value with "" if type is string
    if (typeof args[key] == "string") argString += `${key}:"${args[key]}"`;
    else argString += `${key}:${args[key]}`;
    argString += " ";
  }
  argString = argString.trimEnd();

  let fieldString = "";
  if (typeof fields == "object")
    fieldString = fields.reduce((accum, current) => `${accum} ${current}`);
  else if (fields) fieldString = fields;

  let queryString = `${name}(${argString})${
    fieldString.length > 0 ? ` { ${fieldString} }` : ""
  }`;

  this.querySet.push(queryString);
  return this;
};
apiRequest.prototype.send = function () {
  let finalQuery = "{\n";

  for (const query of this.querySet) finalQuery += query + "\n";

  finalQuery += "}";

  console.log(finalQuery);

  return HTTP.post("", { query: finalQuery });
};

const parseResponse = (_response) => {
  return new Promise((resolve) => {
    const response = _response.data;
    resolve(response["data"]);
  });
};

export { API, apiRequest, parseResponse };
