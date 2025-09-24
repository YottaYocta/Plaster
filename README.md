The CTL at Cornell regularly uses Meta Quest's screencasting for VR classes. Sadly, Meta's casting is unreliable and led me to make this as a backup tool

<img width="3420" height="1970" alt="image" src="https://github.com/user-attachments/assets/020fd035-cd57-42b1-a2cb-a342e70592fb" />

# Setting Up the App: Easy Step-by-Step Guide

This guide will help you set up and run the app, even if you're new to technical tasks. Follow the steps for your operating system (Windows or Mac). We'll start by checking if you have the required tools, then install them if needed, and finally set up the app.

**Important:** if you've already installed the app and are re-running it, **start from step 4**

---

## Step 1: Check If You Have Node.js and Git Installed

Before installing anything, let’s check if you already have **Node.js** and **Git** on your computer. These are tools needed to run the app.

### Windows
1. Open the **Command Prompt**:
   - Press `Windows Key + R`, type `cmd`, and press `Enter`.
2. Check for **Node.js**:
   - Type `node --version` and press `Enter`.
   - If you see a version number (e.g., `v20.12.2`), Node.js is installed. If you get an error like “‘node’ is not recognized,” you’ll need to install it.
3. Check for **Git**:
   - Type `git --version` and press `Enter`.
   - If you see a version number (e.g., `git version 2.39.2`), Git is installed. If you get an error, you’ll need to install it.

### Mac
1. Open the **Terminal**:
   - Click the magnifying glass (Spotlight Search) in the top-right corner, type `Terminal`, and press `Enter`.
2. Check for **Node.js**:
   - Type `node --version` and press `Enter`.
   - If a version number appears (e.g., `v20.12.2`), Node.js is installed. If you see an error like “command not found,” you’ll need to install it.
3. Check for **Git**:
   - Type `git --version` and press `Enter`.
   - If a version number appears (e.g., `git version 2.39.2`), Git is installed. If you see an error, you’ll need to install it.

**If both Node.js and Git are installed**, skip to **Step 3**. If either is missing, follow the installation steps below.

---

## Step 2: Install Node.js and Git (If Needed)

### Windows
1. **Install Node.js**:
   - Visit [nodejs.org](https://nodejs.org/en).
   - Download the “LTS” version (recommended for most users).
   - Run the downloaded installer, follow the prompts, and accept the default settings.
   - After installation, open Command Prompt and type `node --version` to confirm it works.
2. **Install Git**:
   - Visit [git-scm.com](https://git-scm.com/download/win).
   - Download the installer for Windows.
   - Run the installer, accept the default settings, and click through to complete.
   - Open Command Prompt and type `git --version` to confirm it works.

### Mac
1. **Install Node.js**:
   - Visit [nodejs.org](https://nodejs.org/en).
   - Download the “LTS” version for macOS.
   - Run the downloaded installer, follow the prompts, and accept the default settings.
   - After installation, open Terminal and type `node --version` to confirm it works.
2. **Install Git**:
   - Open Terminal and type `xcode-select --install`. This installs Git along with other developer tools.
   - Follow the prompts to install. If Git is already installed, you’ll see a message saying so.
   - Alternatively, download Git from [git-scm.com](https://git-scm.com/download/mac) and run the installer.
   - Type `git --version` in Terminal to confirm it works.

---

<img width="1802" height="1160" alt="image" src="https://github.com/user-attachments/assets/43d27ec1-f544-4f85-9eda-2c6cee4666b4" />

## Step 3: Download the Plaster App

You can download the Plaster app using Git (recommended) or as a ZIP file.

### Option 1: Using Git (Recommended)
1. Open your terminal:
   - **Windows**: Open Command Prompt (`Windows Key + R`, type `cmd`, press `Enter`).
   - **Mac**: Open Terminal (Spotlight Search > `Terminal`).
2. Type the following commands:
   ```bash
   git clone https://github.com/YottaYocta/Plaster.git
   cd Plaster
   ```
   - This downloads the Plaster app files and moves you into the app’s folder.

### Option 2: Download as a ZIP File
1. Visit the Plaster GitHub page: [https://github.com/YottaYocta/Plaster](https://github.com/YottaYocta/Plaster).
2. Click the green **Code** button and select **Download ZIP**.
3. Unzip the downloaded file:
   - **Windows**: Right-click the ZIP file, select “Extract All,” and choose a location (e.g., your Desktop).
   - **Mac**: Double-click the ZIP file to unzip it.
4. Open your terminal and navigate to the unzipped folder:
   - **Windows**: Open Command Prompt, type `cd path\to\Plaster` (replace `path\to\Plaster` with the folder’s location, e.g., `cd Desktop\Plaster`), and press `Enter`.
   - **Mac**: Open Terminal, type `cd path/to/Plaster` (e.g., `cd ~/Desktop/Plaster`), and press `Enter`.

---

## Step 4: Install Dependencies and Start the App

1. In your terminal (still in the `Plaster` folder), type:
   ```bash
   npm install
   ```
   - This installs the app’s required files. It may take a few minutes.
2. After installation, type:
   ```bash
   npm run start
   ```
   - This starts the Plaster app. You’ll see some messages in the terminal, and the app may open automatically in your web browser.

---

## Step 5: Using the app

- If the app doesn’t open automatically, open your web browser (e.g., Chrome, Firefox, or Safari).
- Type `https://<IP address>:3000` in the address bar and press `Enter`. The IP address is printed in the terminal when you run `npm run start`
- If you're screensharing from a VR headset, open oculus browser and type in `https://<IP address>:3000`. This should bring you to the streamer interface
- If you're watching, follow the link called watcher, which will redirect you to the watcher page
- To quit, open the terminal that is running the app and type ctrl+C

---

## Troubleshooting Tips
- **Command not found or not recognized**: Double-check that Node.js and Git are installed by running `node --version` and `git --version`. If not, revisit **Step 2**.
- **Errors during `npm install`**: Ensure you’re in the `Plaster` folder (type `cd Plaster` if needed) and have an internet connection.
- **App doesn’t open**: Make sure you typed `http://localhost:3000` correctly in your browser. If it still doesn’t work, check the terminal for error messages.
- **Need help?**: Visit the Plaster GitHub page ([https://github.com/YottaYocta/Plaster](https://github.com/YottaYocta/Plaster)) and check the “Issues” section or contact the app’s support team.
