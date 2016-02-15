
// Add new entry to TestKB
function newTest() {

    kvp = {}; mod = {};
    tid = new Date().toISOString().split(".")[0].replace(/[-:]/g, '');
    kvp._id       = new Mongo.ObjectID();
    kvp.TID       = "EXT-" + tid;
    kvp.TSource   = "Extras";
    kvp.TTestName = ""; 
    $("#TTestName").val("");
    kvp.TPhase    = "Extras";
    mod["$set"] = kvp;
    id = testkbColl.insert(kvp);
    alert("Inserted new test EXT-" + tid + " (" + id + "). Pls fill other fields.");
}

// Update Test KB upon changes in the UI
function updateTestKBFromUI(tgtId, tgtVal) {

    oid = $("#OID").val();
    newVal = tgtVal;
    if ((tgtId === 'TPCI') || (tgtId === 'TTop10') || (tgtId === 'TTop25') || (tgtId === 'TStdTest'))
        newVal = $("#" + tgtId).prop("checked");

    console.log("Updating TestKB for OID " + oid + ": " + tgtId + "=" + newVal);
    kvp = {};
    mod = {};
    kvp[tgtId] = newVal;
    mod["$set"] = kvp;
    n = testkbColl.update(new Mongo.ObjectID(oid), mod);
    console.log("Number of updated records: " + n);
}



// Update/insert issue data from UI into the project collection
function saveIssueDataFromUI(tgtId, tgtVal) {

    // Get common issue values from UI
    //tid         = $( "#testSel option:selected" ).text();
    tid         = $( "#testSel option:selected" ).val();
    cid         = $('#cweref').html();
    issueName   = $('#TIssueName').val();
    prjName     = $('#PrjName').val();

    // Check that the UI has the mandatory data we need
    if ((tid === undefined) || (tid === "")){
        alert("Cannot save issue data: Missing Test ID.");
        return;
    }
    if ((issueName === undefined) || (issueName === "")){
        alert("Cannot save issue data: Missing Issue Name.");
        return;
    }

    // Check if issue already exists
    console.log("Saving issue data for TID " +tid + ": " + tgtId + "=" + tgtVal);
    var issue={}; var mod={}; var oid={};
    oid.TID     = tid;
    issue.CweId = cid;
    issue.TID   = tid;
    issue.TIssueName = issueName;    
    issue.TSeverity  = $('#TSeverity').val();
    issue.TSeverityText = $("#TSeverity option:selected").text();
    issue.IURIs      = $('#IURIs').val();
    issue.IEvidence  = $('#IEvidence').val();
    issue.IPriority  = $('#IPriority').val();
    issue.IPriorityText  = $("#IPriority option:selected").text();
    issue.INotes     = $('#INotes').val();
    issue.PrjName    = prjName;

    mod["$set"] = issue;
    console.log("Checking if entry exists for issue");
    i = issueColl.findOne(oid);

    // If the issue doesn't exist, insert a new record. If not, use upsert.
    if ((i === undefined) || (i._id <= 0)){
        console.log("Adding new issue with CweID=" + cid);
        mid = issueColl.insert(issue);
        console.log("Mongo _id for new record: " + mid);
    }
    else{
        console.log("Updating issue data for object " + i._id);
        mid = issueColl.upsert(i._id, mod);
        console.log("Mongo _id for new record: " + mid);        
    }    
}

// Save the project data (scope and scopeQry)
function saveProjectDataFromUI() {
    var prjName = Session.get("projectName");
    if ((prjName === undefined) || (prjName === "")){
        console.log("Empty Project Name");
        return;
    }        
    var prj = {}, pid = {}, mod={};
    pid.name = prjName;
    prj.name = prjName;
    prj.notes= $("#PrjNotes").val();
    prj.software= $("#PrjSoftware").val();
    prj.scope = $("#ScopeSel option:selected" ).attr('title');
    prj.scopeQry = $("#ScopeSel").val();
    prj.lastTID = $("#testSel").val();

    mod["$set"] = prj;
    i = prjColl.findOne(pid);

    // If the issue doesn't exist, insert a new record. If not, use upsert.
    if ((i === undefined) || (i._id <= 0)){
        console.log("Inserting a new project " + prjName);
        mid = prjColl.insert(prj);
    }
    else{
        console.log("Updating project data for project " + prjName + ". ID: " + i._id);
        mid = prjColl.upsert(i._id, mod);
    }
}
