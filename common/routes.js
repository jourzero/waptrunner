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

// Route for HTML export of issues. 
Router.route('/report/html/:prjName', genPrjIssueReportHtml, {where: 'server'});

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

// Generate issue report for a specific project in CSV format
function genPrjIssueReportHtml() {
    var prjName  = this.params.prjName;
    var filename = prjName + '-issues.html';
    var fileData = "";
    var records = issueColl.find({PrjName: prjName},{sort: {IPriority: -1, TIssueName: 1}}).fetch();
    
    // Build a CSV string. .
    console.log("Got " + records.length + " issue records for project " + prjName);
    fileData += toHtml(records, prjName);

    var headers = {
      'Content-type': 'text/html',
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
                        if ((name !== 'IEvidence') && (name !== 'IScreenshots') && (name !== 'INotes')){
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
                if ((name !== 'IEvidence') && (name !== 'IScreenshots') && (name !== 'INotes')){
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



/**
* Converts an array of objects (with identical schemas) into HTML
* @param {Array} objArray An array of objects.  Each object in the array must have the same property list.
* @return {string} The CSV equivalent of objArray.
*/
function toHtml(objArray, prjName) {
	var obj = {};
        var output = "<html><head>\n";
        var priority = "N/A", prevPrio = "", prio = -1;
        var cweUriBase   = "https://cwe.mitre.org/data/definitions/";
        output += "<style>\nbody{width:1200px;}\na{text-decoration:none;}\na:hover{color:purple;}\n.tdID{width:1100px;max-width:1100px;vertical-align:top;word-wrap:break-word;}\n.thID{text-align:right;vertical-align:top;width:80px;}\nth{vertical-align:top;}\nol{padding-left:25px;}\n.HighP{background-color:red;}\n.MediumP{background-color:orange;}\n.LowP{background-color:cyan;}\n.Skip{background-color:#FFFFFF;}\ntr:nth-child(even){background:#EAEAEA;}\ntr:nth-child(odd){background:#F0F0F0;}\n</style>\n";
        
        // Traverse the array of issue objects
        output += "</head>\n<body>\n";
        
        
        // Generate issue summary
        output += "<h2>Issue Summary</h2>"
        output += "<p>Project ID: " + prjName + "</p>\n";
        output += "<p>The below table contains a summary of issues. You may click the links in the Issue column to jump to the specific issue details.</p>"
        output += "<table>\n";
        output += "<tr><th>Priority</th><th>Issue</th></tr>"; //<th>Count</th></tr>";
	for (var i = 0; i < objArray.length; i++) {
            obj = objArray[i];
            prevPrio = priority;
            priority = obj.IPriorityText;
            prio = parseInt(obj.IPriority);
            
            // Don't print the informational findings (for the tester)
            if ((prio !== undefined) && (prio < 0)) continue;
            
            // Count the number of URIs
            var count=0;
            if (obj.IURIs !== undefined)
                count = obj.IURIs.split("\n").length;
            
            // Print each issue with the issue as the header and the details as part of a table.
            if ((priority !== undefined)&&(priority !== "")&&(priority !== prevPrio))
                output += "<tr><th class='" + priority + "P'>" + priority + "</th>";
            else
                output += "<tr><th class='" + priority + "P'></th>";
            output += "<td class='" + priority + "P'><a href='#" + htmlEncode(obj.TID, true, 4) + "'>" + obj.TIssueName + "</a></td>";
            //output += "<td class='" + priority + "P'>" + count + "</td>";
            output += "</tr>\n";
	}
        output += "</table>\n";        
        
        // Generate detailed issue report
        output += "<h2>Issue Details</h2>"
        output += "<table>\n"
	for (var i = 0; i < objArray.length; i++) {
            obj = objArray[i];
            prevPrio = priority;
            priority = obj.IPriorityText;
            prio = parseInt(obj.IPriority);
            
            // Don't print the informational findings (for the tester)
            if ((prio !== undefined) && (prio < 0)) continue;
            
            // Print each issue with the issue as the header and the details as part of a table.
            output += "<tr><th class='" + priority + "P'></th><th class='" + priority + "P' id='" + htmlEncode(obj.TID, true, 4) + "'>" + obj.TIssueName + "</th></tr>\n";
            if ((obj.CweId !== undefined)&&(obj.CweId !== ""))
                output += "<tr><th class='thID'>CWE ID: </th><td class='tdID'><a href='" + cweUriBase + obj.CweId + ".html'>" + obj.CweId + "</a></td></tr>\n";
            if ((obj.IURIs !== undefined)&&(obj.IURIs !== "")){
                output += "<tr><th class='thID'>URI(s): </th><td class='tdID'><ol>";
                var uri = obj.IURIs.split("\n");
                for (var j=0; j<uri.length; j++)
                    output += "<li>" + htmlEncode(uri[j], true, 4) + "</li>\n";
                output += "</ol></td></tr>\n";
            }
            if ((obj.TSeverityText !== undefined)&&(obj.TSeverityText !== ""))
                output += "<tr><th class='thID'>Severity: </th><td class='tdID'>" + obj.TSeverityText + "</td></tr>\n";
            if ((obj.IPriorityText !== undefined)&&(obj.IPriorityText !== ""))
                output += "<tr><th class='thID'>Priority: </th><td class='tdID'>" + obj.IPriorityText + "</td></tr>\n";
            if ((obj.TIssueBackground !== undefined)&&(obj.TIssueBackground !== ""))
                output += "<tr><th class='thID'>Background: </th><td class='tdID'>" + htmlEncode(obj.TIssueBackground, true, 4) + "</td></tr>\n";
            if ((obj.TRemediationBackground !== undefined)&&(obj.TRemediationBackground !== ""))
                output += "<tr><th class='thID'>Mitigation: </th><td class='tdID'>" + htmlEncode(obj.TRemediationBackground, true, 4) + "</td></tr>\n";
            if ((obj.TRef1 !== undefined)&&(obj.TRef1 !== ""))
                output += "<tr><th class='thID'>Ref. 1: </th><td class='tdID'><a href='" + obj.TRef1 + "'>" + obj.TRef1 + "</a></td></tr>\n";
            if ((obj.TRef2 !== undefined)&&(obj.TRef2 !== ""))
                output += "<tr><th class='thID'>Ref. 2: </th><td class='tdID'><a href='" + obj.TRef2 + "'>" + obj.TRef2 + "</a></td></tr>\n";
            if ((obj.INotes !== undefined)&&(obj.INotes !== ""))
                output += "<tr><th class='thID'>Notes: </th><td class='tdID'>" + linkify(obj.INotes) + "</td></tr>\n";
            if ((obj.IEvidence !== undefined)&&(obj.IEvidence !== ""))
                //output += "<tr><th class='thID'>Evidence: </th><td class='tdID'>" + htmlEncode(obj.IEvidence, true, 4) + "</td></tr>\n";
                output += "<tr><th class='thID'>Evidence: </th><td class='tdID'><pre>" + htmlEncode(obj.IEvidence, true, 4) + "</pre></td></tr>\n";
            if ((obj.IScreenshots !== undefined)&&(obj.IScreenshots !== ""))
                output += "<tr><th class='thID'>Screenshot(s): </th><td class='tdID'>" + obj.IScreenshots + "</td></tr>\n";
            output += "<tr><td class='Skip'>&nbsp;</td><td class='Skip'>&nbsp;</td></tr>\n";
	}
        output += "</table>\n";
        output += "</body>\n</html>\n";
	return output;
}        


function linkify(inputText) {
    var replacedText, replacePattern;
    replacePattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern, '<a href="$1" target="refWin">$1</a>');
    return replacedText;
}


/*
HTMLEncode - Encode HTML special characters.
Copyright (c) 2006-2010 Thomas Peri, http://www.tumuski.com/
MIT License
*/

/*jslint white: true, onevar: true, undef: true, nomen: true, eqeqeq: true,
	plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */

/**
 * HTML-Encode the supplied input
 * 
 * Parameters:
 *
 * (String)  source    The text to be encoded.
 * 
 * (boolean) display   The output is intended for display.
 *
 *                     If true:
 *                     * Tabs will be expanded to the number of spaces 
 *                       indicated by the 'tabs' argument.
 *                     * Line breaks will be converted to <br />.
 *
 *                     If false:
 *                     * Tabs and linebreaks get turned into &#____;
 *                       entities just like all other control characters.
 *
 * (integer) tabs      The number of spaces to expand tabs to.  (Ignored 
 *                     when the 'display' parameter evaluates to false.)
 *
 * version 2010-11-08
 */
var htmlEncode = function (source, display, tabs) {
	var i, s, ch, peek, line, result,
		next, endline, push,
		spaces;

        if (source === undefined)
            return "";
	
	// Stash the next character and advance the pointer
	next = function () {
		peek = source.charAt(i);
		i += 1;
	};
	
	// Start a new "line" of output, to be joined later by <br />
	endline = function () {
		line = line.join('');
		if (display) {
			// If a line starts or ends with a space, it evaporates in html
			// unless it's an nbsp.
			line = line.replace(/(^ )|( $)/g, '&nbsp;');
		}
		result.push(line);
		line = [];
	};
	
	// Push a character or its entity onto the current line
	push = function () {
		if (ch < ' ' || ch > '~') {
			line.push('&#' + ch.charCodeAt(0) + ';');
		} else {
			line.push(ch);
		}
	};
	
	// Use only integer part of tabs, and default to 4
	tabs = (tabs >= 0) ? Math.floor(tabs) : 4;
	
	result = [];
	line = [];

	i = 0;
	next();
	while (i <= source.length) { // less than or equal, because i is always one ahead
		ch = peek;
		next();
		
		// HTML special chars.
		switch (ch) {
		case '<':
			line.push('&lt;');
			break;
		case '>':
			line.push('&gt;');
			break;
		case '&':
			line.push('&amp;');
			break;
		case '"':
			line.push('&quot;');
			break;
		case "'":
			line.push('&#39;');
			break;
		default:
			// If the output is intended for display,
			// then end lines on newlines, and replace tabs with spaces.
			if (display) {
				switch (ch) {
				case '\r':
					// If this \r is the beginning of a \r\n, skip over the \n part.
					if (peek === '\n') {
						next();
					}
					endline();
					break;
				case '\n':
					endline();
					break;
				case '\t':
					// expand tabs
					spaces = tabs - (line.length % tabs);
					for (s = 0; s < spaces; s += 1) {
						line.push(' ');
					}
					break;
				default:
					// All other characters can be dealt with generically.
					push();
				}
			} else {
				// If the output is not for display,
				// then none of the characters need special treatment.
				push();
			}
		}
	}
	endline();
	
	// If you can't beat 'em, join 'em.
	result = result.join('<br />');

	if (display) {
		// Break up contiguous blocks of spaces with non-breaking spaces
		result = result.replace(/ {2}/g, ' &nbsp;');
	}
	
	// tada!
	return result;
};
