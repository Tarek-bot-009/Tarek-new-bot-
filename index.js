const { spawn } = require("child_process");
const express = require("express");
const path = require("path");
const axios = require("axios");
const logger = require("./utils/log");

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/health", (req, res) => {
    res.json({
        status: "online",
        uptime: process.uptime(),
        time: new Date()
    });
});

app.listen(PORT, () => {
    logger(`Server running on port ${PORT}`, "[ WEB ]");
});

let botProcess;

function startBot() {
    logger("Starting Messenger Bot...", "[ BOT ]");

    botProcess = spawn("node", ["Priyansh.js"], {
        cwd: __dirname,
        shell: true,
        stdio: "inherit"
    });

    botProcess.on("close", (code) => {
        logger(`Bot exited with code ${code}`, "[ BOT ]");

        setTimeout(() => {
            logger("Restarting Bot...", "[ BOT ]");
            startBot();
        }, 5000);
    });

    botProcess.on("error", (err) => {
        logger(err.message, "[ ERROR ]");
    });
}

axios
    .get("https://raw.githubusercontent.com/priyanshu192/bot/main/package.json")
    .then((res) => {
        logger(res.data.name, "[ NAME ]");
        logger(res.data.version, "[ VERSION ]");
        logger(res.data.description, "[ DESCRIPTION ]");
    })
    .catch(() => {
        logger("Unable to check update.", "[ UPDATE ]");
    });

process.on("SIGINT", () => {
    logger("Stopping Bot...", "[ EXIT ]");

    if (botProcess) {
        botProcess.kill();
    }

    process.exit(0);
});

process.on("SIGTERM", () => {
    logger("Stopping Bot...", "[ EXIT ]");

    if (botProcess) {
        botProcess.kill();
    }

    process.exit(0);
});

startBot();
