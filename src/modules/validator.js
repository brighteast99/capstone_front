/**
 * @param {string} name - 한글, 영어, 숫자 2~12자
 * @return {Boolean}
 */
export const validName = (name) => {
  return lengthBetween(name, 2, 12) && KorEngNumOnly(name);
};

/**
 * @param {string} id - 영어, 숫자 8~16자
 * @return {Boolean}
 */
export const validMyID = (id) => {
  return lengthBetween(id, 8, 16) && EngNumOnly(id);
};

/**
 * @param {string} pw - 영어, 숫자, 특수문자 조합 8~20자
 * @return {Boolean}
 */
export const validPW = (pw) => {
  return (
    lengthBetween(pw, 8, 20) &&
    containEng(pw) &&
    containNum(pw) &&
    containSC(pw) &&
    EngNumSCOnly(pw)
  );
};

/**
 * @param {string} email - 이메일 형식
 * @return {Boolean}
 */
export const validEmail = (email) => {
  const regex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;

  return regex.test(email);
};

/**
 *
 * @param {string} value
 * @param {Number} min
 * @param {Number} max
 * @returns {Boolean}
 */
export const lengthBetween = (value, min, max) => {
  if (min && value.length < min) return false;
  if (max && value.length > max) return false;
  return true;
};

/**
 *
 * @param {string} value
 * @returns {Boolean}
 */
export const KorEngNumOnly = (value) => {
  const regex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]*$/;

  return regex.test(value);
};

/**
 *
 * @param {string} value
 * @returns {Boolean}
 */
export const EngNumOnly = (value) => {
  const regex = /^[a-z|A-Z|0-9|]*$/;

  return regex.test(value);
};

/**
 *
 * @param {string} value
 * @returns {Boolean}
 */
export const containEng = (value) => {
  const regex = /^(?=.*[A-Z|a-z])/;

  return regex.test(value);
};

/**
 *
 * @param {string} value
 * @returns {Boolean}
 */
export const containNum = (value) => {
  const regex = /^(?=.*\d)/;

  return regex.test(value);
};

/**
 *
 * @param {string} value
 * @returns {Boolean}
 */
export const containSC = (value) => {
  const regex = /^(?=.*[@$!%*#?&])/;

  return regex.test(value);
};

/**
 *
 * @param {string} value
 * @returns {Boolean}
 */
export const EngNumSCOnly = (value) => {
  const regex = /^[A-Za-z\d@$!%*#?&]*$/;

  return regex.test(value);
};

/**
 *
 * @param {Boolean} value
 * @returns {string}
 */
export const validityColor = (validity) => {
  if (validity === null) return "warning";
  return validity ? "secondary_accent" : "error_variant";
};

/**
 *
 * @param {Boolean} value
 * @returns {String}
 */
export const validityIcon = (validity) => {
  if (validity === null) return "mdi-exclamation";
  return validity ? "mdi-check" : "mdi-close";
};
