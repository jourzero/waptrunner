function stripHtmlTags(html)
{
    console("Stripping out HTML tags from " + html);
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}