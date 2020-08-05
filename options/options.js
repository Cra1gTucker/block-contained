function savePageOptions(e) {
    browser.storage.sync.set({
        redirect: document.querySelector("#redirect").checked,
        userBlockEnabled: document.querySelector("#block").checked
    });
    browser.runtime.sendMessage({
        "cmd": "reload",
        "settings": {
            "redirect": document.querySelector("#redirect").checked,
            "userBlockEnabled": document.querySelector("#block").checked
        }
    });
}

function loadAllOptions() {
    let pageOptions = {
        "redirect": browser.storage.sync.get("redirect"),
        "userBlockEnabled": browser.storage.sync.get("userBlockEnabled")
    };
    pageOptions.redirect.then(function(result) {
        document.querySelector("#redirect").checked = !(!result.redirect);
    });
    pageOptions.userBlockEnabled.then(function(result) {
        document.querySelector("#block").checked = !(!result.userBlockEnabled);
    });
    blockList = browser.storage.sync.get("userblocks");
    blockList.then(function(result) {
        loadBlockList(result.userblocks);
    },
    function(error) {
        blockList = {
            "urls": [],
            "regexps": []
        };
    });
}

function loadBlockList(blockList) {
    if(!blockList || (!blockList.urls.length && !blockList.regexps.length)) return;
    let rulesdiv = document.getElementById("rules");
    for(const url of blockList.urls) {
        rulesdiv.innerHTML += (`<p class="url-list-item">${url}
        <button class="removeUrlButton" id="${url}">remove</button></p>`);
    }
    for(const reg of blockList.regexps) {
        rulesdiv.innerHTML += (`<p class="reg-list-item">${reg}
        <button class="removeRegButton" id="${reg}">remove</button></p>`);
    }
    for(const element of document.querySelectorAll(".removeUrlButton")){ 
        element.addEventListener("click", removeUrl);
    }
    for(const element of document.querySelectorAll(".removeRegButton")){ 
        element.addEventListener("click", removeReg);
    }
}

function removeUrl(e) {
    //Only send message here, saving the list is background script's job
    browser.runtime.sendMessage({
        "cmd": "removeUrl",
        "url": `${e.target.id}`
    })
    .then(browser.tabs.reload);
}

function removeReg(e) {
    browser.runtime.sendMessage({
        "cmd": "removeReg",
        "reg": `${e.target.id}`
    })
    .then(browser.tabs.reload);
}

function addUrl(e) {
    browser.runtime.sendMessage({
        "cmd": "addUrl",
        "url": `${document.getElementById("newSite").value}`
    })
    .then(browser.tabs.reload);
}

function addReg(e) {
    browser.runtime.sendMessage({
        "cmd": "addReg",
        "reg": `${document.getElementById("newReg").value}`
    })
    .then(browser.tabs.reload);
}


var blockList = {
    "urls": [],
    "regexps": []
};

document.addEventListener("DOMContentLoaded", loadAllOptions);
document.querySelector("#redirect").addEventListener("click", savePageOptions);
document.querySelector("#block").addEventListener("click", savePageOptions);
document.querySelector("#addSite").addEventListener("click", addUrl);
document.querySelector("#addReg").addEventListener("click", addReg);