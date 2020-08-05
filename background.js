var url_patterns = [
  "https://code.jquery.com/jquery-*.js",
  "https://ajax.googleapis.com/ajax/libs/*",
  "https://ajax.googleapis.com/ajax/libs/*?*",
  "https://fonts.googleapis.com/*",
  "https://fonts.googleapis.com/*?*",
  "https://cdnjs.cloudflare.com/ajax/libs/*",
  "https://cdnjs.cloudflare.com/ajax/libs/*?*"
];
var scriptCDNs = [
  /https:\/\/ajax\.googleapis\.com/,
  /https:\/\/cdnjs\.cloudflare\.com/
];
const googleFonts = /https:\/\/fonts\.googleapis\.com/;
function handleRequest(requestDetails) {
  console.log("Checking: " + requestDetails.url);
  if(redirect) {
    var response = matchCDN(requestDetails.url);
    if(response) return response;
  }
  var libraryDetails = getLibraryType(requestDetails.url);
  if(libraryDetails.type == "unknown") return {};
  return getLocalResponse(libraryDetails);
}

function matchCDN(url) {
  for(const cdn of scriptCDNs) {
    if(cdn.test(url)) return {
      redirectUrl: url.replace(cdn, scriptAddress)
    }
  }
  if(googleFonts.test(url)) return {
    redirectUrl: url.replace(googleFonts, "https://fonts.font.im")
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
      const urlindex = userblocks.urls.indexOf(message.url);
      if(urlindex > -1) userblocks.urls.splice(urlindex, 1);
      browser.storage.sync.set({
        userblocks: userblocks
      })
      .then(function() {
        browser.runtime.reload();
      });
      return;
    case "removeReg":
      const regindex = userblocks.regexps.indexOf(message.reg);
      if(regindex > -1) userblocks.regexps.splice(regindex, 1);
      browser.storage.sync.set({
        userblocks: userblocks
      })
      .then(function() {
        browser.runtime.reload();
      });
      return;
    case "addUrl":
      userblocks.urls.push(message.url);
      browser.storage.sync.set({
        userblocks: userblocks
      })
      .then(function() {
        browser.runtime.reload();
      });
      return;
    case "addReg":
      userblocks.regexps.push(message.reg);
      browser.storage.sync.set({
        userblocks: userblocks
      })
      .then(function() {
        browser.runtime.reload();
      });
      return;
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
    if(userBlockEnabled && (userblocks.urls.length)) blockListener = addBlockListener();
    else if(userblocks.urls.length) browser.webRequest.onBeforeRequest.removeListener(blockListener);
  }
}

function loadLocalSettings() {
  redirect = !(!browser.storage.sync.get("redirect"));
  let scriptAddress_promise = browser.storage.sync.get("scriptAddress");
  scriptAddress_promise.then(
    function(result) {
    if(result.scriptAddress == undefined) scriptAddress = "https://cdn.bootcdn.net";
    else scriptAddress = result.scriptAddress;
  });
  let blocks_promise = browser.storage.sync.get("userblocks");
  blocks_promise.then(
    function(result) {
      if(result.userblocks) userblocks = result.userblocks;
    }
  );
  userBlockEnabled = userBlockEnabled || browser.storage.sync.get("userBlockEnabled");
}

var redirect = true;
var scriptAddress = "";
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
if(userBlockEnabled && (userblocks.urls.length)) blockListener = addBlockListener();
browser.runtime.onMessage.addListener(handleMessage);
browser.runtime.onInstalled.addListener(async ({ reason, temporary }) => {
  if (temporary) return; // skip during development
  switch (reason) {
    case "install":
      {
        const url = browser.runtime.getURL("onboard/index.html");
        await browser.tabs.create({ url });
      }
      break;
  }
});
