function stripHtmlTags(html)
{
    console.log("Stripping out HTML tags from " + html);
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}