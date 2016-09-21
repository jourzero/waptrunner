// Update all UI fields from the Test KB
function updateUIFromTestKB() {
    // Clear testDB fields before updating them because some UI updates fail due to missing value in DB.
    clearTestingFields();

    var oid = $("#testSel option:selected" ).attr('oid');
    console.log("Updating UI from TestKB doc " + oid);
    rec = testkbColl.findOne(new Mongo.ObjectID(oid));
    if (rec === undefined){
        console.log("WARNING: Cannot update UI from TestKB. Could not find record for oid", oid);
        return;
    }
    $("#TPhase").html(rec.TPhase);
    $("#TSection").html(rec.TSection);
    $("#TTestName").val(rec.TTestName);
    $("#TTestName").attr('title', rec.TTesterSupport);
    $("#TIssueName").val(rec.TIssueName);
    $("#TIssueType").val(rec.TIssueType);
    $("#TType").val(rec.TType);
    $("#TDescr").val(rec.TDescr);
    $("#TSeverity").val(rec.TSeverity);
    $("#TTesterSupport").val(rec.TTesterSupport);
    $("#TTesterSupport").attr('title', rec.TTesterSupport);
    $("#TTRef").val(rec.TTRef);
    $("#TTRef2").val(rec.TTRef2);
    testRef = rec.TTRef;
    if ((testRef !== undefined)&&(!testRef.startsWith("http")))
        testRef = gTestRefBase + testRef;
    testRef2 = rec.TTRef2;
    if ((testRef2 !== undefined)&&(!testRef2.startsWith("http")))
        testRef2 = gTestRefBase + testRef2;
    $("#TTRefA").attr('href', testRef);
    $("#TTRef2A").attr('href', testRef2);
    $("#TRef1").val(rec.TRef1);
    $("#TRef1A").attr('href', rec.TRef1);
    $("#TRef2").val(rec.TRef2);
    $("#TRef2A").attr('href', rec.TRef2);
    $("#TPCI").prop('checked', rec.TPCI);
    $("#TTop10").prop('checked', rec.TTop10);
    $("#TTop25").prop('checked', rec.TTop25);
    $("#TStdTest").prop('checked', rec.TStdTest);
    updateCweUI(rec.TCweID);
    $('#testNameTA').val("");
}


// Update all UI fields from the Issue Collection
function updateUIFromIssueColl() {

    // Clear the values before populating them
    var empty= "";
    $("#IURIs").val(empty);
    $("#IURIs").attr("title", empty);
    $("#IEvidence").val(empty);
    $("#IEvidence").attr("title", empty);
    $("#INotes").val(empty);
    $("#INotes").attr("title", empty);
    $("#IPriority").val(empty);       
    

    // Get Test ID as search criteria
    tid = $( "#testSel option:selected" ).val();
    if ((tid === undefined) || (tid === "")){
        console.log("Empty Test ID");
        return;
    }
    
    // Get the project name
    var prjName = Session.get("projectName");

    // Build search criteria
    var crit={}; var kvp1 = {}; var kvp2 = {};
    kvp1.TID = tid;
    kvp2.PrjName = prjName;
    crit["$and"] = [kvp1, kvp2];
    var i = issueColl.findOne(crit);
    if ((i === undefined) || (i._id <= 0)){
        console.log("No issue data found for this Test ID: " + tid);
        return;
    }

    // Update UI values
    $("#IURIs").val(i.IURIs);
    $("#IURIs").attr("title", i.IURIs);
    $("#IEvidence").val(i.IEvidence);
    $("#IEvidence").attr("title", i.IEvidence);
    $("#INotes").val(i.INotes);
    $("#INotes").attr("title", i.INotes);
    $("#IPriority").val(i.IPriority);  
    updateCweUI(i.CweId);
}    


// Refresh UI for consistency
function refreshLastTIDLink() {
    // Update lastTID text in UI
    var lastTID = Session.get("lastTID");
    console.log("Updating lastTID text to " + lastTID);
    $("#lastTIDTxt").html("Continue from " + lastTID);
}


// Create template text into finding sections
function addIssueTemplateTextToUI(){
    
    // Fill Evidence field with template text if empty
    var iEvidence = $("#IEvidence").val();
    if ((iEvidence === undefined)||(iEvidence.length === 0)){
        console.log("Adding template text to Evidence field");
        iEvidence = "=== REQUEST ===\nPLACEHOLDER\n\n=== RESPONSE ===\nPLACEHOLDER";
        $("#IEvidence").val(iEvidence);
        $("#IEvidence").attr("title", iEvidence);
    }

    // Fill Notes field with template text if empty
    var iNotes    = $("#INotes").val();
    if ((iNotes === undefined)||(iNotes.length === 0)){
        console.log("Adding template text to Notes field");
        iNotes  = "ISSUE_DETAILS. CIA_IMPACT. HOW_TO_EXPLOIT.\n\n";
        iNotes += "Perceived Risk: Likelihood=High (Easy to Reproduce, Easy to Discover), Impact=Medium (Partial Damage, Easy to Exploit, Some Users Affected)\n\n"
        iNotes += "To Replicate:\n  1. Browse to URI\n  2. ACTION1\n  3. ACTION2\n\n";
        iNotes += "To Mitigate: See CWE link for more details.";
        $("#INotes").val(iNotes);
        $("#INotes").attr("title", iNotes);
    }
}


// Update UI with CWE data
//function updateCweUI(cweId, cweName, cweDescr) {
function updateCweUI(cweId) {
    var cwe = {}; var rec={};
    if ((cweId !== undefined)&&(cweId != "")){
        console.log("Updating UI for CWE-" + cweId);
        $('#cweid').val(cweId);
        $('#cweref').attr('href', gCweUriBase + cweId + ".html");
        $('#cweref').html(cweId);
        cwe.ID = cweId;
        rec = cweColl.findOne(cwe);
        if (rec !== undefined){
            
            // Update the description in the title (visible via hovering)
            var descr = rec.Name + ": " + rec.Description_Summary;
            console.log("Updating Description for CWE-" + cweId);
            $('#cweref').attr('title', descr);

            // Update the CWE name in the typehead field
            var name  = rec.Name;
            console.log("Updating CWE Name to " + name);
            $('#cwename').typeahead('val', name);
        }

        // If the issue name is empty, use the CWE name.
        issueName = $("#TIssueName").val();
        if (issueName.length <= 0) {
            $("#TIssueName").val(name);
        }
    }
    else {
        console.log("Clearing CWE values");
        $('#cweid').val("");
        $('#cweref').attr('href', "");
        $('#cweref').html("");
        $('#cweref').attr('title', "");
        $('#cwename').typeahead('val', "");
    }
}


// Update scope when changing the project 
function updateUIFromPrj() {

    // Get project name from UI and make sure it's not empty
    var prjName = Session.get("projectName");        
    if ((prjName === undefined) || (prjName === "")){
        console.log("Empty Project Name");
        return;
    }
    console.log("Updating UI for project " + prjName);

    // Build search criteria
    var prj = {}, pid = {}, mod={};
    pid.name = prjName;
    prj.name = prjName;
    mod["$set"] = prj;
    console.log("Checking if entry exists for project " + prjName);
    p = prjColl.findOne(pid);

    // If the issue exists, get the data
    if ((p === undefined) || (p._id <= 0)){
        console.log("No data found for project " + prjName);
        return;
    }        

    // Update UI values
    $("#PrjNotes").val(p.notes);
    $("#PrjNotes").attr('title', p.notes);
    if (p.software !== undefined){
        $("#PrjSoftware").val(p.software);
        var swList = p.software.split(",");
        var swLinksHtml="";
        for (i=0; i<swList.length; i++){
            swLinksHtml += "<a class='smallLink' href='" + gCveRptBase + swList[i].trim() + gCveRptSuffix +"' target='cveRptUI'>" + swList[i].trim() + "</a>&nbsp;&nbsp;";
        }
        $("#CveRptLinks").html(swLinksHtml);
    }

    // Get scope query and set the session variable
    scopeQry = p.scopeQry;
    console.log("Updating scope to '" + scopeQry + "'");
    $("#ScopeSel").val(scopeQry);
    Session.set("projectScope", scopeQry);

    // Update last test ID link and session variable if possible
    var lastTID = p.lastTID;
    if (lastTID !== undefined){
       console.log("Last TID: " + lastTID);
       Session.set("lastTID", lastTID);
       $("#lastTIDTxt").html("Continue from " + lastTID);
   }
}    

// Clear Project Information
function clearProjectFields() {
    $("#PrjSoftware").val("");
    $("#CveRptLinks").html("");        
    $("#PrjNotes").val("");
    $("#PrjNotes").attr('title', "");
    $("#ScopeSel").prop("selectedIndex", 0);
}

// Clear Issue Information
function clearIssueFields() {
    $('#cwename').typeahead('val', "");
    $('#cweref').attr('href', "");
    $('#cweref').html("");
    $("#IURIs").val("");
    $("#IEvidence").val("");
    $("#INotes").val("");
    $("#IPriority").prop("selectedIndex", 0);        
}

// Clear Testing Information
function clearTestingFields() {
    $("#testSel").prop("selectedIndex", 0);
    $("#TPhase").html("");
    $("#TSection").html("");
    $('#testNameTA').typeahead('val', "");
    $("#TTestName").val("");
    $("#TType").val("");
    $("#TTesterSupport").val("");""
    $("#TTesterSupport").attr('title', "");
    $("#TDescr").val("");
    $("#TTRef").val("");
    $("#TTRefA").attr('href', "");
    $("#TTRef2").val("");
    $("#TTRef2A").attr('href', "");
    $("#TIssueName").val("");
    $("#TIssueType").val("");
    $("#TSeverity").prop("selectedIndex", 0);
    $("#TRef1").val("");
    $("#TRef1A").attr('href', "");
    $("#TRef2").val("");
    $("#TRef2A").attr('href', "");
    $("#TPCI").prop('checked', false);
    $("#TTop10").prop('checked', false);
    $("#TTop25").prop('checked', false);
    $("#TStdTest").prop('checked', false);
}

// Clear all UI values when changing project
function clearUI() {
    clearProjectFields();
    clearTestingFields();
    clearIssueFields();
}
