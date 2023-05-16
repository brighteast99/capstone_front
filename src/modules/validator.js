class Validator {
  constructor() {}

  /**
   * @param {string} name - 한글, 영어, 숫자 2~12자
   * @return  true or error message
   */
  validateName = (name) => {
    const regex = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]*$/;

    if (name === "") return "닉네임이 필요해요";

    if (!regex.test(name)) return "한글, 영어, 숫자만 사용할 수 있어요";

    if (name.length < 2) return "닉네임이 너무 짧아요";
    if (name.length > 12) return "닉네임이 너무 길어요";

    return true;
  };

  /**
   * @param {string} id - 영어, 숫자 8~16자
   * @return  true or error message
   */
  validateID = (id) => {
    const regex = /^[a-z|A-Z|0-9]*$/;

    if (id === "") return "아이디가 필요해요";

    if (!regex.test(id)) return "영어, 숫자만 사용할 수 있어요";

    if (id.length < 8) return "아이디가 너무 짧아요";
    if (id.length > 16) return "아이디가 너무 길어요";

    return true;
  };

  /**
   * @param {string} pw - 영어, 숫자, 특수문자 조합 8~20자
   * @return  true or error message
   */
  validatePW = (pw) => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;

    if (pw === "") return "비밀번호가 필요해요";

    if (!regex.test(pw)) return "알파벳, 숫자, 특수문자 조합으로 구성해야 해요";

    if (pw.length < 8) return "비밀번호가 너무 짧아요";
    if (pw.length > 20) return "비밀번호가 너무 길어요";

    return true;
  };

  /**
   * @param {string} name - 한글, 영어, 숫자 2~12자
   * @return  true or error message
   */
  validateEmail = (email) => {
    const regex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;

    if (email == "") return "이메일이 필요해요";

    if (!regex.test(email)) return "이메일 형식이어야 해요";

    return true;
  };
}

export default new Validator();
