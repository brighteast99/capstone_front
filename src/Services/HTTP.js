import axios from "axios";

class HTTP {
  constructor(baseURL = "/") {
    this.http = axios.create({
      baseURL: "/api" + baseURL,
      withCredentials: true,
      xsrfCookieName: "csrftoken",
      xsrfHeaderName: "X-CSRFToken",
    });
  }

  post(url, body) {
    return this.http.post(url, body);
  }

  get(url) {
    return this.http.get(url);
  }

  put(url, data) {
    return this.http.put(url, data);
  }

  delete(url, body) {
    return this.http.delete(url, body);
  }
}

export default new HTTP();
