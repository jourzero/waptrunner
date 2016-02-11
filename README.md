# waptrunner

This is a tool that helps me run through web app pen tests by stepping through various tests and log issues easily without taking too much screen space. 

Current Feature Set:
* Multi-project
* Multi-methodology
* Test stepping
* Dynamic Test KB updates
* Dynamic, color-coded issue list, per project
* Auto-type test names and CWEs 
* Ability to add new tests based on new CVEs or other
* CVE search on cvedetails.com
* Update app using Update button that triggers download of updated code on github (from the server side).

TODO:
* Add prep scripts to GIT repo
* Access control (multi-user support)
* Push sanitized subset of my MongoDB to GIT or Meteor cloud
* Export to CSV from UI
* Maybe export as SSVL for Threadfix import
