function saveOptions(e) {
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

function loadPageOptions() {
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
}

document.addEventListener("DOMContentLoaded", loadPageOptions);
document.querySelector("#redirect").addEventListener("click", saveOptions);
document.querySelector("#block").addEventListener("click", saveOptions);