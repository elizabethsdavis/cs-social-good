const username = "cs-social-good";

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
 function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, (tabs) => {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        var tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        var url = tab.url;

        // tab.url is only available if the "activeTab" permission is declared.
        // If you want to see the URL of other tabs (e.g. after removing active:true
        // from |queryInfo|), then the "tabs" permission is required to see their
        // "url" properties.
        console.assert(typeof url == 'string', 'tab.url should be a string');

        callback(url);
    });
}

/**
 * Formats the contents of an Object into url parameters.
 *
 * @param {Object} parameters to be sent to be appended to a url.
 * @param {Boolean} shouldEncode declares whether URI components should be encoded.
 */
function formatParams(params, shouldEncode = true){
    return Object
    .keys(params)
    .map(function(key){
        if (shouldEncode) {
            return key+"="+encodeURIComponent(params[key])
        } else {
            return key+"="+params[key]
        }
    })
    .join("&")
}


/**
 * Returns the domain name of the given URL using a regular expression.
 *
 * @param {URL} url from which to extract the domain name.
 */
function domainName(url) {
    var matches = url.match(/^https?\:\/\/(?:www\.)?([^\/?#]+)(?:[\/?#]|$)/i);
    return domain = matches && matches[1]; 
}

/**
 * Formats the contents of an Object into url parameters.
 *
 * @param {string} url URL from the web page to parse its contents.
 */
function getArticleInformation(url) {
    return response = new Promise (function (resolve, reject) {
        var arguments = { 
            token: '9d0a81b4de5177699fec49884e15c6e9', 
            url: url 
        };

        var xhttp  = new XMLHttpRequest,
        diffBotURL = "https://api.diffbot.com/v3/article?"+formatParams(arguments),
        method     = "GET";

        console.log("Getting article metadata from Diffbot API for url: ", url), 

        xhttp.onload = function() {

            var articleBody = JSON.parse(xhttp.responseText);
            console.log(articleBody)
            if (articleBody.objects) {

                let article = articleBody.objects[0];
                var imagesInArticle = article.images;
                var imageURL;

                if (imagesInArticle) {
                    var imageURL = imagesInArticle[0].url;
                    for (var i = 0; i < imagesInArticle; i++) {
                        var image = imagesInArticle[i];
                        if (image.primary) {
                            imageURL = image.url
                        }
                    }
                }

                console.log("Article's Headline we found: " +  article.title);
                console.log("Prominent Image URL we found: " + imageURL);

                var articleInfo = {
                    title: article.title,
                    text: article.text,
                    imageURL: imageURL,
                    url: url
                };

                resolve(articleInfo)

            } else {
                console.log("Article is unable to be parsed.")
                var articleInfo = {
                    title: extractHostname(url)
                };
                resolve(articleInfo)
            }
        }

        xhttp.onerror = function(error) {
            console.log("Error parsing article: ", error);
            reject(error)
        }

        xhttp.open(method, diffBotURL, !0),
        xhttp.send();
    })
}



/**
 * Formats the contents of an Object into url parameters.
 *
 * @param {string} url URL from the web page to parse its contents.
 */
function getPoliticalSentiment(text) {
    return response = new Promise (function (resolve, reject) {
        var arguments = { 
            api_key: "c6d1cda692cec21f945116642b4c1a0b",
            data: text, 
        };

        var xhttp  = new XMLHttpRequest,
        indicoURL  = "https://apiv2.indico.io/political",
        method     = "POST";

        console.log("Getting political analysis from Indico API for text: ", text), 

        xhttp.onload = function() {

            var politicalSentiment = JSON.parse(xhttp.responseText).results;

            console.log(politicalSentiment);
            delete politicalSentiment["Green"];

            var strongestPoliticalSentiment = Object.keys(politicalSentiment).reduce(
                function(a, b) { 
                    return politicalSentiment[a] > politicalSentiment[b] ? a : b 
                });

            console.log("Strongest political sentiment = ", strongestPoliticalSentiment);

            resolve(strongestPoliticalSentiment);
        }

        xhttp.onerror = function(error) {
            console.log("Error analyzing text: ", error);
            reject(error)
        }

        xhttp.open(method, indicoURL, !0);
        xhttp.send(formatParams(arguments));
    })
}

/**
 * Formats the contents of an Object into url parameters.
 *
 * @param {string} url URL from the web page to parse its contents.
 */
function summarizeArticle(url) {
    return response = new Promise (function (resolve, reject) {
        var arguments = { 
            SM_API_KEY: "90D32633B1",
            SM_LENGTH: 1,
            SM_URL: url,
        };

        var xhttp  = new XMLHttpRequest,
        smmryURL   = "http://api.smmry.com/&" + formatParams(arguments, false),
        method     = "GET";

        console.log("Getting your article TLDR from SMMRY API for url: ", url), 

        xhttp.onload = function() {

            var summary = JSON.parse(xhttp.responseText).sm_api_content;

            console.log(JSON.parse(xhttp.responseText));

            resolve(summary);
        }

        xhttp.onerror = function(error) {
            console.log("Error analyzing text: ", error);
            reject(error)
        }

        xhttp.open(method, smmryURL, !0);
        xhttp.send();
    })
}

function createTLDR(articleURL, articleInfo, message) {
    return {

        "displayBoard":{
            "id":"-L6EdiTvMdp2B7tcNI8F",
            "name":"Tech + Social Good",
            "owner":"Pq7AYzyLZmS9QnycZavXXak10A42"
        },
        "firstMessage": message,
        "headline": articleInfo.title,
        "imageURL": articleInfo.imageURL,
        "originalPoster":"Pq7AYzyLZmS9QnycZavXXak10A42",
        "timeCreated": Date.now() / 1000,
        "url": articleURL
    };   
}

function sendToFirebase(tldr) {
    return response = new Promise (function (resolve, reject) {

        var xhttp     = new XMLHttpRequest,
        firebaseURL   = "https://tldr-v2.firebaseio.com/threads/"+username+".json",
        method        = "PUT";

        console.log("Sending TLDR to database...: ", firebaseURL), 

        xhttp.onload = function() {
            console.log(JSON.parse(xhttp.responseText));
            resolve();
        }

        xhttp.onerror = function(error) {
            console.log("Error analyzing text: ", error);
            reject(error)
        }

        xhttp.open(method, firebaseURL, !0);
        xhttp.send(JSON.stringify(tldr));
    })
}

function createMessage(message) {
    return {
        "sender":"Pq7AYzyLZmS9QnycZavXXak10A42",
        "text": message,
        "thread": username,
        "timeSent": Date.now() / 1000,
    };   
}

function updateUserTLDRsInFirebase(tldr) {
    return response = new Promise (function (resolve, reject) {

        var xhttp     = new XMLHttpRequest,
        firebaseURL   = "https://tldr-v2.firebaseio.com/user-threads/Pq7AYzyLZmS9QnycZavXXak10A42/"+username+".json",
        method        = "PUT";

        console.log("Sending TLDR to database...: ", firebaseURL), 

        xhttp.onload = function() {
            console.log(JSON.parse(xhttp.responseText));
            resolve();
        }

        xhttp.onerror = function(error) {
            reject(error)
        }

        xhttp.open(method, firebaseURL, !0);
        xhttp.send(true);
    })
}

function sendMessageToFirebase(message) {
    return response = new Promise (function (resolve, reject) {

        var formattedMessage = createMessage(message);
        var xhttp     = new XMLHttpRequest,
        firebaseURL   = "https://tldr-v2.firebaseio.com/messages/"+username+"/message-1.json",
        method        = "PUT";

        console.log("Sending TLDR message to database...: ", firebaseURL), 

        xhttp.onload = function() {
            console.log(JSON.parse(xhttp.responseText));
            resolve();
        }

        xhttp.onerror = function(error) {
            reject(error)
        }

        xhttp.open(method, firebaseURL, !0);
        xhttp.send(JSON.stringify(formattedMessage));
    })
}



function renderMetadata(url, articleInfo) {
    console.log("rendering the metadata...")
    var displayContainer = document.getElementById("display-container");
    if (articleInfo) {
        var tmpl = template(articleInfo);
        displayContainer.innerHTML = tmpl;
        sendTLDR(url, articleInfo);
    } else {
        console.log("Tried to render missing data");
    }
}

function sendTLDR(url, articleInfo) {
    var tldrMessage = document.getElementById('new-tldr-input-tldr');
    tldrMessage.addEventListener('keypress', function (e) {
        var key = e.which || e.keyCode;
        if (key === 13) { // 13 is enter // code for enter
            console.log(tldrMessage.innerHTML)
            var message = tldrMessage.innerHTML;
            var tldr = createTLDR(url, articleInfo, message);
            var firebaseUpdates = [];
            firebaseUpdates.push(sendToFirebase(tldr));
            firebaseUpdates.push(updateUserTLDRsInFirebase(tldr));
            firebaseUpdates.push(sendMessageToFirebase(message));
            Promise.all(firebaseUpdates)
            .then(function() {
                var header = document.getElementById('info-label');
                header.innerHTML = "TLDR sent! Write another one!";
                tldrMessage.innerHTML = "TLDR:";
            })
        }
    });
}

// This extension loads the article information from the current tab if one
// exists. The user can save new articles to the database.
document.addEventListener('DOMContentLoaded', () => {
    getCurrentTabUrl((url) => {

        // Gets the metadata for the article to render in the popup
        getArticleInformation(url)
        .then(function(articleInfo) {

            // Displays the metadata for the article 
            renderMetadata(url, articleInfo);

            // We're going to run two analysis APIs on the article
            // getPoliticalSentiment will return the political bias of the article
            // summarizeArticle will summarize the article into one sentence
            var articleAnalyses = [];
            articleAnalyses.push(getPoliticalSentiment(articleInfo.title));
            articleAnalyses.push(summarizeArticle(url));

            Promise.all(articleAnalyses)
            .then(function(analyses) {
                var politicalSentiment = analyses[0];
                var summary = analyses[1];

                // Now that we have the political sentiment and the article summary, we're going to display the metadata
                var tldr = document.getElementById('new-tldr-input-tldr');
                tldr.innerHTML = "(" + politicalSentiment + ") : " + summary;  
            })            
        });
    });
});


/**
 * Re-renders popup.html to show the metadata of the article
 *
 * Note: This is a super hacky implementation, that is making extremely static HTML modifications.
 *       Use frameworks like Angular to make more dynamic, extendable HTML modifications in your 
 *       future web projects. :)
 *
 * @param {Object} articleInfo: Contains the url, imageURL, and title of article.
 */
function template(articleInfo) {
    console.log("setting the template for thie article...")
    console.log("\n\n" + articleInfo.imageURL + "\n");
    var domain = domainName(articleInfo.url)
    return '\n  <header class="info-header">\n'+
    '   <div id="info-spinner" class="material-spinner material-spinner-small hidden">\n      '+
    '<svg class="circular" viewBox="25 25 50 50">\n        '+
    '<circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="4" stroke-miterlimit="10"/>\n      '+
    '</svg>\n    </div>\n    <div id="info-label" class="info-label">\n      Saved! Write a TLDR!\n    </div>\n  </header>\n  '+
    '<img class="preview-image" id="preview-image" src="' + articleInfo.imageURL + '">\n  <div class="site-description">\n    '+
    '<h3 class="title">' + articleInfo.title + '</h3>\n    <a href="' + 
    articleInfo.url + '" target="_blank" class="url">' + domain + '</a>\n  </div>\n  <div class="tldr-text-field">\n    '+
    '    <div class="new-tldr-input">\n      '+
    '<span class="new-tldr-input-tldr tldr-text" id="new-tldr-input-tldr" contenteditable="true">@username:</span>\n    </div>\n  </div>\n  '+
    '<hr>\n  <div class="tldr-label" id="tldr-label">\n    <span>Write a TLDR</span>\n  </div>\n '
}

