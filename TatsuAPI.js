const mappedFetch = fetch || require && require("node-fetch");
if (!mappedFetch) {
    throw new Error("Couldn't find any fetch installation. If you are using node please install node-fetch");
}

const APIVERSION = 1;
const BASEPATH = `https://api.tatsu.gg/v${APIVERSION}/`;

class TatsuAPI {

    /**
     *
     * @param {string} token
     */
    constructor(token) {
        this.token = token;
        this.handler = new RatelimitHandler({"Authorization": token});
    }

    /**
     * @param {string} guildID
     * @param {number?} page
     * @returns {Promise<Rankings>}
     */
    getGuildLeaderboard(guildID, page = 0) {
        return this.handler.get(BASEPATH + `guilds/${guildID}/rankings/all?offset=${page * 100}`);
    }

    /**
     *
     * @param {string} userID
     * @param {string} guildID
     * @returns {Promise<Member>}
     */
    getUserRankInGuild(userID, guildID) {
        return this.handler.get(BASEPATH + `guilds/${guildID}/rankings/members/${userID}/all`)
    }

    /**
     *
     * @param {string} userID
     * @returns {Promise<User>}
     */
    getUserProfile(userID) {
        return this.handler.get(BASEPATH + `users/${userID}/profile`);
    }

    /**
     * @returns {number}
     */
    getQueueSize() {
        return this.handler.getQueueSize();
    }

}

/**
 * @class RatelimitHandler
 * @property {Record<string, string>} globalHeaders
 * @property {null|Ratelimit} rateLimit
 * @property {Array<{url: string, options: RequestInit, resolve: function(object)}>} queue
 * @property {boolean} running;
 */
class RatelimitHandler {

    /**
     * @param {Record<string, string>} globalHeaders
     */
    constructor(globalHeaders) {
        this.globalHeaders = globalHeaders;
        this.rateLimit = null;
        this.queue = [];
        this.running = false;
        this.runQueue = this.runQueue.bind(this);
        this.invalid = false;
        this.count = 0;
    }

    /**
     * @returns {number}
     */
    getQueueSize() {
        return this.queue.length;
    }

    /**
     * @param {string} url
     * @param {Record<string, string>?} headers
     * @returns {Promise<Response>}
     */
    get(url, headers = {}) {
        return this.request(url, {headers: {...headers, ...this.globalHeaders}})
    }

    /**
     * @param {string} url
     * @param {BodyInit} body
     * @param {Record<string, string>} headers
     * @returns {Promise<Response>}
     */
    post(url, body, headers) {
        if (this.invalid) {
            return Promise.reject("Unauthorized");
        }
        return this.request(url, {
            body: body,
            headers: {...headers, ...this.globalHeaders}
        })
    }

    /**
     * @param {string} url
     * @param {RequestInit} options
     */
    request(url, options) {
        return new Promise(resolve => {
            this.queue.push({url: url, options: options, resolve: resolve});
            if (!this.running) {
                this.startQueue();
            }
        });
    }

    startQueue() {
        this.running = true;
        if (!this.rateLimit) {
            this.runQueue();
        } else if (this.rateLimit.remaining > 0) {
            this.runQueue();
        } else {
            this.sleepUntil(this.rateLimit.reset).then(this.runQueue);
        }
    }

    endQueue() {
        this.running = false;
    }

    runQueue() {
        this.count++;
        if (this.count > 30) {
            return;
        }
        let remaining = this.rateLimit ? this.rateLimit.remaining || 1 : 1;
        let promises = [];
        if (remaining > 0) {
            for (let i = 0; i < remaining && this.queue.length > 0; i++) {
                promises.push(this.deQueue().catch(console.error));
                if (this.rateLimit) {
                    this.rateLimit.remaining--;
                }
            }
        } else {
            promises.push(Promise.resolve());
        }
        if (this.queue.length > 0) {
            if (this.rateLimit && this.rateLimit.reset*1000 > Date.now()) {
                this.sleepUntil(this.rateLimit.reset).then(this.runQueue);
            } else {

                Promise.any(promises).then(nothing => {
                    if (this.rateLimit.remaining === 0) {
                        this.sleepUntil(this.rateLimit.reset).then(this.runQueue)
                    } else {
                        this.runQueue();
                    }
                }).catch(console.error);
            }
        } else {
            Promise.any(promises).then(nothing => {
                if (this.queue.length === 0) {
                    this.endQueue();
                } else {
                    this.runQueue();
                }
            })
        }

    }

    deQueue() {
        let element = this.queue.shift();
        return fetch(element.url, element.options)
            .then(response => {
                const headers = response.headers;
                if (response.status === 401) {
                    this.invalid = true;
                    throw new Error("Invalid api key");
                }
                this.setRateLimit(headers.get("X-RateLimit-Limit"), headers.get("X-RateLimit-Remaining"), headers.get("X-RateLimit-Reset"));
                element.resolve(response.json());
                return this.rateLimit;
            })

    }

    setRateLimit(limit, remaining, reset) {
        if (!this.rateLimit || reset !== this.rateLimit.reset) {
            this.rateLimit = {limit: limit, remaining: remaining, reset: reset};
        }
    }

    sleepUntil(timestamp) {
        let diff = timestamp*1000 - Date.now() + 1000;
        if (diff > 0) {
            return new Promise(resolve => {
                setTimeout(() => this.sleepUntil(timestamp).then(resolve), diff);
            })
        } else {
            return Promise.resolve();
        }
    }

}

// For use as node module
if (this.hasOwnProperty('exports')) {
    exports.TatsuAPI = TatsuAPI;
}

/**
 * @typedef {object} Member
 * @property {string} guild_id
 * @property {int} rank
 * @property {int} score
 * @property {string} user_id
 */

/**
 * @typedef {object} Rankings
 * @property {string} guild_id
 * @property {Array<Rank>} rankings
 */

/**
 * @typedef {object} Rank
 * @property {int} rank
 * @property {int} score
 * @property {string} user_id
 */

/**
 * @typedef {object} User
 * @property {string} avatar_url
 * @property {string} avatar_hash
 * @property {int} credits
 * @property {string} discriminator
 * @property {string} id
 * @property {string} info_box
 * @property {int} reputation
 * @property {int} subscription_type
 * @property {string} title
 * @property {int} tokens
 * @property {string} username
 * @property {int} xp
 */

/**
 * @typedef {object} Ratelimit
 * @property {int} limit
 * @property {int} remaining
 * @property {int} reset
 */
