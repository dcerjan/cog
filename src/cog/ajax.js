class Ajax {
  constructor(options) {
    let httpRequest;

    if (window.XMLHttpRequest) {
      httpRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      try {
        httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e) {
        try {
          httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        } 
        catch (e) {}
      }
    }

    if (!httpRequest) {
      throw new Error("Cannot create an XMLHTTP instance");
    }

    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          if(options.success) { options.success(httpRequest.responseText); }
        } else {
          console.error("Request failed with reason: " + httpRequest.statusText);
          if(options.fail) { options.fail(httpRequest.responseText); }
        }
        if(options.done) { options.done(httpRequest.responseText); }
      }
    };

    httpRequest.ontimeout = () => {
      console.error("Request timed out after " + httpRequest.timeout + " milliseconds");
      if(options.fail) { options.fail(); }
      if(options.done) { options.done(); }
    };

    httpRequest.open(options.method || "GET", options.url);

    httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    httpRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    
    if(options.headers) {
      Object.keys(headers).map( (header) => {
        httpRequest.setRequestHeader(header, headers[header]);
      });
    }

    httpRequest.timeout = options.timeout || 5000;
    httpRequest.send();
  }
}

Ajax.post = (options) => {
  new Ajax({url: options.url, data: options.data, method: "POST", success: options.success, fail: options.fail, done: options.done});
};

Ajax.get = (options) => {
  new Ajax({url: options.url, data: options.data, method: "GET", success: options.success, fail: options.fail, done: options.done});
};

export default Ajax;
