import SharifyAPI from './api.server';

let api: SharifyAPI;

declare global {
    var __api: SharifyAPI | undefined
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === "production") {
	api = new SharifyAPI();
} else {
	if (!global.__api) {
        global.__api = new SharifyAPI();
    }

    api = global.__api;
}

export { api }
