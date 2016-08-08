# General Notes

The below notes are not usable directly by anyone else but the author.

## Base Config

### OS
* Install some packages to bare VM: `# yum install net-tools bind-utils mlocate`

### Choose deployment mode
* Consider http://guide.meteor.com/deployment.html#custom-deployment

> For now, I'm using a normal dev environment and pushing code directly (DevOps mode).


### Meteor

* Install Meteor
```
$ curl https://install.meteor.com/ | sh
[...]
Meteor 1.2.1 has been installed in your home directory (~/.meteor).
Writing a launcher script to /usr/local/bin/meteor for your convenience.
```

## Setup DevOps Environment

* Create Meteor project
```
$ cd /opt/
$ mkdir meteor
$ cd meteor/
$ meteor create waptrunner
```

* Add Meteor packages
```
$ cd waptrunner
$ meteor add sergeyt:typeahead              # Typeahead for CWE Name and Test Name lookups
$ meteor add accounts-ui accounts-google    # Google OAuth (or the below)
$ meteor add accounts-ui accounts-password  # Plain password
$ meteor add jaredmartin:future             # For remote exec of git-update.sh
$ meteor add iron:router                    # Enable routing to server different pages (registration, CSV output...)
$ meteor add session

Optionally:
$ meteor add appcache                       # Enable browser caching 
$ meteor add meteorhacks:npm                # Enable use of NPM from within Meteor (to use Node.js APIs)
$ meteor add dburles:eslint                 # Javascript static analysis
```

* Remove Autopublish
```
$ meteor remove autopublish
```

* Restore BD from Dev
```
$ cd ...
$ ./restorePR.sh  meteor.backup.20160204
```

## Misc Notes
* Markdown Ref.: https://help.github.com/articles/basic-writing-and-formatting-syntax/
