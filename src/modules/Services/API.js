import axios from "axios";
import { useAxios } from "@vueuse/integrations/useAxios";
import HTTP from "./HTTP";
import { constructQueryString } from "./queryBuilder";

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
  GetBookmarks: "my_favorite_thread",
  GetUsers: "users",
  EditUser: "edit_user",
  GetBoards: "boards",
  GetBoard: "board",
  SearchThreads: "threads",
  CreateThread: "create_thread",
  GetThread: "thread",
  ReadThread: "update_view",
  EditThread: "edit_thread",
  DeleteThread: "remove_thread",
  GetThreadActions: "action_for_thread",
  UpdateThreadActions: "update_action",
  CreateComment: "create_comment",
  GetComments: "comments",
  UpdateComment: "update_comment",
  DeleteComment: "remove_comment",
};
Object.freeze(API);

export { API };

export const apiRequest = function () {
  this.querySet = [];
};

/**
 * Execute API
 *
 * @param {string} name API name
 * @param {Object} args arguments
 * @param {string | Object | (string|Object|Array)[]} fields fields to be returned
 *
 * @returns {Promise} Axios promise
 */
apiRequest.prototype.execute = function (name, args, fields) {
  this.querySet.push(constructQueryString(name, args, fields));
  return this.send();
};

/**
 * Push an API request to the queue
 *
 * @param {string} name API name
 * @param {Object} args arguments
 * @param {string | Object | (string|Object|Array)[]} fields fields to be returned
 * @returns {this}
 */
apiRequest.prototype.push = function (name, args, fields) {
  this.querySet.push(constructQueryString(name, args, fields));
  return this;
};

/**
 * Executes all the requests in the queue
 *
 * @returns {Promise} Axios Promise
 */
apiRequest.prototype.send = function () {
  const finalQuery = this.querySet.join(" ");
  this.querySet = [];
  return HTTP.post("", { query: `{ ${finalQuery} }` });
};

export const parseResponse = (_response) => {
  return new Promise((resolve) => {
    const response = _response.data;
    resolve(response["data"]);
  });
};

/**
 *
 * @param {{onSuccess: function, onError: function, onFinish: function}} callbacks
 * @returns {useAxios}
 */
export function useAPI(callbacks) {
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
      onSuccess: callbacks?.onSuccess,
      onError: callbacks?.onError,
      onFinish: callbacks?.onFinish,
    }
  );
}
