/**
 * =================================================================
 *              Automated News Publisher - Main Script
 * =================================================================
 *
 * This Google Apps Script is the "brain" of the operation. It's
 * designed to be run on a schedule. It does the following:
 *
 * 1. Reads a list of active RSS feeds from a Google Sheet.
 * 2. Finds the latest article that hasn't been posted before.
 * 3. Scrapes the article's webpage to find the main image and
 *    the full article content (as messy HTML).
 * 4. Sends the messy HTML to the Google Gemini AI for intelligent
 *    cleaning and processing.
 * 5. Takes the clean title, image URL, and cleaned content and
 *    sends it to a Make.com webhook to be published on Facebook.
 * 6. Logs the post and updates control settings in the Google Sheet.
 *
 * @author Your GitHub Handle (e.g., Shawon-Miah)
 * @version 1.0.0
 */


// =================================================================
//                    TRIGGER & CONTROLLER FUNCTIONS
// =================================================================

/**
 * The MAIN function for your SCHEDULED trigger.
 * This is the function you will set to run automatically every 30 minutes.
 * It includes a "time gate" to ensure it only runs between 9 AM and 9 PM.
 */
function runAutomation() {
  // Get the current time to check if we're within our active hours.
  const now = new Date();
  // We specify "Asia/Dhaka" to make sure the time is correct for Bangladesh time.
  const currentHour = parseInt(Utilities.formatDate(now, "Asia/Dhaka", "H")); 
  
  // This is the time gate. 9 is 9 AM, 21 is 9 PM.
  // If the current hour is BEFORE 9 AM or AFTER 9 PM, stop right here.
  if (currentHour < 9 || currentHour >= 21) {
    console.log(`Current hour (${currentHour}) is outside of the allowed 9 AM to 9 PM window. Scheduled run is stopping.`);
    return; // Exit the function immediately.
  }
  
  console.log("Scheduled run is within the time window. Executing core logic...");
  // Scheduled runs have a safety limit of 1 post per run.
  executeCoreAutomation(1); 
}


/**
 * Your MANUAL OVERRIDE button!
 * Select and run this function directly from the Apps Script editor to post
 * an article immediately, ignoring the time gate.
 */
function forceRunAutomation() {
  console.log("--- MANUAL OVERRIDE INITIATED: IGNORING TIME GATE ---");
  // The manual run will post a MAXIMUM of 5 articles, as a safety measure.
  executeCoreAutomation(5);
}


// =================================================================
//                       CORE AUTOMATION ENGINE
// =================================================================

/**
 * This is the main engine of the whole system. It finds and posts the news.
 * @param {number} post_limit - The maximum number of articles to post in this single run.
 */
function executeCoreAutomation(post_limit) {
  // Connect to our Google Sheet and get all the tabs we need.
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const controlPanelSheet = ss.getSheetByName('ControlPanel');
  const postedSheet = ss.getSheetByName('Posted_News');
  let postsThisRun = 0; // A safety counter for this specific execution.

  // Load all our settings from the ControlPanel tab.
  const settingsData = controlPanelSheet.getRange('A2:B9').getValues();
  let settings = {};
  for (let row of settingsData) { if (row[0]) settings[row[0]] = row[1]; }
  
  // Daily Limit Check: First, check if we've already hit our overall daily limit.
  let postsToday = parseInt(settings.Posts_Today_Count, 10);
  if (postsToday >= settings.Max_Posts_Per_Day) {
    console.log("Stopping: Daily post limit reached.");
    sendDiscordNotification(settings.Discord_Webhook_URL, " Automation Notice", "Daily post limit has been reached. No more posts will be made today.", 15158332); // Red
    return;
  }

  // Get our list of active RSS feeds.
  const feedsSheet = ss.getSheetByName('RSS_Feeds');
  let feedUrls = feedsSheet.getRange('A2:B' + feedsSheet.getLastRow()).getValues().filter(row => row[1].toUpperCase() === 'Y').map(row => row[0]);
  shuffleArray(feedUrls); // Shuffle them to start at a random point for variety.
  
  // Get our "memory" of already-posted titles ONCE at the start.
  let postedTitles = [];
  if (postedSheet.getLastRow() > 1) {
    postedTitles = postedSheet.getRange('B2:B' + postedSheet.getLastRow()).getValues().flat();
  }
  
  // Loop through each feed in our shuffled list.
  for (const feedUrl of feedUrls) {
    if (postsThisRun >= post_limit) break; // If we've hit our limit, stop checking feeds.
    
    try {
      // Fetch the content of the RSS feed.
      const xml = UrlFetchApp.fetch(feedUrl, { muteHttpExceptions: true }).getContentText();
      const document = XmlService.parse(xml);
      const root = document.getRootElement();
      if (!root || !root.getChild('channel')) continue; // Skip if the feed is broken.
      const items = root.getChild('channel').getChildren('item');

      for (const item of items) {
        if (postsThisRun >= post_limit) break; 

        try {
          const title = item.getChild('title').getText();
          if (postedTitles.includes(title)) { continue; }
          
          const articleUrl = item.getChild('link').getText();
          const pageMetadata = getArticleContentAndMetadata(articleUrl);
          if (!pageMetadata) { continue; }
          
          const cleanContent = cleanContentWithGoogleAI(pageMetadata.rawContentHtml, settings.Gemini_API_Key);
          if (!cleanContent) { continue; }

          const payload = { "message": title + "\n\n" + cleanContent, "image_url": pageMetadata.imageUrl };
          UrlFetchApp.fetch(settings.Make_Webhook_URL, { 'method': 'post', 'contentType': 'application/json', 'payload': JSON.stringify(payload) });
          console.log(`>>>> SUCCESS! Post ${postsThisRun + 1}/${post_limit}: "${title}" <<<<`);
          
          sendDiscordNotification(settings.Discord_Webhook_URL, "✅ New Article Posted!", `**${title}**`, 3066993, articleUrl);

          postedTitles.push(title); 
          postedSheet.appendRow([new Date(), title, articleUrl, pageMetadata.imageUrl, "Posted Successfully"]);
          
          postsToday = parseInt(controlPanelSheet.getRange('B5').getValue(), 10);
          controlPanelSheet.getRange('B4').setValue(new Date());
          controlPanelSheet.getRange('B5').setValue(postsToday + 1);
          
          postsThisRun++;

        } catch (e) { continue; }
      }
    } catch (e) { continue; }
  }
  console.log(`--- Run finished. Total posts made in this run: ${postsThisRun} ---`);
}


// =================================================================
//                   SPECIALIST & HELPER FUNCTIONS
// =================================================================

/**
 * The Scraper. Visits a URL and tries to extract the main image and raw article HTML.
 */
function getArticleContentAndMetadata(url) { 
  try { const html = UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText(); const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/); const imageUrl = imageMatch ? imageMatch[1] : null; if (!imageUrl) { return null; } const contentPatterns = [/<article[^>]*>([\s\S]*?)<\/article>/, /<div[^>]+class="[^"]*content-details[^"]*"[^>]*>([\s\S]*?)<\/div>/]; let rawContentHtml = ''; for (const pattern of contentPatterns) { const match = html.match(pattern); if (match && match[1]) { rawContentHtml = match[1]; break; } } if (!rawContentHtml) { return null; } return { imageUrl: imageUrl, rawContentHtml: rawContentHtml }; } catch (e) { return null; }
}

/**
 * The AI Cleaner. Sends messy HTML to the Google Gemini API for cleaning.
 */
function cleanContentWithGoogleAI(rawHtml, apiKey) {
  const apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + apiKey; const prompt = `You are an expert content cleaner. Your task is to extract the pure article text from the provided raw HTML. Follow these rules precisely: 1. Remove ALL HTML, script, and style tags. 2. Decode all HTML entities (e.g., '&ldquo;' to '“'). 3. Remove boilerplate text like "আরো পড়ুন", "Copy Link", author names, and timestamps. 4. Do not summarize or change the original story. 5. Return ONLY the final, clean, plain text. Here is the raw HTML:\n---\n${rawHtml}`; const payload = { "contents": [{ "parts": [{ "text": prompt }] }], "safetySettings": [ { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" }, { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" } ] }; const options = { 'method': 'post', 'contentType': 'application/json', 'payload': JSON.stringify(payload), 'muteHttpExceptions': true }; try { const response = UrlFetchApp.fetch(apiUrl, options); const responseData = JSON.parse(response.getContentText()); if (responseData.candidates && responseData.candidates[0].content) { return responseData.candidates[0].content.parts[0].text; } else { return null; } } catch(e) { return null; }
}

/**
 * Sends a nicely formatted embedded message to your Discord webhook.
 */
function sendDiscordNotification(webhookUrl, title, description, color, articleUrl) {
  const payload = { "embeds": [{ "title": title, "description": description, "url": articleUrl || null, "color": color, "footer": { "text": "Automated News Publisher" }, "timestamp": new Date().toISOString() }] }; const options = { 'method': 'post', 'contentType': 'application/json', 'payload': JSON.stringify(payload) }; UrlFetchApp.fetch(webhookUrl, options);
}

/**
 * A simple utility function to randomly shuffle an array.
 */
function shuffleArray(array) { 
  for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[array[i], array[j]] = [array[j], array[i]]; }
}
