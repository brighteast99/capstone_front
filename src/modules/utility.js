import { useToggle } from "@vueuse/core";

/**
 *
 * @param {boolean} target
 * @returns {value:boolean , toggle:function}
 */
export function createToggle(target) {
  const [value, toggle] = useToggle(target);
  return { value: value, toggle: toggle };
}

/**
 * escape ", \ in the given string
 *
 * @param {String} str
 * @returns {String} escaped string
 */
export function escapeString(str) {
  return str.replace(/["\\]/g, "\\$&").replace(/\n/g, "\\n");
}

/**
 * unescape ", \ in the given string
 *
 * @param {String} str
 * @returns {String} unescaped string
 */
export function unescapeString(str) {
  return str.replace(/\\(['"\\])/g, "$1");
}

/**
 *
 * @param {Date | string} date
 * @param {boolean} withTime
 * @return {String}
 */
export function formatDate(date, withTime = true) {
  if (!(date instanceof Date)) date = new Date(Date.parse(date));
  if (isNaN(date)) throw new Error("Invalid date");

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  let dateString = `${year}. ${month}. ${day}.`;

  if (withTime) {
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    dateString += ` ${hour}:${minute}`;
  }
  return dateString;
}

/**
 *
 * @param {Date | string} date
 * @param {{max_unit: "seconds"|"minutes"|"hours"|"days"|"weeks"|"months"|"years"|undefined, withTime: boolean, date_updated}} options
 * @return {String}
 */
export function formatDateRelative(date, options) {
  if (!(date instanceof Date)) date = new Date(Date.parse(date));
  if (isNaN(date)) throw new Error("Invalid date");

  let max;
  switch (options?.max_unit ?? "years") {
    case "seconds":
      max = 60 * 1000;
      break;
    case "minutes":
      max = 60 * 60 * 1000;
      break;
    case "hours":
      max = 60 * 60 * 24 * 1000;
      break;
    case "days":
      max = 60 * 60 * 24 * 7 * 1000;
      break;
    case "weeks":
      max = 60 * 60 * 24 * 7 * 4 * 1000;
      break;
    case "months":
      max = 60 * 60 * 24 * 7 * 4 * 12 * 1000;
      break;
    case "years":
      max = null;
      break;
    default:
      throw new Error("Invalid max_unit");
  }

  const modified = options?.date_updated
    ? new Date(options.date_updated) - new Date(date)
    : false;

  const now = new Date();
  const diff = now - date;

  // return locale string if date is before max_unit
  if (max && diff >= max) return formatDate(date, options?.withTime ?? true);

  // Seconds
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `방금 전${modified ? " (수정됨)" : ""}`;

  // Minutes
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전${modified ? " (수정됨)" : ""}`;

  // Hours
  const hours = Math.floor(seconds / 60 / 60);
  if (hours < 24) return `${hours}시간 전${modified ? " (수정됨)" : ""}`;

  // Days
  const days = Math.floor(seconds / 60 / 60 / 24);
  if (days < 7) {
    if (days == 1) return `어제${modified ? " (수정됨)" : ""}`;
    return `${days}일 전${modified ? " (수정됨)" : ""}`;
  }

  // Weeks
  const weeks = Math.floor(seconds / 60 / 60 / 24 / 7);
  if (weeks < 4) {
    if (weeks == 1) return `지난 주${modified ? " (수정됨)" : ""}`;
    return `${weeks}주 전${modified ? " (수정됨)" : ""}`;
  }

  // Months
  const months = Math.floor(seconds / 60 / 60 / 24 / 4);
  if (months < 12) {
    if (months == 1) return `지난 달${modified ? " (수정됨)" : ""}`;
    return `${months}개월 전${modified ? " (수정됨)" : ""}`;
  }

  // Years
  const years = Math.floor(seconds / 60 / 60 / 24 / 4 / 12);
  return `${years}년 전${modified ? " (수정됨)" : ""}`;
}

/**
 *
 * @param {JSON string} JSONstring
 * @returns {Object | String}
 */
export const parseJSON = (JSONstring) => {
  try {
    return JSON.parse(JSONstring);
  } catch (err) {
    return JSONstring;
  }
};

const findText = (json) => {
  if (json.text) return json.text;
  if (json.content) return json.content.map(findText).join("");
  return "";
};

/**
 * Extracts text from a JSON string from TipTap editor.
 *
 * @param {JSON string} JSONstring
 * @return {String}
 */
export const extractText = (JSONstring) => {
  const json = parseJSON(JSONstring);
  if (typeof json != "object") return json;

  return findText(json);
};

export const countActiveComments = (comments) => {
  return comments.reduce((accum, comment) => {
    return (
      accum +
      !comment.is_deleted +
      comment.replies.filter((reply) => !reply.is_deleted).length
    );
  }, 0);
};
