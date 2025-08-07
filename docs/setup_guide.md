# Detailed Setup Guide: Automated News Publisher

Welcome! This guide will walk you through every step required to set up your own automated news publishing system. Follow these steps carefully, and you'll have a running bot in no time.

---

## 🏛️ Phase 1: The Control Center (Google Sheets)

The Google Sheet is the "brain" of our system. It holds all the settings, RSS feeds, and logs.

**Action:** Create a new Google Sheet named **`News Automation Hub`**. Inside, create four tabs with the exact names and column headers listed below.

### 1. `ControlPanel` Tab

This is your main dashboard. The script reads these settings every time it runs.

<!-- **YOUR ACTION:** Upload your screenshot of this tab to `assets/screenshots/` and replace this line with:
![Control Panel Sheet](assets/screenshots/controlpanel_setup.png)
-->

| | A | B |
| :--- | :--- | :--- |
| **1**| **Setting Name** | **Setting Value** |
| **2**| Posting_Frequency_Hours | 4 |
| **3**| Max_Posts_Per_Day | 20 |
| **4**| Last_Post_Timestamp | *(leave blank)* |
| **5**| Posts_Today_Count | 0 |
| **6**| Discord_Webhook_URL | *(we will fill this in next)* |
| **7**| Facebook_Page_ID | *(paste your Facebook Page ID here)*|
| **8**| Make_Webhook_URL | *(we will get this from Make.com)*|
| **9**| Gemini_API_Key | *(paste your Google AI key here)* |

### 2. `RSS_Feeds` Tab

This is your list of news sources. The script will only read from feeds where "Active" is set to `Y`.

<!-- **YOUR ACTION:** Upload a screenshot of this tab and replace this line with:
![RSS Feeds Sheet](assets/screenshots/rss_feeds_setup.png)
-->

| | A | B |
| :--- | :--- | :--- |
| **1**| **Feed_URL** | **Active** |
| **2**| https://www.prothomalo.com/feed | Y |
| **3**| https://www.kalerkantho.com/rss.xml | Y |

### 3. `Posted_News` Tab

This is the system's "memory." The script writes a new row here after every successful post to prevent duplicates. You only need to set up the headers.

| | A | B | C | D | E |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1**| **Post_Timestamp** | **Article_Title** | **Article_URL**| **Image_URL** | **Post_ID_Status**|

### 4. `Error_Log` Tab

If anything goes wrong, the script will log the details here for debugging. You only need to set up the headers.

| | A | B | C | D |
| :--- | :--- | :--- | :--- | :--- |
| **1**| **Timestamp** | **Error_Type** | **Reason/Message**| **Associated_Article** |

---

## 🤖 Phase 2: The Publisher (Make.com)

Make.com's job is simple: catch the data from our script and post it to Facebook.

1.  **Create a New Scenario:** Log into Make.com and create a new scenario.
2.  **Add Webhook Trigger:** For the first module, search for and select **`Webhooks`**, then choose the **`Custom webhook`** trigger.
3.  **Create & Copy URL:** Click `Add`, give your webhook a name (e.g., `GAS Receiver`), and **copy the new URL** it provides.
4.  **Update Your Sheet:** Paste this new URL into cell **B8** in your `ControlPanel` sheet.
5.  **Add Facebook Module:** Add a second module. Search for **`Facebook Pages`** and select **`Create a Post with Photos`**.
6.  **Leave it blank for now.** We will configure the mapping in a later step.

Your final scenario should be a simple two-step flow.

<!-- **YOUR ACTION:** Upload a screenshot of the two-step scenario and replace this line with:
![Make.com Scenario](assets/screenshots/make_scenario_overview.png)
-->

---

## 🧠 Phase 3: The Brain (Google Apps Script)

This is where we install the code that orchestrates everything.

1.  **Open the Script Editor:** In your `News Automation Hub` Google Sheet, go to `Extensions > Apps Script`.
2.  **Copy the Code:** Go to this repository's `src/main.gs` file. Copy the entire contents of the file.
3.  **Paste the Code:** Go back to the Apps Script editor, delete any default code, and paste in the new code.
4.  **Save the Project:** Click the floppy disk icon to save.

---

## 🚀 Phase 4: Final Connection, Testing & Activation

This final phase brings the system to life.

1.  **Authorize the Script:**
    *   In the Apps Script editor, make sure the `runAutomation` function is selected, then click **"Run"**.
    *   A popup will appear asking for permissions. You **must** approve them. You may need to click "Advanced" and "Go to... (unsafe)" to proceed. This is normal.

2.  **Determine Data Structure in Make.com:**
    *   In your Make.com scenario, right-click the Webhook module and choose **"Redetermine data structure"**.
    *   Immediately go back to the Apps Script editor and click **"Run"** one more time. The webhook should now show "Successfully determined."

3.  **Map the Facebook Fields:**
    *   Click on your Facebook module in Make.com to open its settings.
    *   Map the incoming data to the fields exactly like this:
        *   `URL` (in the Photos item): Map to the **`image_url`** from the webhook.
        *   `Caption` (in the Photos item): Map to the **`message`** from the webhook.
        *   The main `Message` field at the bottom should be left **empty**.
    *   Click **Save**.

<!-- **YOUR ACTION:** Upload your most important screenshot showing the correct mapping and replace this line with:
![Facebook Module Mapping](assets/screenshots/make_facebook_mapping.png)
-->

4.  **Activate the Scenario:** At the bottom-left of the Make.com editor, **toggle the scheduling switch to ON.** Your publisher is now live and listening.

5.  **Set the Automatic Trigger:**
    *   In the Apps Script editor, go to the **Triggers** tab (the clock icon).
    *   Click **"+ Add Trigger"**.
    *   Set it up to run the **`runAutomation`** function on a **`Time-driven`** timer (e.g., `Minutes timer` every `30 minutes`).
    *   Click **Save**.

<!-- **YOUR ACTION:** Upload a screenshot of your trigger setup and replace this line with:
![Apps Script Trigger](assets/screenshots/apps_script_trigger.png)
-->

### Congratulations! 🎉

Your automated news publisher is now fully configured and live. You can monitor its activity via the Discord notifications and the Apps Script execution logs.
