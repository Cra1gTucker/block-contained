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
    let blockList = browser.storage.sync.get("userblocks");
    blockList.then(function(result) {
        loadBlockList(result.blockList);
    },
    function(error) {
        blockList = {
            "urls": [],
            "regexps": []
        };
    });
}

function loadBlockList(blockList) {
    let rulesdiv = document.getElementById("rules").innerHTML;
    for(const url of blockList.urls) {
        rulesdiv += (`<p class="url-list-item">${url}</p>
        <button class="removeUrlButton" id="${url}">remove</button>`);
    }
    for(const element of document.querySelectorAll(".removeUrlButton")){ 
        element.addEventListener("click", removeUrl);
    }
    for(const reg of blockList.regexps) {
        rulesdiv += (`<p class="reg-list-item">${reg}</p>
        <button class="removeRegButton" id="${reg}">remove</button>`);
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

document.addEventListener("DOMContentLoaded", loadAllOptions);
document.querySelector("#redirect").addEventListener("click", savePageOptions);
document.querySelector("#block").addEventListener("click", savePageOptions);