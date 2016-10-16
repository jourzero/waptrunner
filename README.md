# waptrunner

This is a tool that helps me run through web app pen tests by stepping through various tests and log issues easily without taking too much screen space. 

## Current Features
* Multi-project
* Multi-methodology
* Test stepping
* Dynamic Test KB updates
* Dynamic, color-coded issue list, per project
* Auto-type test names and CWEs 
* Ability to add new tests based on new CVEs or other
* CVE search on cvedetails.com
* Update app using Update button that triggers download of updated code on github (from the server side).
* Forms-based auth.
* Export to CSV and HTML from UI
* Import Burp issues from my Clipboarder Burp App. To use it:
 * Download my [Clipboarder extension](https://github.com/jourzero/clipboarder/blob/master/dist/Clipboarder.jar)
 * Add Clipboarder extension to Burp 
 * Select one issue from Target/Issues
 * Use context menu "Copy as free text to clipboard"
 * Paste clipboard content into WAPT Runner's Notes field 
 * Result: Burp issue text will be parsed and UI fields like Issue Name, Evidence, Severity, Priority will be adjusted accordingly.
* Import screenshots from clipboard and paste them into the Paste Area as HTML5 Base64 images.

## TODOs
* Add prep scripts to GIT repo
* Multi-user support
* Push sanitized subset of my MongoDB to GIT or Meteor cloud
* SSVL export to Threadfix
* UI clean-up: remove unused fields, better usability
