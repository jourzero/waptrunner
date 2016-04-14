// Handle events in body
Template.home.events({
    // When the project name changes, update the Project Summary section of the UI
    'change #PrjName': function (event) {
        console.log("Project changed to " + event.target.value);
        // Get the project name and update UI
        Session.set("projectName", event.target.value);
        updateUIFromPrj();
    },    
    // When the project name is clicked, clear-up the UI
    'click #PrjName': function () {
        // Clear the input so that a new project can be selected
        console.log("PrjName clicked, clearing Project Name so that the pulldown shows all projects");
        $("#PrjName").val("");
        Session.set("projectName", "");
        clearUI();
    },
    // When LastTID link was clicked, move the test selector and refresh the UI from Test KB
    'click #lastTIDTxt': function(){        
        var lastTID = Session.get("lastTID");
        console.log("Continuing at lastTID " + lastTID)
        $("#testSel").val(lastTID);
        updateUIFromTestKB();
        updateUIFromIssueColl()
    },  
    // When the project parameters are changed, persist them
    'change #PrjNotes, change #PrjSoftware': function (event) {
        console.log("Changed " + event.target.id);
        saveProjectDataFromUI();
        updateUIFromPrj();
    },
    // When the scope/methodology selector is changed, persist the value
    'change #ScopeSel': function (event) {
        console.log("Changed scope/methodology selector")
        Session.set("projectScope", event.target.value);
        saveProjectDataFromUI();
    },
    // When the test selector is changed, update the Testing and Generic Issue sections
    'change #testSel': function () {
        console.log("Changed test selection")
        Session.set("lastTID", $("#testSel").val());
        updateUIFromTestKB();
        $('#testNameTA').val("");
        refreshLastTIDLink();
        saveProjectDataFromUI(); // save last TID
        updateUIFromIssueColl()
    },
    // When a test player button is changed, update the Testing and Generic Issue sections
    'click #btnBack': function () {
        selected = $("#testSel").prop("selectedIndex") - 1;
        if (selected <= 0) selected = 1;
        console.log("Selected: " + selected);
        $("#testSel").prop("selectedIndex", selected);
        Session.set("lastTID", $("#testSel").val());
        updateUIFromTestKB();
        $('#testNameTA').typeahead('val', "");        
        refreshLastTIDLink();
        saveProjectDataFromUI();
        updateUIFromIssueColl()
    },
    // When a test player button is changed, update the Testing and Generic Issue sections
    'click #btnNext': function () {
        selected = $("#testSel").prop("selectedIndex") + 1;
        if (selected >= $('#testSel > option').length)
            selected = $('#testSel > option').length - 1;
        console.log("Selected: " + selected);
        $("#testSel").prop("selectedIndex", selected);
        Session.set("lastTID", $("#testSel").val());
        updateUIFromTestKB();
        $('#testNameTA').typeahead('val', "");        
        refreshLastTIDLink();
        saveProjectDataFromUI();
        updateUIFromIssueColl()
    },
    // When the test name type-ahead is clicked, clear the previous value to help with the search
    'click #testNameTA': function () {
        // Clear the input so that a new test name can be selected
        console.log("Test name text area clicked, clearing field so that another test can be chosen");
        $('#testNameTA').typeahead('val', "");        
    },        
    // When the New Test button is pressed, clear the UI and create another test
    'click #kbBtnNew': function () {
        console.log('Creating new test: ' + $('#TTestName').val());
        clearUI();
        newTest();
    },       
    // When the test fields values change, update the Test KB
    'change #TTestName, change #TTesterSupport, change #TTRef, change #cwename, change #cweid, change #TIssueName, change .testKbCB, change #TSeverity, change #TRef1, change #TRef2': function (event) {
        updateTestKBFromUI(event.target.id, event.target.value);
    },
    // When the Specific Issue Data changes, save it to the Issue collection
    'change #IURIs, change #IEvidence, change #INotes, change #IPriority': function (event) {
        addIssueTemplateTextToUI();
        saveIssueDataFromUI(event.target.id, event.target.value);
        
        // Update titles so that mouse-over information matches the content
        $("#IURIs").attr("title", $("#IURIs").val());
        $("#IEvidence").attr("title", $("#IEvidence").val());
        $("#INotes").attr("title", $("#INotes").val());
    },
    // When the Specific Issue Data changes, save it to the Issue collection
    'click #IEvidence, click #INotes, click #PrjNotes': function (event) {
        console.log("Increasing the height for " + event.target.id);
        $("#" + event.target.id).height(400);
    },    
    // When the Specific Issue Data changes, save it to the Issue collection
    'blur #IEvidence, blur #INotes, blur #PrjNotes': function (event) {
        console.log("Decreasing the height for " + event.target.id);
        $("#" + event.target.id).height(50);
    },    
    // Generate an HTML report when the 'HTML Report' button is pressed
    'click #btnHtmlReport': function () {
        var prjName = $("#PrjName").val();
        console.log("Generating HTML report for project " + prjName);
        window.open("/report/html/"+prjName, "DownloadWin");
    },
    // Generate a CSV report when the 'CSV Report' button is pressed
    'click #btnCsvReport': function () {
        var prjName = $("#PrjName").val();
        console.log("Generating CSV report for project " + prjName);
        window.open("/report/csv/"+prjName, "DownloadWin");
    },
    // Update this app when the 'Update App' button is pressed
    'click #btnUpdate': function () {
        console.log("Trying to update the WAPT Runner code from GIT...");
        Meteor.call('runCode', function (err, response) {
            if (response !== undefined)
                console.log(response);
            if (err !== undefined)
                console.log(err);
        });
    },
});


// Event handlers for the issue list
Template.myIssueTmpl.events({
    // Delete Issue
    "click .delete": function (event) {
        console.log('Delete clicked from myIssueTmpl! ID=' + this._id);
        issueColl.remove(this._id);
    },
    // Show the issue details when clicking in the list
    "click .isTD": function (event) {
        console.log('Clicked in myIssueTmpl ID=' + this._id + ". TID=" + this.TID);
        $("#testSel").val(this.TID);
        Session.set("lastTID", $("#testSel").val());
        updateUIFromTestKB();
        $('#testNameTA').typeahead('val', "");                
        refreshLastTIDLink();
        saveProjectDataFromUI(); // save last TID
        updateUIFromIssueColl()
   }
});
