let Ajax = (options) => {
  return new Promise(
    (resolve, reject) => {
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
        reject("Cannot create an XMLHTTP instance");
        throw new Error("Cannot create an XMLHTTP instance");
      }

      httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === 4) {
          if (httpRequest.status === 200) {
            resolve(httpRequest.responseText);
          } else {
            reject("Request failed with reason: " + httpRequest.statusText);
            throw new Error("Request failed with reason: " + httpRequest.statusText);
          }
        }
      };

      httpRequest.ontimeout = () => {
        reject("Request timed out after " + httpRequest.timeout + " milliseconds");
        throw new Error("Request timed out after " + httpRequest.timeout + " milliseconds");
      };

      httpRequest.open(options.method || "GET", options.url);
      httpRequest.setRequestHeader("X-Requested-With", "XMLHttpRequest");

      if(options.headers) {
        Object.keys(headers).map( (header) => {
          httpRequest.setRequestHeader(header, headers[header]);
        });
      }

      httpRequest.timeout = options.timeout || 5000;
      httpRequest.send(options.data);
    }
  );
};

Ajax.post = (options) => {
  return Ajax({
    url: options.url, 
    data: options.data, 
    method: "POST"
  });
};

Ajax.get = (options) => {
  return Ajax({
    url: options.url,
    method: "GET"
  });
};

Ajax.post.json = (options) => {
  let data = JSON.stringify(options.data);

  return Ajax({
    url: options.url, 
    data: data,
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Content-Length": data.length
    }
  });
};

Ajax.get.json = (options) => {
  return Ajax({
    url: options.url, 
    method: "GET",
    headers: {
      "Content-Type": "application/json;charset=UTF-8"
    }
  });
};

export default Ajax;
