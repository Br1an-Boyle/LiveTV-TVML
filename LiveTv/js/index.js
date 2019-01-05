/*
See LICENSE.txt for this sample’s licensing information.

Abstract:
A collection of functions used to present videos with different properties and configurations.
*/

// Get a reference to the loading template that was pushed in application.js
const loadingDocument = getActiveDocument();

// Create a DocumentLoader to handle fetching templates
const documentLoader = new DocumentLoader(baseURL);

// Store the video metadata loaded from JSON over XHR
let stationsList;

// Video that contains timed metadata
const playerEventsVideo = null; // new MediaItem("video", "HLS stream with timedMetadata");)

// Fetch the list template from the server to show as the root document.
documentLoader.fetch({
    url: "/Index.xml",
    success: (document) => {
        // Show the loaded document instead of the loading template.
        const videosXHR = new XMLHttpRequest();
        const videosURL = documentLoader.prepareURL("/stations.json");
        videosXHR.open("GET", videosURL);
        videosXHR.responseType = "json";
        videosXHR.onload = () => {
            stationsList = videosXHR.response;
            navigationDocument.replaceDocument(document, loadingDocument);
            populateStations(document);
        }
        videosXHR.onerror = () => {
            const alertDocument = createLoadErrorAlertDocument(videosURL, videosXHR);
            navigationDocument.presentModal(alertDocument);
        }
        videosXHR.send();
    },
    error: (xhr) => {
        // Use a utility function to create an alert document from the XHR error.
        const alertDocument = createLoadErrorAlertDocument(xhr);
        // Show the alert document instead of the loading template.
        navigationDocument.replaceDocument(alertDocument, loadingDocument);
    }
});

function populateStations(document) {
    let list = document.getElementsByTagName("list").item(0)
    let section = list.getElementsByTagName("section").item(0)
    
    section.dataItem = new DataItem()
    let stationItems = stationsList.map((station) => {
                                    let stationItem = new DataItem(station.type, station.ID);
                                    stationItem.logoURL = station.logoURL;
                                    stationItem.title = station.title;
                                    stationItem.streamURL = station.streamURL;
                                    return stationItem;
                                    });
    
    section.dataItem.setPropertyPath("stations", stationItems)
}

/** 
 * Convinence method to load a document
 */
function loadDocument(url) {
    documentLoader.fetch({ url: url });
}

function setupMediaContent(target, src, artworkURL) {
    
    
    const mediaContentList = target.getElementsByTagName('mediaContent');
    
    for (let i = 0; i < mediaContentList.length; i++) {
        
        const mediaContent = mediaContentList.item(i);
        const image = mediaContent.getElementsByTagName('img').item(0);
        const mediaSource = src ? src : mediaContent.getAttribute('mediaContent');
        const imageSrc = artworkURL ? artworkURL : mediaContent.getAttribute('artworkURL');
        
        if (image) {
            image.setAttribute("src", imageSrc);
        }
        
        const player = mediaContent.getFeature('Player');
        if (player && mediaSource) {
            const mediaItem = new MediaItem('video', mediaSource);
            mediaItem.artworkImageURL = mediaContent.getAttribute('artworkURL');
            
            player.playlist = new Playlist();
            player.playlist.push(mediaItem);
        }
    }
}


function presentVideo(target) {
    const mediaContent = target.getElementsByTagName('mediaContent').item(0);
    const player = mediaContent.getFeature('Player');
    player.present();
}
