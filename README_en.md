# Block Contained

Please note that this document is not an exact translation of the Chinese document.

## What is it?
Block Contained is an **Add-on** (Extension, Plugin or whatever name you prefer...) for Firefox.
It is intended for users in Mainland China. It speeds up loading for some foreign sites through redirecting, substituting, or cancelling requests to blocked websites. It is only a *practice project* of mine, so please don't expect too much.
## What isn't it?
Block Contained is **not** proxy software. It speeds up loading by redirecting blocked requests to CDNs (Google, Cloudflare, etc.). Therefore all your traffic will still be limited by the Firewall. It also means that the features provided comply with applicable laws.
## How does it work?
When browsing inside the Great Firewall, you'll notice that not only sites like Reddit and Facebook are blocked, some other "innocent" sites also won't load correctly. The reason behind is that these sites use external scripts from blocked CDNs that either reset your connection or time out your browser. Block Contained tries to address this issue by:
- **Redirecting** requests to sites that utilizes the cdnjs API to an accessible CDN
- **Substituting** a small range of JavaScript libraries with local resources
- **Cancelling** requests to blocked sites that don't match anything above, preventing the browser from wasting time trying to connect
## Notes on the settings
Most of the settings are self-explanatory. See below for notes for some of the settings.
### Custom Blocking Rules
You can create custom rules for request cancelling. The request must match any of the URL match patterns **AND** any of the regular expressions to be blocked. For how to write URL match patterns, read [this](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns). The regular expressions should be written in JavaScript flavor.
## FAQ
### How do I get this Add-on?
Block Contained is still under development and not all features work as intended now. So it will not be published to AMO any time soon. If you really want to try it out, please clone this repository and use the `about:debugging` page to [load it as a temporary Add-on](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/). Because I didn't upload images used in the UI, it probably won't display correctly. I may upload the whole workspace as a release package later.
