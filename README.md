# WhatsApp Chatbot - Node.js

This is an automated WhatsApp chatbot project built using the [`whatsapp-web.js`](https://github.com/pedroslopez/whatsapp-web.js) and [`puppeteer`](https://pptr.dev/) libraries.

## Purpose

The bot automates interactions on WhatsApp, such as responding to messages, collecting data, and executing menu flows. It's ideal for support, notifications, and simple customer service systems.

## Requirements - important! 

- Node.js (recommended version: `14.21.3`)
- npm (`6.14.18`)
- Google Chrome/Chromium installed (required by Puppeteer)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/chatbot-whatsapp.git
cd chatbot-whatsapp
```

2. Install the dependencies listed in `requirements.txt`:

```bash
Get-Content requirements.txt | ForEach-Object { npm install $_ }
```

> The `requirements.txt` file contains specific versions of libraries to ensure compatibility with the code.

3. Start the bot:

```bash
node chatbot.js
```

## Notes

- The `node_modules` directory is properly ignored via `.gitignore`.
- Some large Puppeteer files were excluded from version control due to GitHub's 100MB file size limit.
- This project is still under development and may evolve to include state control logic, persistence, and API integration.

## Main Libraries

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [puppeteer](https://pptr.dev/)

---

Made by André Fernandes! 
