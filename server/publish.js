Meteor.publish('projects', function(){
    
    if (!this.userId) {
        //this.ready();
        return;
    }

    console.log("Getting list of projects");
    return prjColl.find({"name" : {$regex : gPrjSubset}},{sort: {name: -1}});
});

Meteor.publish('CWEs', function(){
    
    if (!this.userId) {
        //this.ready();
        return;
    }

    console.log("Getting list of CWEs");
    return cweColl.find();
});


Meteor.publish('testKBs', function(){
    
    if (!this.userId) {
        //this.ready();
        return;
    }

    console.log("Getting list of testKB entries");
    return testkbColl.find();
});


Meteor.publish('issues', function(){
    
    if (!this.userId) {
        //this.ready();
        return;
    }

    console.log("Getting list of issues");
    return issueColl.find();
});