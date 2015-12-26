// Global code
cweColl = new Mongo.Collection("cwe");
prjName = "issues";
issueColl = new Mongo.Collection(prjName);
defaultScope = "TSource: 'OWASP-TG4'";
defaultScope = "TSource: 'WAHH2'";
defaultScope = "";
sesScope = defaultScope;
testkbColl = new Mongo.Collection("testkb");
tPhase = ""; gTest = {}; gCWE = {}; gEventData = {};
cweUriBase = "https://cwe.mitre.org/data/definitions/";
gTmpObj = {};

// Code to run on the client side only
if (Meteor.isClient) {

    //Template.testRunner.helpers({
    Template.body.helpers({
        cwes: function () {
            return cweColl.find().fetch().map(function (it) {
                var exploitability = new String(it.Likelihood_of_Exploit);
                var descr = "CWE-" + it.ID + ": " + it.Description_Summary;
                if (exploitability.length > 0)
                    descr += " [Exploitability: " + exploitability + "]";
                gCWE = {value: it.Name, id: it._id, cweId: it.ID, cweDescr: descr, cweStatus: it.Status, cweExpl: it.Likelihood_of_Exploit};
                return gCWE;
            });
        },
        projectScope: function () {
            return Session.get("projectScope");
        },
        myTests: function () {
            sesScope = Session.get("projectScope");
            if (sesScope === undefined) {
                sesScope = defaultScope;
            }
            scopeQry = eval("Object({" + sesScope + "})");
            return testkbColl.find(scopeQry).fetch().map(function (it) {
                gTest = {TID: it.TID, OID: it._id.valueOf(), TSource: it.TSource, TTestName: it.TTestName, TType: it.TType,
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
        myIssues: function () {
            return issueColl.find({},{sort: {CweId: 1}}).fetch().map(function (it) {
                URIs = it.IURIs;
                count=0;
                if (URIs !== undefined)
                    count = URIs.split("\n").length;
                return {_id: it._id,TIssueName: it.TIssueName,CweId: it.CweId,TID: it.TID,ICount: count,TSeverity: it.TSeverity,TSeverityText: it.TSeverityText,IPriority: it.IPriority, IPriorityText: it.IPriorityText, IEvidence: it.IEvidence, INotes: it.INotes};
            })
        },
        open: function (e) {
            console.log("Dropdown is opened");
        },
        close: function (e) {
            console.log("Dropdown is closed");
        },
        autocomplete: function (e, suggestion, dataset) {
            console.log("Autocompleted: CWE-" + suggestion.cweId);
        },
        select: function (e, suggestion, dataset) {
            console.log("Selected: CWE-" + suggestion.cweId);
            updateCweUI(suggestion.cweId, suggestion.value, suggestion.cweDescr);
            //updateTestKBFromUI("TCweID", suggestion.cweId);
        },
        'click .delete': function(e){
            console.log('Delete clicked!')
        }
    });


    Template.myIssueTmpl.events({
        "click .delete": function (event) {
            gTmpObj=this;
            console.log('Delete clicked from myIssueTmpl! ID=' + this._id)
             issueColl.remove(this._id);
        },
        "click .isTD": function (event) {
            gTmpObj=this;
            console.log('Clicked in myIssueTmpl ID=' + this._id + ". TID=" + this.TID);
            $("#testSel").val(this.TID);
            updateUIFromTestKB();
       }
    }),

            
    // Handle events in body
    Template.body.events({
        "change #ScopeSel": function (event) {
            Session.set("projectScope", event.target.value);
        },
        'change .testKbIn, change .testKbInShort, change .testKbTA, click .testKbCB, change #cweid, select #cweid, change #cweid, change .sevSelector': function (event) {
            gEventData = event;
            updateTestKBFromUI(event.target.id, event.target.value);
        },
        'change #testSel': function () {
            updateUIFromTestKB();
        },
        'change .prioSelector, change .issueTA': function (event) {
            gEventData = event;
            saveIssueDataFromUI(event.target.id, event.target.value);
        },
        'change #TTestName': function () {
            console.log('TTestName changed (' + $('#TTestName').val() + "). Enabled New button.");
            $('#kbBtnNew').prop('disabled', false);
        },
        'click #kbBtnNew': function () {
            console.log('Creating new test (NOT IMPLEMENTED): ' + $('#TTestName').val());
            //$('#cwename').typeahead('val', 'a');
            //$('#cwename').typeahead('open');
        },
        'click #btnBack': function () {
            selected = $("#testSel").prop("selectedIndex") - 1;
            if (selected <= 0) selected = 1;
            console.log("Selected: " + selected);
            $("#testSel").prop("selectedIndex", selected);
            updateUIFromTestKB();
        },
        'click #btnNext': function () {
            selected = $("#testSel").prop("selectedIndex") + 1;
            if (selected >= $('#testSel > option').length)
                selected = $('#testSel > option').length - 1;
            console.log("Selected: " + selected);
            $("#testSel").prop("selectedIndex", selected);
            updateUIFromTestKB();
        },
    }),


    // Initialize typeahead
    Meteor.startup(function () {
        // initializes all typeahead instances
        Meteor.typeahead.inject();
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
        $("#TTRefA").attr('href', rec.TTRef);
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
        updateCweUI(rec.TCweID);
        updateUIFromPrjColl();

        // Disable the New button
        $('#kbBtnNew').prop('disabled', true);
    }

    
    // Update all UI fields from the Project Collection
    function updateUIFromPrjColl() {

        // Get CWE ID as search criteria
        //tid = $( "#testSel option:selected" ).text();
        //issueName = $('#TIssueName').val();
        cid = $('#cweref').html();
        if ((cid === undefined) || (cid == "")){
            console.log("Empty CWE ID");
            return;
        }

        // Build search criteria
        var issue={}; var mod={}; var crit={};
        crit.CweId  = cid;
        i = issueColl.findOne(crit);
        if ((i === undefined) || (i._id <= 0)){
            console.log("No issue data found for this CWE ID.");
            return;
        }

        // Update UI values
        $("#IURIs").val(i.IURIs);
        $("#IEvidence").val(i.IEvidence);
        $("#INotes").val(i.INotes);
        $("#IPriority").val(i.IPriority);       
    }


    // Update Test KB upon changes in the UI
    function updateTestKBFromUI(tgtId, tgtVal) {

        oid = $("#OID").val();
        console.log("Updating TestKB for OID " + oid + ": " + tgtId + "=" + tgtVal);
        kvp = {};
        mod = {};
        kvp[tgtId] = tgtVal;
        mod["$set"] = kvp;
        n = testkbColl.update(new Mongo.ObjectID(oid), mod);
        console.log("Number of updated records: " + n)
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
};

// Update/insert issue data from UI into the project collection
function saveIssueDataFromUI(tgtId, tgtVal) {

    // Get common issue values from UI
    tid         = $( "#testSel option:selected" ).text();
    cid         = $('#cweref').html();
    issueName   = $('#TIssueName').val();
    
    // Check that the UI has the mandatory data we need
    if ((tid === undefined) || (tid == "")){
        alert("Cannot save issue data: Missing Test ID.");
        return;
    }
    if ((issueName === undefined) || (issueName == "")){
        alert("Cannot save issue data: Missing Issue Name.");
        return;
    }

    // Check if issue already exists
    console.log("Saving issue data for TID " +tid + ": " + tgtId + "=" + tgtVal);
    var issue={}; var mod={}; var oid={};
    //issue[tgtId]= tgtVal;
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
    gTmpObj = issue;

    mod["$set"] = issue
    console.log("Checking if entry exists for issue");
    i = issueColl.findOne(oid);
    
    // If the issue doesn't exist, insert a new record. If not, use upsert.
    if ((i === undefined) || (i._id <= 0)){
        console.log("Adding new issue with CweID=" + cid)
        mid = issueColl.insert(issue);
        console.log("Mongo _id for new record: " + mid)
    }
    else{
        console.log("Updating issue data for object " + i._id);
        mid = issueColl.upsert(i._id, mod);
        console.log("Mongo _id for new record: " + mid)
        
    }
}

function openProjectColl(prjName) {
    //issueColl = new Mongo.Collection(prjName);
}