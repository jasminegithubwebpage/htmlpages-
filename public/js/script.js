document.getElementById("fiction-link").addEventListener("click", function() {
    // Simulated XML data
    const xmlText = `
        <?xml version="1.0" encoding="UTF-8"?>
        <library>
            <books>
                <book>
                    <title>To Kill a Mockingbird</title>
                    <author>Harper Lee</author>
                </book>
                <book>
                    <title>1984</title>
                    <author>George Orwell</author>
                </book>
                <!-- Add more books as needed -->
            </books>
        </library>
    `;

    // Parse XML text into a DOM document
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    // Extract book information from XML and create a table
    let tableHTML = "<table>";
    const books = xmlDoc.getElementsByTagName("fiction-books-table");
    for (let i = 0; i < books.length; i++) {
        const title = books[i].getElementsByTagName("title")[0].textContent;
        const author = books[i].getElementsByTagName("author")[0].textContent;
        tableHTML += "<tr><td>" + title + "</td><td>" + author + "</td></tr>";
    }
    tableHTML += "</table>";

    // Display the table in the HTML
    document.getElementById("fiction-books-table").innerHTML = tableHTML;
});
