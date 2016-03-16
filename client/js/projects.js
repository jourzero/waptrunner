Meteor.subscribe('projects');

Template.projectsTmpl.helpers({
    // Get Projects from project collection
    projects: function () {
        console.log("Getting list of projects");
        return prjColl.find({"name" : {$regex : gPrjSubset}},{sort: {name: -1}});
    },
});