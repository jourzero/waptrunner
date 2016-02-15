Template.testingTmpl.helpers({
    // Get CWEs from cwe collection
    cwes: function () {
        return cweColl.find().fetch().map(function (it) {
            var exploitability = new String(it.Likelihood_of_Exploit);
            var descr = it.Name + ": " + it.Description_Summary;
            if (exploitability.length > 0)
                descr += " [Exploitability: " + exploitability + "]";
            return {value: it.Name, id: it._id, cweId: it.ID, 
                    cweDescr: descr, cweStatus: it.Status, 
                    cweExpl: it.Likelihood_of_Exploit};
        });
    },
    
    autocompleteCwe: function (e, suggestion, dataset) {
        console.log("Autocompleted: CWE-" + suggestion.cweId);
    },
    
    // Called when selecting a CWE after typeahead
    selectCwe: function (e, suggestion, dataset) {
        console.log("Selected CWE-" + suggestion.cweId);
        //updateCweUI(suggestion.cweId, suggestion.value, suggestion.cweDescr);
        updateCweUI(suggestion.cweId);
        updateTestKBFromUI("TCweID", suggestion.cweId);
    },    
    
    // Get list of tests from testkb collection
    myTests: function () {
        sesScope = Session.get("projectScope");
        if (sesScope === undefined) {
            sesScope = "";
            return;
        }
        scopeQry = eval("Object({" + sesScope + "})");
        return testkbColl.find(scopeQry,{sort: {TID: 1}}).fetch().map(function (it) {
            return {value: it.TTestName + " (" + it.TSource + ":" + it.TStep + ")", 
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
                TTRef2: it.TTRef2,
                TCweID: it.TCweID, TPCI: it.TPCI, TTop10: it.TTop10, TTop25: it.TTop25
            };
        })
    },

    
    // Called when selecting a Test Name after typeahead
    selectTN: function (e, suggestion, dataset) {
        console.log("Selected: Test " + suggestion.value);
        $("#testSel").val(suggestion.TID);
        updateUIFromTestKB();
    }
});
