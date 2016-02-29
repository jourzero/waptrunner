// Generate same page layout for all routes
Router.configure({layoutTemplate: 'layout'});

// Route / to home.html
Router.route('/', {template: 'home'});

// Route /about to about.html
Router.route('/about');

// Test Node.js HTTP request/response processing
Router.route('/test/print/:val', httpTest, {where: 'server'});

// Test route for executing server-side javascript code
//Router.route('/test/hello', serverHello, {where: 'server'});

// Route for CSV export of issues
Router.route('issues.csv', exportIssuesCSV, {where: 'server'});

// Route for CSV export of issues. 
Router.route('/report/csv/:prjName', genPrjIssueReportCSV, {where: 'server'});


/***  Functions used in above routes  ***/

// Generate issue report for a specific project in CSV format
function genPrjIssueReportCSV() {
    var prjName  = this.params.prjName;
    var filename = prjName + '-issues.csv';
    var fileData = "";
    var records = issueColl.find({PrjName: prjName}).fetch();
    
    // Build a CSV string. .
    console.log("Got " + records.length + " issue records for project " + prjName);
    fileData += toCsv(records);

    var headers = {
      'Content-type': 'text/csv',
      'Content-Disposition': "attachment; filename=" + filename,
      'Content-Length': fileData.length
    };
    this.response.writeHead(200, headers);
    this.response.end(fileData);
}

// Export all Issue data to CSV format
function exportIssuesCSV() {
    var filename = 'all-issues.csv';
    var fileData = "";
    var records = issueColl.find().fetch();
    
    // Build a CSV string. Oversimplified. You'd have to escape quotes and commas.
    //records.forEach(function(rec) {
    console.log("Got " + records.length + " issue records")
      fileData += toCsv(records);
    //});

    var headers = {
      'Content-type': 'text/csv',
      'Content-Disposition': "attachment; filename=" + filename,
      'Content-Length': fileData.length
    };
    this.response.writeHead(200, headers);
    this.response.end(fileData);
}
        
/**
* Converts a value to a string appropriate for entry into a CSV table (surrounded by quotes).
* @param {string|number|object} theValue
* @param {string} sDelimiter The string delimiter.  Defaults to a double quote (") if omitted.
*/
function toCsvValue(theValue, sDelimiter) {
    var t = typeof (theValue), output;
    if (theValue === null)
        theValue = "";

    theValue.replace(/"/g, '""');

    if (typeof (sDelimiter) === "undefined" || sDelimiter === null) {
            sDelimiter = '"';
    }

    if (t === "undefined" || t === null) {
            output = "";
    } else if (t === "string") {
            output = sDelimiter + theValue + sDelimiter;
    } else {
            output = String(theValue);
    }

    return output;
}

/**
* Converts an array of objects (with identical schemas) into a CSV table.
* @param {Array} objArray An array of objects.  Each object in the array must have the same property list.
* @param {string} sDelimiter The string delimiter.  Defaults to a double quote (") if omitted.
* @param {string} cDelimiter The column delimiter.  Defaults to a comma (,) if omitted.
* @return {string} The CSV equivalent of objArray.
*/
function toCsv(objArray, sDelimiter, cDelimiter) {
	var i, l, names = [], name, value, obj, row, output = "", n, nl;

	// Initialize default parameters.
	if (typeof (sDelimiter) === "undefined" || sDelimiter === null) {
		sDelimiter = '"';
	}
	if (typeof (cDelimiter) === "undefined" || cDelimiter === null) {
		cDelimiter = ",";
	}

	for (i = 0, l = objArray.length; i < l; i += 1) {
            // Get the names of the properties.
            obj = objArray[i];
            row = "";
            if (i === 0) {
                // Loop through the names
                for (name in obj) {
                    if (obj.hasOwnProperty(name)) {
                        if ((name !== 'IEvidence') && (name !== 'INotes')){
                            names.push(name);
                            row += [sDelimiter, name, sDelimiter, cDelimiter].join("");
                        }
                    }
                }
                row = row.substring(0, row.length - 1);
                output += row;
            }

            output += "\n";
            row = "";
            for (n = 0, nl = names.length; n < nl; n += 1) {
                name = names[n];
                if ((name !== 'IEvidence') && (name !== 'INotes')){
                    value = obj[name];
                    if (n > 0) {
                        row += cDelimiter;
                    }
                    row += toCsvValue(value, '"');
                }
            }
            output += row;
	}

	return output;
}        

// Run a simple HTTP test with parameter
function httpTest() {
  // NodeJS request object
  var request = this.request;

  // NodeJS  response object
  var response = this.response;

  this.response.end('Parameter passed to httpTest(): ' + this.params.val);
}


/* Remove so that we don't have a dependency on npm-container/meteorhacks:npm (causing startup issues on waptr1)
// Run a simple test for node.js API (using os module)
function serverHello(){
  os = Npm.require('os');
  var req = this.request;
  var res = this.response;
  res.end('Hello from '+os.hostname());
}
*/