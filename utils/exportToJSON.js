const exportToJSON = (scoreSheet, gameId) => {
    // Convert the scoreSheet to a JSON string with indentation
    const jsonString = JSON.stringify(scoreSheet, null, 2);

    // Create a blob with the JSON data and the appropriate MIME type
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a link element with a URL to the blob
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scoresheet-${gameId}.json`; // Set the file name

    // Trigger the download by simulating a click on the link
    a.click();

    // Clean up by revoking the object URL
    URL.revokeObjectURL(url);
};

export default exportToJSON;