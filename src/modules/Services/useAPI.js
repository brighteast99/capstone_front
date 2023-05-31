import axios from "axios";
import { useAxios } from "@vueuse/integrations/useAxios";

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
  SearchPosts: "threads",
  GetPost: "thread",
  CreatePost: "create_thread",
  EditPost: "edit_thread",
};
Object.freeze(API);

const constructQueryString = function (name, args, fields) {
  let queryString = name;

  let formattedArgs = [];
  for (const key of Object.keys(args)) {
    //Wrap value with "" if type is string
    switch (typeof args[key]) {
      case "string":
        formattedArgs.push(`${key}:"${args[key]}"`);
        break;
      case "number" || "boolean":
        formattedArgs.push(`${key}:${args[key]}`);
        break;
      case "object":
        if (Array.isArray(args[key]))
          formattedArgs.push(`${key}:"${args[key].join(", ")}"`);
        else
          formattedArgs.push(
            `${key}: ${JSON.stringify(JSON.stringify(args[key]))}`
          );
        break;
      default:
        throw `invalid argument type: ${typeof args[key]} ${key} ${args[key]}`;
    }
  }
  queryString += `(${formattedArgs.join(" ")})`;

  if (fields) {
    let fieldString = "";
    // Case1: fields is a string
    if (typeof fields == "string") fieldString = fields;
    // Case2: fields is array of strings or objects
    else if (Array.isArray(fields)) {
      fields.forEach((element, idx) => {
        // flatten all element whose type is object to string
        if (typeof element == "object") {
          const key = Object.keys(element)[0];

          // flatten the value if the it is an array
          if (Array.isArray(element[key])) {
            fields[idx] = `${key} { ${element[key].join(" ")} }`;
          } else {
            let flatten = [];
            Object.keys(element).forEach((key) => {
              flatten.push(`${key}:${element[key]}`);
            });
            fields[idx] = flatten.join(" ");
          }
        }
      });
      fieldString = fields.join(" ");
    }
    // Case3: fields is an object
    else {
      const key = Object.keys(fields)[0];

      // flatten the value if the it is an array
      if (Array.isArray(fields[key])) fields[key] = fields[key].join(" ");

      fieldString = `${key} { ${fields[key]} }`;
    }

    if (fieldString.length > 0) queryString += `{${fieldString}}`;
  }

  console.log(queryString);
  return queryString;
};

function constructQuery(queryData) {
  let querySet = [];

  if (!Array.isArray(queryData)) queryData = [queryData];

  queryData.forEach((query) => {
    const { name, args, fields } = query;
    const queryString = constructQueryString(name, args, fields);
    querySet.push(queryString);
  });
  return { data: { query: "{" + querySet.join(" ") + "}" } };
}

function useAPI(callbacks) {
  return useAxios(
    "",
    { method: "POST" },
    axios.create({
      baseURL: "/api",
      withCredentials: true,
      xsrfCookieName: "csrftoken",
      xsrfHeaderName: "X-CSRFToken",
    }),
    {
      onSuccess: callbacks.onSuccess,
      onError: callbacks.onError,
      onFinish: callbacks.onFinish,
    }
  );
}

export { API, useAPI, constructQuery };
