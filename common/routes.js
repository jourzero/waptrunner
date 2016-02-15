Router.configure({layoutTemplate: 'layout'});
Router.route('/', {template: 'home'});
Router.route('/about');

Router.route('/download/:file', function () {
  // NodeJS request object
  var request = this.request;

  // NodeJS  response object
  var response = this.response;

  this.response.end('file download content for ' + this.id);
}, {where: 'server'});


Router.route('/hello', function () {
  os = Npm.require('os');
  var req = this.request;
  var res = this.response;
  res.end('Hello from the '+os.hostname()+" server.");
}, {where: 'server'});

Router.route('/issues.csv', function () {
    var filename = 'issues.csv';
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
}, {where: 'server'});


// Returns a csv from an array of objects with
// values separated by tabs and rows separated by newlines
function toCSVold(array) {
    // Use first element to choose the keys and the order
    var keys = Object.keys(array[0]);

    // Build header
    var result = keys.join("|") + "\n";

    // Add the rows
    array.forEach(function(obj){
        keys.forEach(function(k, ix){
            if (ix) result += "|";
            result += obj[k];
        });
        result += "\n";
    });

    return result;
}

        
/**
* Converts a value to a string appropriate for entry into a CSV table.  E.g., a string value will be surrounded by quotes.
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
					names.push(name);
					row += [sDelimiter, name, sDelimiter, cDelimiter].join("");
				}
			}
			row = row.substring(0, row.length - 1);
			output += row;
		}

		output += "\n";
		row = "";
		for (n = 0, nl = names.length; n < nl; n += 1) {
			name = names[n];
			value = obj[name];
			if (n > 0) {
				row += cDelimiter;
			}
			row += toCsvValue(value, '"');
		}
		output += row;
	}

	return output;
}        