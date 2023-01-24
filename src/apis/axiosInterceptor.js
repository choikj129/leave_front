import router from "../router"

let requestInterceptor = null;
let responseInterceptor = null;

const use = (axios) => {
  // 모든 axios 요청에 대한 선처리
  if (requestInterceptor == null) {
    requestInterceptor = axios.interceptors.request.use(
      function (config) {
        config.headers =  {"Content-Type" : "application/json;charset=UTF-8"}
        config.url = "/api" + config.url
        return config;
      },
      function (error) {
        console.error(error)
        return Promise.reject(error);
      }
    );
  }
  // 모든 axios 응답에 대한 선처리
  if (responseInterceptor == null) {
    responseInterceptor = axios.interceptors.response.use(
      function (response) {
        // session 만료 시 로그인 페이지로 이동
        if(!response.data.status) {          
          alert(response.data.msg)
          if (response.data.msg == "no session") {
            router.push({path: "/login"})          
          }
        }
        return response.data;
      },
      function (error) {
        // console.error(error)
        return Promise.reject(error);
      }
    );
  }
};

 const eject = (axios) => {
  if (requestInterceptor != null) {
    axios.interceptors.request.eject(requestInterceptor);
  }
  if (responseInterceptor != null) {
    axios.interceptors.response.eject(responseInterceptor);
  }
};

export default {
  use,
  eject,
};
