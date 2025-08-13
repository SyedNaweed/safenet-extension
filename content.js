console.log("SafeNet AI content script running...");

// Example: highlight phishing-looking links
document.querySelectorAll("a").forEach(link => {
  if (link.href.includes("phishy")) {
    link.style.border = "2px solid red";
    link.style.backgroundColor = "yellow";
  }
});
