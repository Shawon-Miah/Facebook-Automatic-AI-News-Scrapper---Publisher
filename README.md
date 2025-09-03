# 🤖 AI-Powered Facebook News Scraper & Publisher 📰

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![GitHub Actions](https://img.shields.io/badge/Automated%20by-GitHub%20Actions-blue?logo=githubactions)](https://github.com/features/actions)

This is a fully automated content creation and publishing bot. It scrapes news articles from various sources, uses an **AI (GPT-2)** to rewrite the headlines, and then **automatically publishes them to your Facebook Page**.

It's a complete, hands-free pipeline for content management, running for **FREE** on GitHub Actions.

## ✨ Key Features

-   🌐 **Multi-Source Scraping:** Pulls news from a customizable list of top websites.
-   🧠 **AI-Powered Content:** Uses a fine-tuned GPT-2 model via the Hugging Face `transformers` library to generate unique, engaging headlines.
-   🔄 **Automated Publishing:** Posts the scraped article link along with the new AI-generated headline directly to your Facebook Page.
-   ⏰ **Scheduled & Automated:** Runs on a schedule using GitHub Actions. Set it and forget it!
-   🔒 **Secure Credential Handling:** All your sensitive information (passwords, tokens) is managed safely using GitHub Secrets.

##  flowchart
Here's how it works:

**Scrape News Websites ➨ Feed to AI Engine (GPT-2) ➨ Post Unique Content to Facebook Page**

## 🛠️ Technology Stack

-   **Language:** Python 🐍
-   **Scraping:** Playwright
-   **AI / NLP:** Hugging Face Transformers (GPT-2)
-   **Automation:** GitHub Actions 🚀
-   **API:** Facebook Graph API

---

## 🚀 The Ultimate Setup Guide

Setting up this project involves two major parts. **Part A** is getting all your credentials from Facebook. **Part B** is setting up the GitHub repository to run the bot.

### **Part A: Facebook & Developer Prerequisites (The Hard Part)**

Before you touch the code, you need four critical things from Facebook. This can be tricky, so follow closely!

1.  **A Facebook Page:** You need a Facebook Page (not your personal profile) where you want to post the news. Create one if you don't have one.

2.  **Your Page ID:**
    -   Go to your Facebook Page.
    -   Click on **"About"** and scroll down to **"Page transparency"**.
    -   You will see your `Page ID`. **Copy this and save it.**

3.  **A Facebook Developer App & Access Token:**
    -   Go to [Meta for Developers](https://developers.facebook.com/) and create a Developer Account.
    -   Click **"My Apps"** > **"Create App"**. Choose **"Business"** as the type.
    -   Give your app a name.
    -   From your new app's dashboard, go to **"Tools"** > **"Graph API Explorer"**.
    -   On the right side, under "Permissions", find and add these two permissions:
        -   `pages_read_engagement`
        -   `pages_manage_posts`
    -   Click **"Generate Access Token"**. Log in and authorize it for your desired page.
    -   The token it gives you is a *short-lived token*. We need a permanent one!
    -   Click the little "i" icon next to the token, then **"Open in Access Token Debugger"**.
    -   In the debugger, click the **"Extend Access Token"** button at the bottom.
    -   This will give you a **long-lived (60 day) Access Token**. **Copy this and save it.** It's what we will use.

4.  **Your Facebook Login Credentials:**
    -   The scraper uses Playwright to log into Facebook to read news posts. You will need the **email and password** of a valid Facebook account.

**You should now have these 4 things saved in a notepad:**
-   `Your Facebook Email`
-   `Your Facebook Password`
-   `Your Page ID`
-   `Your Long-Lived Access Token`

### **Part B: GitHub Repository Setup (The Easy Part)**

Now we will set up the project to use the credentials you just collected.

1.  **Fork this Repository:**
    -   Click the **"Fork"** button at the top-right of this page to create your own copy.

2.  **Add Your Secrets:**
    -   In your new forked repository, go to **Settings** > **Secrets and variables** > **Actions**.
    -   You need to create **FOUR** secrets. Click **New repository secret** for each one:
        -   **Name:** `FB_EMAIL` -> **Value:** Your Facebook login email.
        -   **Name:** `FB_PASSWORD` -> **Value:** Your Facebook login password.
        -   **Name:** `PAGE_ID` -> **Value:** Your Facebook Page ID.
        -   **Name:** `ACCESS_TOKEN` -> **Value:** Your long-lived Access Token.

3.  **Enable and Run!**
    -   Go to the **"Actions"** tab of your repository. If prompted, click `I understand my workflows, go ahead and enable them`.
    -   The bot will now run on its schedule! To trigger it manually, click on **"Run Scraper and Poster"** on the left, then the **"Run workflow"** button.

---

## ⚠️ Important Disclaimer

Automating actions on social media platforms can be against their Terms of Service. This tool is intended for educational purposes. Overuse or misuse could potentially lead to your Facebook account being rate-limited or suspended. Use it responsibly and at your own risk.

## 🔧 Customization

You can easily change the news sources. Open the `scraper_and_post.py` file and edit the `NEWS_SOURCES` list at the top of the file.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.