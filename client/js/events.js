// Handle events in body
Template.home.events({
    'change #PrjName': function (event) {
        console.log("Project changed to " + event.target.value);
        // Get the project name and update UI
        Session.set("projectName", event.target.value);
        updateUIFromPrj();
        refreshUI();
    },    
    'click #PrjName': function () {
        // Clear the input so that a new project can be selected
        console.log("PrjName clicked, clearing Project Name so that the pulldown shows all projects");
        $("#PrjName").val("");
        Session.set("projectName", "");
        clearUI();
    },
    'change #PrjNotes, change #PrjSoftware': function (event) {
        console.log("Changed " + event.target.id);
        saveProjectDataFromUI();
        refreshUI();
    },
    'click #lastTIDTxt': function(){        
        var lastTID = Session.get("lastTID");
        console.log("Continuing at lastTID " + lastTID)
        updateUIFromTestKB();
        refreshUI();
    },   
    'click': function (event){
        console.log("Clicked " + event.target.id);
    },
    'change #ScopeSel': function (event) {
        console.log("Changed scope selection")
        Session.set("projectScope", event.target.value);
        saveProjectDataFromUI();
        refreshUI();
    },
    'change #testSel': function () {
        console.log("Changed test selection")
        Session.set("lastTID", $("#testSel").val());
        updateUIFromTestKB();
        saveProjectDataFromUI();
        refreshUI();
    },
    'click #btnBack': function () {
        selected = $("#testSel").prop("selectedIndex") - 1;
        if (selected <= 0) selected = 1;
        console.log("Selected: " + selected);
        $("#testSel").prop("selectedIndex", selected);
        Session.set("lastTID", $("#testSel").val());
        updateUIFromTestKB();
        $('#testNameTA').val("");
        saveProjectDataFromUI()
        refreshUI();
    },
    'click #btnNext': function () {
        selected = $("#testSel").prop("selectedIndex") + 1;
        if (selected >= $('#testSel > option').length)
            selected = $('#testSel > option').length - 1;
        console.log("Selected: " + selected);
        $("#testSel").prop("selectedIndex", selected);
        Session.set("lastTID", $("#testSel").val());
        updateUIFromTestKB();
        $('#testNameTA').val("");
        saveProjectDataFromUI()
        refreshUI();
    },
    'click #testNameTA': function () {
        // Clear the input so that a new test name can be selected
        console.log("Test name text area clicked, clearing field so that another test can be chosen");
        $("#testNameTA").val("");
    },        
    'change #TTestName': function () {
        console.log('TTestName changed (' + $('#TTestName').val() + ")");
    },
    'click #kbBtnNew': function () {
        console.log('Creating new test: ' + $('#TTestName').val());
        clearUI
        newTest();
        refreshUI();
    },       
    'change .testKbIn, change .testKbInShort, change .testKbTA, click .testKbCB, change #cweid, select #cweid, change #cweid, change .sevSelector': function (event) {
        updateTestKBFromUI(event.target.id, event.target.value);
        refreshUI();
    },
    'change .prioSelector, change .issueTA': function (event) {
        saveIssueDataFromUI(event.target.id, event.target.value);
        refreshUI();
    },
    'click #btnUpdate': function () {
        console.log("Trying to update the WAPT Runner code from GIT...");
        Meteor.call('runCode', function (err, response) {
            if (response !== undefined)
                console.log(response);
            if (err !== undefined)
                console.log(err);
        });
    },
    'click #btnCsvReport': function () {
        var prjName = $("#PrjName").val();
        console.log("Generating CSV report for project " + prjName);
        window.open("/report/csv/"+prjName, "DownloadWin");
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
        updateUIFromTestKB();
   }
});
