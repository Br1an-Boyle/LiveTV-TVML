
App.onLaunch = function(options) {

    baseURL = options.baseURL;

    const helperScriptURLs = [
        "DocumentLoader.js",
        "DocumentController.js",
        options.mainScript
    ].map(moduleName => `${baseURL}/${moduleName}`);

    const loadingDocument = createLoadingDocument();
    navigationDocument.pushDocument(loadingDocument);

    evaluateScripts(helperScriptURLs, function(scriptsAreLoaded) {
        if (scriptsAreLoaded) {
            console.log("Scripts have been successfully evaluated.");
        } else {
            const alertDocument = createEvalErrorAlertDocument();
            navigationDocument.replaceDocument(alertDocument, loadingDocument);
            throw new EvalError("TV application.js: unable to evaluate scripts.");
        }
    });
};


function createLoadingDocument(title) {

    title = title || "Loading...";

    const template = `<?xml version="1.0" encoding="UTF-8" ?>
        <document>
            <loadingTemplate>
                <activityIndicator>
                    <title>${title}</title>
                </activityIndicator>
            </loadingTemplate>
        </document>
    `;

    return new DOMParser().parseFromString(template, "application/xml");
}


function createAlertDocument(title, description) {
    const template = `<?xml version="1.0" encoding="UTF-8" ?>
        <document>
            <alertTemplate>
                <title>${title}</title>
                <description>${description}</description>
            </alertTemplate>
        </document>
    `;

    return new DOMParser().parseFromString(template, "application/xml");
}


function createDescriptiveAlertDocument(title, description) {
    const template = `<?xml version="1.0" encoding="UTF-8" ?>
        <document>
            <descriptiveAlertTemplate>
                <title>${title}</title>
                <description>${description}</description>
            </descriptiveAlertTemplate>
        </document>
    `;

    return new DOMParser().parseFromString(template, "application/xml");
}


function createEvalErrorAlertDocument() {

    const title = "Evaluate Scripts Error";
    const description = [
        "There was an error attempting to evaluate the external JavaScript files.",
        "Please check your network connection and try again later."
    ].join("\n\n");

    return createAlertDocument(title, description);
}


function createLoadErrorAlertDocument(url, xhr) {

    const title = (xhr.status) ? `Fetch Error ${xhr.status}` : "Fetch Error";
    const description = `Could not load document:\n${url}\n(${xhr.statusText})`;

    return createAlertDocument(title, description);
}
