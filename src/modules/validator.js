/**
 * @param {string} name - 한글, 영어, 숫자 2~12자
 * @return  true or error message
 */
export const validName = (name) => {
  return lengthBetween(name, 2, 12) && KorEngNumOnly(name);
};

/**
 * @param {string} id - 영어, 숫자 8~16자
 * @return  true or error message
 */
export const validMyID = (id) => {
  return lengthBetween(id, 8, 16) && EngNumOnly(id);
};

/**
 * @param {string} pw - 영어, 숫자, 특수문자 조합 8~20자
 * @return  true or error message
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

export const validEmail = (value) => {
  const regex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;

  return regex.test(value);
};

export const lengthBetween = (value, min, max) => {
  if (min && value.length < min) return false;
  if (max && value.length > max) return false;
  return true;
};

export const KorEngNumOnly = (value) => {
  const regex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]*$/;

  return regex.test(value);
};

export const EngNumOnly = (value) => {
  const regex = /^[a-z|A-Z|0-9|]*$/;

  return regex.test(value);
};

export const containEng = (value) => {
  const regex = /^(?=.*[A-Z|a-z])/;

  return regex.test(value);
};

export const containNum = (value) => {
  const regex = /^(?=.*\d)/;

  return regex.test(value);
};

export const containSC = (value) => {
  const regex = /^(?=.*[@$!%*#?&])/;

  return regex.test(value);
};

export const EngNumSCOnly = (value) => {
  const regex = /^[A-Za-z\d@$!%*#?&]*$/;

  return regex.test(value);
};

export const validityColor = (validity) => {
  if (validity == null) return "warning";
  return validity ? "secondary_accent" : "error_variant";
};

export const validityIcon = (validity) => {
  if (validity == null) return "mdi-exclamation";
  return validity ? "mdi-check" : "mdi-close";
};
