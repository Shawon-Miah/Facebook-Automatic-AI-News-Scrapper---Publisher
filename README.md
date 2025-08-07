# Facebook Automatic AI News Scrapper & Publisher 📰🤖

An automated news pipeline using Google Apps Script to scrape articles from RSS feeds, Google Gemini API to clean the content, and Make.com to publish everything as a native photo post to a Facebook Page.

![Language](https://img.shields.io/badge/Language-Google%20Apps%20Script-yellow?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Make.com-blue?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-green?style=for-the-badge)
![License](https://img.shields.io/github/license/Shawon-Miah/Facebook-Automatic-AI-News-Scrapper---Publisher?style=for-the-badge)


---

## Overview

This project is the ultimate solution for creating a "no-human-touch" news publishing system. It runs entirely on a schedule, intelligently finds and verifies news articles, uses a powerful AI to clean the content professionally, and posts it to a Facebook Page in a format designed for high engagement.

The goal is to move beyond simple link sharing and create rich, native photo posts that include the full article text, which often results in better organic reach on Facebook.

## Features

-   **Runs on a Schedule:** Set it and forget it. Runs automatically at your chosen interval and within a specific time window (e.g., 9 AM to 9 PM).
-   **Intelligent Scraping:** Doesn't just read the RSS summary; it visits the actual article page to find the best image and the complete article body.
-   **AI-Powered Cleaning:** This is the core of the project. It uses the Google Gemini API to professionally clean messy web content. It removes ads, boilerplate text ("Read More," author bios), HTML junk, and decodes special characters, leaving only the pure, clean article text.
-   **Duplicate Prevention:** Keeps a log of posted article titles in a Google Sheet to ensure the same news is never published twice.
-   **Smart Feed Rotation:** Randomly cycles through your RSS feed list at the start of each run to ensure content variety and avoid getting stuck on a single broken feed.
-   **Real-time Notifications:** Get instant success and error alerts sent to your Discord server via webhooks, so you always know what your system is doing.
-   **Manual Override:** Includes a special function (`forceRunAutomation`) that allows you to trigger a post immediately, ignoring the schedule.

## How It Works

The workflow is a simple, powerful, and cost-effective pipeline:

`[Google Sheet with Feeds]` → `[Time-driven Apps Script]` → `[Scraper finds new article]` → `[Gemini API cleans HTML]` → `[Make.com Webhook receives final data]` → `[Posts Photo to Facebook Page]` → `[Notifies Discord]`

## Prerequisites

To build this yourself, you will need **free accounts** for the following services:
-   A **Google Account** (for Google Sheets and Google Apps Script)
-   A **Make.com Account**
-   A **Facebook Page** you are an admin of
-   A **Discord Server** where you can create a webhook
-   A **Google AI (Gemini) API Key**

---

## 🚀 Setup Guide

For a complete, step-by-step walkthrough with all the necessary screenshots, please see the **[Detailed Setup Guide](docs/setup_guide.md)**. (We will create this file next).

## Configuration

All settings for the script are managed in the `ControlPanel` tab of your Google Sheet. This allows you to change settings like post frequency or your API key without ever touching the code.

You need to set up your Google Sheet with four tabs: `ControlPanel`, `RSS_Feeds`, `Posted_News`, and `Error_Log`.

#### `ControlPanel` Structure:
| Setting Name              | Description                                                  |
| ------------------------- | ------------------------------------------------------------ |
| Posting_Frequency_Hours   | *Legacy - not used by current trigger, but can be referenced.* |
| Max_Posts_Per_Day         | A daily safety limit for how many articles can be published.   |
| Last_Post_Timestamp       | The script updates this automatically. Leave blank.          |
| Posts_Today_Count         | The script updates this automatically. Resets daily.         |
| Discord_Webhook_URL       | The webhook URL for your Discord notifications.              |
| Facebook_Page_ID          | The ID of your Facebook Page.                                |
| Make_Webhook_URL          | The URL from your Make.com scenario webhook.                 |
| Gemini_API_Key            | Your secret API key from Google AI Studio.                   |

*(Note: The `Posting_Frequency_Hours` is a legacy setting from the original plan. The live schedule is now controlled by the Apps Script trigger.)*

---

## The Code

The complete and documented Google Apps Script code can be found in `src/main.gs`.

### Main Functions
-   **`runAutomation()`**: This is the main function for the automated trigger. It respects the 9 AM - 9 PM time gate and is configured to post only 1 article per run to be safe.
-   **`forceRunAutomation()`**: This is your manual override. It ignores the time gate and will post up to 5 articles in a single run.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
