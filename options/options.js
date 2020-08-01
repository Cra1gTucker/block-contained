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
    pageOptions.then(function(result) {
        document.querySelector("#redirect").checked = !(!result.pageOptions.redirect);
        document.querySelector("#block").checked = !(!result.pageOptions.userBlockEnabled);
    });
    let blockList = browser.storage.sync.get("userblocks");
    blockList.then(function(result) {
        loadBlockList(result.blockList);
    });
}

function loadBlockList(blockList) {
    let rulesdiv = document.getElementById("rules").innerHTML;
    for(const url of blockList.urls) {
        rulesdiv += (`<p class="url-list-item">${url}</p>
        <button class="removeButton" id="${url}">remove</button>`);
    }
    for(const element of document.querySelectorAll(".removeButton")){ 
        element.addEventListener("click", removeUrl);
    }
}

function removeUrl(e) {
    //Only send message here, saving the list is background script's job
    browser.runtime.sendMessage({
        "cmd": "removeUrl",
        "url": `${e.target.id}`
    });
    browser.tabs.reload();
}

document.addEventListener("DOMContentLoaded", loadAllOptions);
document.querySelector("#redirect").addEventListener("click", savePageOptions);
document.querySelector("#block").addEventListener("click", savePageOptions);