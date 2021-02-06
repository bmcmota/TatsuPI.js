# TatsuPI.js

TatsuPI.js is an API Wrapper for the public RESTapi of the Tatsu Discord Bot.\
It handles the ratelimit and requests on itself and is designed to be used in the content of frontend Applications

# Usage

First create a new TatsuAPI object. Here you will have to supply your API-Key which you get from the `t!apikey` command
```js
const api = new TatsuAPI(token);
```

The api then opens up multiple function to access the API, each returning a Promise.
```js
api.getUserProfile("<userId>"); // To get a users profile
api.getGuildLeaderboard("<guildId>",[page number]); // To get the guild leaderboard
api.getUserRankInGuild("<userId>", "<guildId>"); // To get the User Rank in a guild
```
