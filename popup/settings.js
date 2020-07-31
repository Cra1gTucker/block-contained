function saveOptions(e) {
    browser.storage.sync.set({
        redirect: document.querySelector("#redirect").checked
    });
    browser.runtime.sendMessage({
        "cmd": "reload",
        "settings": {
            "redirect": document.querySelector("#redirect").checked
        }
    });
}

function loadOptions() {
    let redirect = browser.storage.sync.get("redirect");
    redirect.then(function(result) {
        document.querySelector("#redirect").checked = !(!result.redirect);
    }, function(error) {
        console.warn(`Error: ${error}`);
    });
}
document.addEventListener("DOMContentLoaded", loadOptions);
document.querySelector("#redirect").addEventListener("click", saveOptions);