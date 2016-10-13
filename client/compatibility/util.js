function stripHtmlTags(html)
{
    console.log("Stripping out HTML tags from " + html);
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

// When the Specific Issue Data changes, parse it if it's formatted as a Burp issue) 
// and save the results to the DB.
function parseBurpIssueAndSave(){
    
    // If the note is Burp-formatted, parse it
    var notes = $("#INotes").val();
    var lines = notes.split('\n');
    var issue="", evidence="", urls="", newNotes="";
    var urlSection=false;
    for (var i in lines){
        var t = lines[i].split(':');

        // Capture the Issue Name
        if (lines[i].startsWith('Issue:')){
            issue = t[1].trim();
        }

        // Capture the URL list
        else if (lines[i].startsWith('URL(s):')){
            urlSection = true;
        }

        else if (urlSection){
            var url = lines[i];
            if ((url !== undefined) && (url.length > 0)){
                url = url.replace(/^ - /, "");
                urls += url + "\n";
            }
            else
                urlSection = false;
        }

        // Capture the evidence
        else if (lines[i].startsWith('Evidence:')){
            evidence = t[1].trim();
        }

        // Remove the empty lines with "~" from Burp Clipboarder and 
        // keep other unmodified lines.
        else{
            newNotes += lines[i].replace(/^~$/, "") + "\n";            
        }
    }

    // Push the captured data to the UI and DB
    if ((issue !== undefined) && (issue.length > 0)){ 
        saveIssueDataFromUI("#TIssueName", issue);
        $("#TIssueName").val(issue);
    }
    if ((evidence !== undefined) && (evidence.length > 0)){
        // Decode the Base64 value
        evidence = decodeURIComponent(Array.prototype.map.call(atob(evidence), function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')).trim();
        saveIssueDataFromUI("#IEvidence", evidence);
        $("#IEvidence").val(evidence);
    }
    if ((urls !== undefined) && (urls.length > 0)){ 
        saveIssueDataFromUI("#IURIs", urls);
        $("#IURIs").val(urls);
    }
    
    // Save the note after removing "~", stripping HTML tags and collapsing 
    // multiple spaces (from Burp Clipboarder extension).
    if (newNotes.length > 0){ 
        newNotes = stripHtmlTags(newNotes).replace(/ +/g, " ").trim();
        saveIssueDataFromUI("#INotes", newNotes);
        $("#INotes").val(newNotes);
    }

    // Update titles so that mouse-over information matches the content
    $("#IURIs").attr("title", $("#IURIs").val());
    $("#IEvidence").attr("title", $("#IEvidence").val());
    $("#INotes").attr("title", $("#INotes").val());
}