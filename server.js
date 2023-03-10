const path = require("path");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const { createRequestHandler } = require("@remix-run/express");

const BUILD_DIR = path.join(process.cwd(), "build");

const app = express();

//  __________                                             ______              ______             _________         _____       _______________
//  ___  ____/___  ____________________________________    ___  /_______ _________  /___________________  /  _________  /____  ____  __/__  __/
//  __  __/  __  |/_/__  __ \_  ___/  _ \_  ___/_  ___/    __  __ \  __ `/  ___/_  //_/  _ \_  __ \  __  /   __  ___/  __/  / / /_  /_ __  /_  
//  _  /___  __>  < __  /_/ /  /   /  __/(__  )_(__  )     _  /_/ / /_/ // /__ _  ,<  /  __/  / / / /_/ /    _(__  )/ /_ / /_/ /_  __/ _  __/  
//  /_____/  /_/|_| _  .___//_/    \___//____/ /____/      /_.___/\__,_/ \___/ /_/|_| \___//_/ /_/\__,_/     /____/ \__/ \__,_/ /_/    /_/     
//

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
	"/build",
	express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be
// more aggressive with this caching.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.get('/__credentials', (_, res) => {
	res.json({
        id: process.env.SPOTIFY_CLIENT_ID,
        secret: process.env.SPOTIFY_CLIENT_SECRET,
    })
})

app.all(
	"*",
	process.env.NODE_ENV === "development"
		? (req, res, next) => {
				purgeRequireCache();

				return createRequestHandler({
					build: require(BUILD_DIR),
					mode: process.env.NODE_ENV,
				})(req, res, next);
			}
		: createRequestHandler({
				build: require(BUILD_DIR),
				mode: process.env.NODE_ENV,
			})
);
const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`Express server listening on http://localhost:${port}`);
});

function purgeRequireCache() {
	// purge require cache on requests for "server side HMR" this won't let
	// you have in-memory objects between requests in development,
	// alternatively you can set up nodemon/pm2-dev to restart the server on
	// file changes, but then you'll have to reconnect to databases/etc on each
	// change. We prefer the DX of this, so we've included it for you by default
	for (const key in require.cache) {
		if (key.startsWith(BUILD_DIR)) {
			delete require.cache[key];
		}
	}
}
