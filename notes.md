# Base Config

## OS
* Install some packages to bare VM: `yum install net-tools bind-utils mlocate`

## Choose deployment mode
* Consider http://guide.meteor.com/deployment.html#custom-deployment
> For now, I'm using a normal dev environment and pushing code directly (DevOps mode).

## MongoDB

* Install MongoDB to have the server-side executables.

```
  wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-amazon-3.2.1.tgz
  tar xvfz mongodb-linux-x86_64-amazon-3.2.1.tgz 
  move directory to /opt/mongo
```

## Meteor

* Install Meteor
```
  # curl https://install.meteor.com/ | sh
  [...]
  Meteor 1.2.1 has been installed in your home directory (~/.meteor).
  Writing a launcher script to /usr/local/bin/meteor for your convenience.
  
  To get started fast:
    $ meteor create ~/my_cool_app
    $ cd ~/my_cool_app
    $ meteor
  Or see the docs at:
    docs.meteor.com
```

# Setup DevOps Environment

* Create Meteor project
```
  $ cd /opt/
  $ mkdir meteor
  $ cd meteor/
  $ meteor create waptrunner
```

* Add Meteor packages
```
  [root@waptr1 meteor]# meteor add sergeyt:typeahead
```

* Setup the environment for Meteor
```
  export ROOT_URL=http://localhost
  export PORT=3000
  export MONGO_URL=mongodb://localhost:27017/meteor
  export MONGO_OPLOG_URL=mongodb://localhost:27017/local
```

* Restore BD from Dev
```
  cd ...
  ./restorePR.sh  meteor.backup.20160204
```

# Notes:
* Markdown Ref.: https://help.github.com/articles/basic-writing-and-formatting-syntax/
