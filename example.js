const token = "<API-KEY>"; // Gotten from t!apikey
const testUserID = "261538420952662016"; // My id
const testGuildID = "173184118492889089"; // Tatsu Lounge

/**
 * Creates an instance of the API Wrapper. No more than one should be created.
 * Supply your api key via the first argument
 * @type {TatsuAPI}
 */
const api = new TatsuAPI(token);

/**
 * Gets the userobject of the user with the specified id
 *
 * @link User
 * {
 *  "avatar_url": "https://cdn.discordapp.com/avatars/261538420952662016/b165f9d1068eee972761cc95fd7889fd.png",
 *  "credits": 361756,
 *  "discriminator": "1317",
 *  "id": "261538420952662016",
 *  "info_box": "╔\t\t\t\t\t\t\t\t\t ╗\r\n\r\n\t\t\t       I'm mean\r\n\r\n╚\t\t\t\t\t\t\t\t\t ╝",
 *  "reputation": 163,
 *  "title": " ",
 *  "tokens": 186,
 *  "username": "Elspeth",
 *  "xp": 702935
 * }
 */
api.getUserProfile(testUserID).then(console.log);

/**
 * Gets the first 100 places of the leaderboard of given guild
 *
 * @link Rankings
 * {
 *   "guild_id": "173184118492889089",
 *   "rankings": [
 *     {
 *       "rank": 1,
 *       "score": 497552,
 *       "user_id": "192786537451225088"
 *     },
 *     {
 *       "rank": 2,
 *       "score": 489076,
 *       "user_id": "104359575301394432"
 *     },
 *     ...
 *   ]
 * }
 */
api.getGuildLeaderboard(testGuildID).then(console.log);

/**
 * Gets the places 101 to 200 of the leaderboard of given guild (2nd page)
 *
 * @link Rankings
 * {
 *  "avatar_url": "https://cdn.discordapp.com/avatars/261538420952662016/b165f9d1068eee972761cc95fd7889fd.png",
 *  "credits": 361756,
 *  "discriminator": "1317",
 *  "id": "261538420952662016",
 *  "info_box": "╔\t\t\t\t\t\t\t\t\t ╗\r\n\r\n\t\t\t       I'm mean\r\n\r\n╚\t\t\t\t\t\t\t\t\t ╝",
 *  "reputation": 163,
 *  "title": " ",
 *  "tokens": 186,
 *  "username": "Elspeth",
 *  "xp": 702935
 * }
 */
api.getGuildLeaderboard(testGuildID, 1).then(console.log);

/**
 * Returns the user rank in given Guild
 *
 * @link Member
 * {
 *  "guild_id": "173184118492889089",
 *  "rank": 19,
 *  "score": 165274,
 *  "user_id": "261538420952662016"
 * }
 */
api.getUserRankInGuild(testUserID, testGuildID).then(console.log);
