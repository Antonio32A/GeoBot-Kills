const { username, password } = require("../config.json");
const killList = require("./data/kills.json");
const mineflayer = require("mineflayer");
const repl = require("repl");
const { sendMessage } = require("./utils");

(async () => {
    console.log("logging in!");
    const bot = mineflayer.createBot({
        host: "geographica.xyz",
        port: 25565,
        version: "1.12.2",
        username, password
    });

    bot.on("login", () => {
        console.log(`Logged in as ${bot.username}.`);
        bot.chat("/hub");
    });

    // wait for scoreboard text from hub and once it sees it connect to earth
    const waitForHub = scoreboard => {
        if (/§[\d]§lGEOGRAPHICA/.test(scoreboard.title)) {
            console.log("Joining earth...");
            bot.chat("/play earth");
        } else
            bot.once("scoreboardTitleChanged", waitForHub);
    };

    bot.once("scoreboardTitleChanged", waitForHub);
    bot.once("kicked", console.log);

    const r = repl.start("> ");
    r.context.bot = bot;
    r.on("exit", bot.end);

    bot.on("message", (message, position) => {
        if (position === "game_info") return;
        console.log(message.toAnsi());
        const str = message.toString();

        for (const killTemplate of killList) {
            let regex = "^" + killTemplate
                .replace(/\bv\b/, "(?<victim>\\w{3,16})")
                .replace(/\bk\b/, "(?<killer>\\w{3,16})");

            // bow kill messages look slightly different
            if (killTemplate.includes("shot") || killTemplate.includes("sniped"))
                regex += " from (?<distance>\\d+\\.\\d+) meters\\.";
            else
                regex += " using (?<weapon>.+)\\.$";

            regex = new RegExp(regex);
            const groups = regex.exec(str)?.groups;

            if (groups)
                queueMessage(`${groups.killer} killed ${groups.victim} using ${groups.weapon ?? "a bow"}.`);
        }
    });
})();

let messageQueue = [];
setInterval(() => {
    sendMessage(messageQueue.join("\n")).catch(console.error);
    messageQueue = [];
}, 1000);

const queueMessage = content => messageQueue.push(content);