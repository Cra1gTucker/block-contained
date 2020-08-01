var url_patterns = [
  "https://code.jquery.com/jquery-*.js",
  "https://ajax.googleapis.com/ajax/libs/*",
  "https://ajax.googleapis.com/ajax/libs/*?*",
  "https://*.google.com/*",
  "https://cdnjs.cloudflare.com/ajax/libs/*",
  "https://cdnjs.cloudflare.com/ajax/libs/*?*"
];
var knownCDN = [
  /https:\/\/ajax\.googleapis\.com/,
  /https:\/\/cdnjs\.cloudflare\.com/
];
function handleRequest(requestDetails) {
  console.log("Checking: " + requestDetails.url);
  if(redirect) {
    var response = matchKnownCDN(requestDetails.url);
    if(response) return response;
  }
  var libraryDetails = getLibraryType(requestDetails.url);
  if(libraryDetails.type == "unknown") return {};
  return getLocalResponse(libraryDetails);
}

function matchKnownCDN(url) {
  for(const cdn of knownCDN) {
    if(cdn.test(url)) return {
      redirectUrl: url.replace(cdn, CDNaddress)
    }
  }
}

function versionWarning(libraryDetails) {
  console.warn("Unknown version: " + libraryDetails.type + " " + libraryDetails.version);
}

function getLocalResponse(libraryDetails) {
  switch(libraryDetails.type) {
    case "jquery":
      switch(libraryDetails.version) {
        case 1:
          return {
            redirectUrl: browser.extension.getURL("resources/jquery-1.11.3.js")
          };
        case 2:
          return {
            redirectUrl: browser.extension.getURL("resources/jquery-2.2.4.min.js")
          };
        default:
          versionWarning(libraryDetails);
        case 3:
          return {
            redirectUrl: browser.extension.getURL("resources/jquery-3.5.1.min.js")
          };
      }
    case "jquery-migrate":
      switch(libraryDetails.version) {
        case 1:
          return {
            redirectUrl: browser.extension.getURL("resources/jquery-migrate-1.4.1.min.js")
          };
        case 3:
          return {
            redirectUrl: browser.extension.getURL("resources/jquery-migrate-3.3.1.min.js")
          };
//For jquery-migrate we do not assume any version used, we do nothing to the request.
        default:
          versionWarning(libraryDetails);
          return {};
      }
    case "jquery.lazy":
      switch(libraryDetails.version) {
        default:
          versionWarning(libraryDetails);
        case 1:
          return {
            redirectUrl: browser.extension.getURL("resources/jquery.lazy-1.7.9.min.js")
          };
      }
    case "jquery.lazy.plugins":
      switch(libraryDetails.version) {
        default:
          versionWarning(libraryDetails);
        case 1:
          return {
            redirectUrl: browser.extension.getURL("resources/jquery.lazy.plugins-1.7.9.min.js")
          };
      }
    case "google":
      console.log("Blocked: " + libraryDetails.type);
      return {
        cancel: true
      };
    default:
//Something unexpected here. We do nothing to the request.
      console.warn("Unknown library: " + libraryDetails.type);
      return {};
  }
}

function getLibraryType(url) {
  var match = -1;
  match = url.search(/\/jquery-\d.*\.js/);
  if(match != -1) {
    return {
      type: "jquery",
      version: Number(url[match + 8])
    };
  }
  match = url.search(/.*\.google\.com\/.*/);
  if(match != -1) {
    return {
      type: "google",
      version: -1
    };
  }
  match = url.search(/\/[\d.]+\/jquery-migrate\.min\.js/);
  if(match != -1) {
    return {
      type: "jquery-migrate",
      version: Number(url[match + 1])
    };
  }
  match = url.search(/\/[\d.]+\/jquery\.min\.js/);
  if(match != -1) {
    return {
      type: "jquery",
      version: Number(url[match + 1])
    };
  }
  match = url.search(/\/[\d.]+\/jquery\.lazy\.min\.js/);
  if(match != -1) {
    return {
      type: "jquery.lazy",
      version: Number(url[match + 1])
    };
  }
  match = url.search(/\/[\d.]+\/jquery\.lazy\.plugins\.min\.js/);
  if(match != -1) {
    return {
      type: "jquery.lazy.plugins",
      version: Number(url[match + 1])
    };
  }
  return {
    type: "unknown",
    version: -1
  };
}

function handleMessage(message) {
  switch(message.cmd) {
    case "reload":
      loadPageSettings(message.settings);
      return;
    case "removeUrl":
      
    default:
      console.warn("Undefined cmd: " + message.cmd);
  }
}

function handleBlock(requestDetails) {
  for(const regexp of userblocks.regexps) {
    if(regexp.test(requestDetails.url)) {
      console.log("Blocking: " + requestDetails.url);
      return {
        cancel: true
      };
    }
  }
  return {};
}

function addBlockListener() {
  return browser.webRequest.onBeforeRequest.addListener(
    handleBlock,
    {urls:userblocks.urls},
    ["blocking"]
  );
}

function loadPageSettings(settings) {
  redirect = settings.redirect;
  if(settings.userBlockEnabled != userBlockEnabled) {
    userBlockEnabled = settings.userBlockEnabled;
    if(userBlockEnabled) browser.webRequest.onBeforeRequest.removeListener(blockListener);
    else blockListener = addBlockListener();
  }
}

function loadLocalSettings() {
  redirect = !(!browser.storage.sync.get("redirect"));
  CDNaddress = CDNaddress || browser.storage.sync.get("CDNaddress");
  userblocks = userblocks || browser.storage.sync.get("userblocks");
  userBlockEnabled = userBlockEnabled || browser.storage.sync.get("userBlockEnabled");
}

var redirect = true;
var CDNaddress = "https://cdn.bootcdn.net";
var userblocks = {
  "urls": [],
  "regexps": []
};
var userBlockEnabled = false;
var blockListener;
loadLocalSettings();
browser.webRequest.onBeforeRequest.addListener(
  handleRequest,
  {urls:url_patterns, types:["script", "stylesheet"]},
  ["blocking"]
);
if(userBlockEnabled) blockListener = addBlockListener();
browser.runtime.onMessage.addListener(handleMessage);
