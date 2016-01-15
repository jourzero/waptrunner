// Globals
tPhase       = ""; gTest = {}; gCWE = {}; gEventData = {}; gTmpObj = {}; prj = {};
prjName      = ""; 
defaultScope = "";                  
sesScope     = defaultScope;
cweUriBase   = "https://cwe.mitre.org/data/definitions/";
gLastTID     = "";
testRefBase  = "http://localhost/WAPT/"

// Open Mongo collections
prjColl    = new Mongo.Collection("project");
cweColl    = new Mongo.Collection("cwe");
testkbColl = new Mongo.Collection("testkb");
issueColl  = new Mongo.Collection("issues");


// Code to run on the client side only
if (Meteor.isClient) {
            
    //Template.testRunner.helpers({
    Template.body.helpers({
        
        // Get CWEs from cwe collection
        cwes: function () {
            return cweColl.find().fetch().map(function (it) {
                var exploitability = new String(it.Likelihood_of_Exploit);
                var descr = it.Name + ": " + it.Description_Summary;
                if (exploitability.length > 0)
                    descr += " [Exploitability: " + exploitability + "]";
                gCWE = {value: it.Name, id: it._id, cweId: it.ID, 
                        cweDescr: descr, cweStatus: it.Status, 
                        cweExpl: it.Likelihood_of_Exploit};
                return gCWE;
            });
        },
        
        // Get Projects from project collection
        projects: function () {
            return prjColl.find({},{sort: {name: -1}})
        },
        
        /*
        // Get Project Scope from Session
        projectScope: function () {
            return Session.get("projectScope");
        },
        
        // Get Project Name from Session
        projectName: function () {
            return Session.get("projectName");
        },
        
        // Set TID to last TID
        lastTID: function(){
           var lastTID = Session.get("lastTID");
           console.log("Setting TID to lastTID: " + lastTID);
           $("#testSel").val(lastTID);
           updateUIFromTestKB();
           return lastTID;
        },
        */
        
        // Get list of tests from testkb collection
        myTests: function () {
            sesScope = Session.get("projectScope");
            if (sesScope === undefined) {
                sesScope = defaultScope;
            }
            scopeQry = eval("Object({" + sesScope + "})");            
            //console.log("Getting list of tests from scopeQry '" + sesScope + "'");
            return testkbColl.find(scopeQry,{sort: {TID: 1}}).fetch().map(function (it) {
                gTest = {value: it.TTestName + " (" + it.TSource + ":" + it.TStep + ")", 
                    TID: it.TID, OID: it._id.valueOf(), TSource: it.TSource, 
                    TTestName: it.TTestName, TType: it.TType,
                    TDescr: it.TDescription, TIssueName: it.TIssueName, TIssueType: it.TIssueType,
                    TImpact: it.TImpact,
                    TSeverity: it.TSeverity, TSeverityText: it.TSeverityText,
                    TSolution: it.TSolution,
                    TTesterSupport: it.TTesterSupport,
                    TPhase: it.TPhase, TSection: it.TSection,
                    TStep: it.TStep,
                    TStdTest: it.TStdTest, TRef1: it.TRef1, TRef2: it.TRef2,
                    TTRef: it.TTRef,
                    TCweID: it.TCweID, TPCI: it.TPCI, TTop10: it.TTop10, TTop25: it.TTop25
                };
                return gTest;
            })
        },
        
        // Get list of issues from issues collection
        myIssues: function () {
            prj["PrjName"] = Session.get("projectName");
            console.log("Getting issue list for project " + prj.PrjName);
            return issueColl.find(prj,{sort: {CweId: 1}}).fetch().map(function (it) {
                URIs = it.IURIs;
                count=0;
                if (URIs !== undefined)
                    count = URIs.split("\n").length;
                return {_id: it._id,TIssueName: it.TIssueName,CweId: it.CweId,TID: it.TID,ICount: count,TSeverity: it.TSeverity,TSeverityText: it.TSeverityText,IPriority: it.IPriority, IPriorityText: it.IPriorityText, IEvidence: it.IEvidence, INotes: it.INotes};
            });
        },
        open: function (e) {
            console.log("Dropdown " + e.target.id + " is opened");
        },
        close: function (e) {
            console.log("Dropdown " + e.target.id + " is closed");
        },
        autocomplete: function (e, suggestion, dataset) {
            console.log("Autocompleted: CWE-" + suggestion.cweId);
        },
        // Call this when selecting a CWE after typeahead
        select: function (e, suggestion, dataset) {
            console.log("Selected: CWE-" + suggestion.cweId);
            updateCweUI(suggestion.cweId, suggestion.value, suggestion.cweDescr);
            updateTestKBFromUI("TCweID", suggestion.cweId);
        },
        
        // Call this when selecting a Test Name after typeahead
        selectTN: function (e, suggestion, dataset) {
            console.log("Selected: Test " + suggestion.value);
            //updateCweUI(suggestion.cweId, suggestion.value, suggestion.cweDescr);
            //updateTestKBFromUI("TCweID", suggestion.cweId);
            //gTmpObj=this;
            $("#testSel").val(suggestion.TID);
            updateUIFromTestKB();
        }
    });


    // Event handlers for the issue list
    Template.myIssueTmpl.events({
        
        // Delete Issue
        "click .delete": function (event) {
            gTmpObj=this;
            console.log('Delete clicked from myIssueTmpl! ID=' + this._id);
            issueColl.remove(this._id);
        },
        
        // Show the issue details when clicking in the list
        "click .isTD": function (event) {
            gTmpObj=this;
            console.log('Clicked in myIssueTmpl ID=' + this._id + ". TID=" + this.TID);
            $("#testSel").val(this.TID);
            updateUIFromTestKB();
       }
    }),

            
    // Handle events in body
    Template.body.events({
        'change #PrjName': function () {
            // Get the project name and get its previously saved scope value 
            Session.set("projectName", event.target.value);
            //clearUI();
            updateUIFromPrj();
        },
        'click #PrjName': function () {
            // Clear the input so that a new project can be selected
            console.log("PrjName clicked, clearing Project Name so that the pulldown shows all projects");
            $("#PrjName").val("");
            Session.set("projectName", "");
            clearUI();
        },
        'change #ScopeSel': function (event) {
            Session.set("projectScope", event.target.value);
            saveProjectDataFromUI();
        },
        'change #testSel': function () {
            updateUIFromTestKB();
            saveProjectDataFromUI();
        },
        'click #btnBack': function () {
            selected = $("#testSel").prop("selectedIndex") - 1;
            if (selected <= 0) selected = 1;
            console.log("Selected: " + selected);
            $("#testSel").prop("selectedIndex", selected);
            updateUIFromTestKB();
            $('#testNameTA').val("");
        },
        'click #btnNext': function () {
            selected = $("#testSel").prop("selectedIndex") + 1;
            if (selected >= $('#testSel > option').length)
                selected = $('#testSel > option').length - 1;
            console.log("Selected: " + selected);
            $("#testSel").prop("selectedIndex", selected);
            updateUIFromTestKB();
            $('#testNameTA').val("");
        },
        'change #TTestName': function () {
            console.log('TTestName changed (' + $('#TTestName').val() + "). Enabled New button.");
            $('#kbBtnNew').prop('fd', false);
        },
        'click #kbBtnNew': function () {
            console.log('Creating new test: ' + $('#TTestName').val());
            clearUI
            newTest();
        },       
        'change .testKbIn, change .testKbInShort, change .testKbTA, click .testKbCB, change #cweid, select #cweid, change #cweid, change .sevSelector': function (event) {
            updateTestKBFromUI(event.target.id, event.target.value);
        },
        'change .prioSelector, change .issueTA': function (event) {
            saveIssueDataFromUI(event.target.id, event.target.value);
        },
    }),


    // Initialize typeahead
    Meteor.startup(function () {
        // Initializes all typeahead instances
        Meteor.typeahead.inject();
         
        // Restore session values
        sesScope = Session.get("projectScope");
        if (sesScope === undefined) {
            sesScope = defaultScope;
        }
        $("#ScopeSel").val(sesScope);        
        console.log("Scope restored to " + sesScope);
        
        // Pre-fill project name
        $("#PrjName").val(prjName);
    });


    // Update all UI fields from the Test KB
    function updateUIFromTestKB() {
        var oid = $("#testSel option:selected" ).attr('oid');
        console.log("Updating UI from TestKB doc " + oid);
        rec = testkbColl.findOne(new Mongo.ObjectID(oid));
        $("#OID").val(rec._id.valueOf());
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
        testRef = rec.TTRef;
        if (!testRef.startsWith("http"))
            testRef = testRefBase + testRef;
        $("#TTRefA").attr('href', testRef);
        $("#TRef1").val(rec.TRef1);
        $("#TRef1A").attr('href', rec.TRef1);
        $("#TRef2").val(rec.TRef2);
        $("#TRef2A").attr('href', rec.TRef2);
        $("#TPCI").prop('checked', rec.TPCI);
        $("#TTop10").prop('checked', rec.TTop10);
        $("#TTop25").prop('checked', rec.TTop25);
        $("#TStdTest").prop('checked', rec.TStdTest);
        $("#IURIs").val("");
        $("#IEvidence").val("");
        $("#INotes").val("");
        $("#IPriority").val("");
        $('#cwename').typeahead('val', "");
        //$('#testNameTA').typeahead('val', "");
        
        updateCweUI(rec.TCweID);
        updateUIFromIssueColl();

        // Disable the New button
        //$('#kbBtnNew').prop('disabled', true);
        $('#testNameTA').val("");
    }

    
    // Update all UI fields from the Issue Collection
    function updateUIFromIssueColl() {

        // Get Test ID as search criteria
        tid = $( "#testSel option:selected" ).val();
        if ((tid === undefined) || (tid === "")){
            console.log("Empty Test ID");
            return;
        }
        
        /*
        // Get CWE ID as search criteria
        cid = $('#cweref').html();
        if ((cid === undefined) || (cid === "")){
            console.log("Empty CWE ID");
            return;
        }
        */

        // Build search criteria
        var issue={}; var mod={}; var crit={};
        //crit.CweId  = cid;
        crit.TID  = tid;
        i = issueColl.findOne(crit);
        if ((i === undefined) || (i._id <= 0)){
            console.log("No issue data found for this Test ID: " + tid);
            return;
        }

        // Update UI values
        $("#IURIs").val(i.IURIs);
        $("#IEvidence").val(i.IEvidence);
        $("#INotes").val(i.INotes);
        $("#IPriority").val(i.IPriority);       
    }    
    
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


    // Update UI with CWE data
    function updateCweUI(cweId, cweName, cweDescr) {
        if (cweId !== undefined){
            console.log("Updating UI for CWE-" + cweId);
            $('#cweid').val(cweId);
            $('#cweref').attr('href', cweUriBase + cweId + ".html");
            $('#cweref').html(cweId);
            //$('#cwename').typeahead('title', cweId);
        }
        else {
            console.log("Clearing CWE values");
            $('#cweid').val("");
            $('#cweref').attr('href', "");
            $('#cweref').html("");
            $('#cweref').attr('title', "");
            $('#cwename').typeahead('val', "");
        }

        if (cweDescr !== undefined) {
            console.log("Updating Description for CWE-" + cweId);
            $('#cweref').attr('title', cweDescr);
        }

        if (cweName !== undefined) {
            console.log("Updating Name for CWE-" + cweId);
            $('#cwename').typeahead('val', cweName);
            issueName = $("#TIssueName").val();
            if (issueName.length <= 0) {
                $("#TIssueName").val(cweName);
            }
        }
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
        gTmpObj = issue;

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
        //var prjName = $('#PrjName').val();
        var prjName = Session.get("projectName");
        if ((prjName === undefined) || (prjName === "")){
            console.log("Empty Project Name");
            return;
        }
        
        console.log('Project Name changed to ' + prjName);
        var prj = {}, pid = {}, mod={};
        pid.name = prjName;
        prj.name = prjName;
        prj.scope = $("#ScopeSel option:selected" ).attr('title');
        prj.scopeQry = $("#ScopeSel").val();
        prj.lastTID = $("#testSel").val();
        console.log("Scope set to " + prj.scope + " (" + prj.scopeQry + ")");

        mod["$set"] = prj;
        console.log("Checking if entry exists for project " + prjName);
        i = prjColl.findOne(pid);

        // If the issue doesn't exist, insert a new record. If not, use upsert.
        if ((i === undefined) || (i._id <= 0)){
            console.log("Inserting a new project");
            mid = prjColl.insert(prj);
        }
        else{
            console.log("Updating project data for object " + i._id);
            mid = prjColl.upsert(i._id, mod);
        }
    }
    
    // Update scope when changing the project 
    function updateUIFromPrj() {

        // Get project name from UI and make sure it's not empty
        //var prjName = $('#PrjName').val();
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
 
        // Update UI values using reactivity
        scopeQry = p.scopeQry;
        console.log("Updating scope to " + scopeQry);
        $("#ScopeSel").val(scopeQry);
        Session.set("projectScope", scopeQry);
        
        /*
        // Update test ID (position of test runner) when possible
        gLastTID = p.lastTID;
        if ((gLastTID !== undefined) && (lastTID.length > 0)){
           console.log("Last TID: " + gLastTID);
           Session.set("lastTID", gLastTID);
        }
        */
    }    
    
    
    // Clear all UI values when changing project
    function clearUI() {
        $("#testSel").prop("selectedIndex", 0);
        $("#ScopeSel").prop("selectedIndex", 0);
        $("#TPhase").html("");
        $("#TSection").html("");
        $('#testNameTA').typeahead('val', "");
        $('#cwename').typeahead('val', "");
        $('#cweref').attr('href', "");
        $('#cweref').html("");
        $("#TTestName").val("");
        $("#TType").val("");
        $("#TTesterSupport").val("");
        $("#TDescr").val("");
        $("#TTRef").val("");
        $("#TTRefA").attr('href', "");
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
        $("#IURIs").val("");
        $("#IEvidence").val("");
        $("#INotes").val("");
        $("#IPriority").prop("selectedIndex", 0);
        
        // Disable the New button
        //$('#kbBtnNew').prop('disabled', true);
    }
};
