<?php
// Load the XML file
$xml = new DOMDocument();
$xml->load('books.xml');

// Load the XSLT file
$xsl = new DOMDocument();
$xsl->load('books.xsl');

// Create XSLT processor
$proc = new XSLTProcessor();
$proc->importStyleSheet($xsl);

// Perform transformation
echo $proc->transformToXML($xml);
?>
