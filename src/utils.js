const { webhookURL } = require("../config.json");
const fetch = require("node-fetch");

module.exports = {
    sendMessage: content => fetch(webhookURL, {
        method: "POST",
        body: JSON.stringify({ content }),
        headers: { "Content-Type": "application/json" }
    })
};
