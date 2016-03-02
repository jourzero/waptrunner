
Template.findingsTmpl.helpers({
    // Get list of issues from issues collection
    myIssues: function () {
       console.log("Getting list of issues");
       prj = {};
       
       // Get the project name from the UI
       var prjName = $("#PrjName").val();
       prj["PrjName"] = prjName;
       console.log("Getting issue list for project " + prjName);
       return issueColl.find(prj,{sort: {IPriority: -1, TIssueName: 1}}).fetch().map(function (it) {
            URIs = it.IURIs;
            count=0;
            if (URIs !== undefined)
                count = URIs.split("\n").length;
            return {_id: it._id,TIssueName: it.TIssueName,CweId: it.CweId,TID: it.TID,ICount: count,TSeverity: it.TSeverity,TSeverityText: it.TSeverityText,IPriority: it.IPriority, IPriorityText: it.IPriorityText, IEvidence: it.IEvidence, INotes: it.INotes};
       });
    },
});