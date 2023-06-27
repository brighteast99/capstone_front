import axios from "axios";
import { useAxios } from "@vueuse/integrations/useAxios";
import HTTP from "./HTTP";
import { constructQuery } from "./queryBuilder";

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
  GetFavorites: "my_favorite_thread",
  GetUsers: "users",
  EditUser: "edit_user",
  CreatePortfolio: "create_portfolio",
  GetPortfolio: "portfolio",
  UpdatePortfolio: "edit_portfolio",
  CreateLink: "create_link",
  GetLinks: "links",
  DeleteLink: "remove_link",
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
  GetOccupations: "occupations",
  CreateRecruitments: "create_occupation_for_thread",
  GetSingleRecruitment: "recruitment",
  GetRecruitments: "recruitments",
  UpdateRecruitments: "update_occupation_for_thread",
  CloseRecruitment: "close_occupation_for_thread",
  WithdrawRecruitment: "withdraw_occupation_for_thread",
  ReopenRecruitment: "reopen_occupation_for_thread",
  RevertWithdrawnRecruitment: "revert_withdraw",
  Apply: "create_application",
  CancelApplication: "cancel_application",
  EvalApplication: "evaluate_application",
  Applications: "applications",
  UsersApplications: "user_applications",
  UsersApplication: "user_application",
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
  this.querySet.push({ name: name, args: args, fields: fields });
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
  this.querySet.push({ name: name, args: args, fields: fields });

  return this;
};

/**
 * Executes all the requests in the queue and flushes the queue.
 *
 * @returns {Promise} Axios Promise
 */
apiRequest.prototype.send = function () {
  const queryString = constructQuery(this.querySet).data;
  this.querySet = [];
  return HTTP.post("", queryString);
};

export const parseResponse = (_response) => {
  return new Promise((resolve) => {
    const response = _response.data.data ?? _response.data.value.data;

    let converted = {};
    for (const key of Object.keys(response)) {
      const match = key.match(/(.*?)(\d+)/);
      if (!match) converted[key] = [response[key]];
      else {
        const basekey = match[1];
        if (converted[basekey] != null) converted[basekey].push(response[key]);
        else converted[basekey] = response[key];
      }
    }
    for (const key of Object.keys(converted))
      if (converted[key].length == 1) converted[key] = converted[key][0];

    resolve(converted);
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
