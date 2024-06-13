# This is my old, immutable TODO file for the Remix app

*Some stuff can be confusing, keep in mind that I have a Rust API & Websocket running aside from the app and this ain't an organized todo list*

- [ ] Review token scopes and justify their use:
- - user-read-private => search for an item (global search), get current user profile
- - user-read-email => get current user profile
- - user-modify-playback-state => resume, pause, seek, volume, next/previous, transfer playback to a new device, add item to the playback queue
- - [ ] user-read-playback-position => to check
- - [ ] user-library-read => to check
- - [ ] streaming => web playback SDK, to check
- - user-read-playback-state => get available devices, get current user playback/playing track
- - user-read-recently-played => get recently played tracks
- - [ ] playlist-read-private => to check

- [ ] When finished, add these to the app policy to justify the app needs for the users account



- [x] update the README about Spotify API Tokens (select the chosen one)
- [ ] Refacto Spotify API handler.
- - [x] use PCKE auth insead of the basic one; implement code_verifier server side and send it with an endpoint
- - [x] store the code_verifier in client's local storage
- - [x] migrate from spotify-web-api-node to @spotify/web-api-ts-sdk
- - [ ] impl rate limit quota (one that can be easily disabled => developer mode to extended quota mode) 429 status; retry-after HEADER
- - [ ] (while in developer mode, 403 unauthorized can be received for accounts that aren't on the app's dashboard)
- - [ ] latency check for clients requests (struct field latency on SharifyPartyManager { time: Instant(if > 1min, reset), latency: f32(requests time++)})

- [x] handle the refresh token loops server-side to reduce the update latency (since clients requests are handled server-side)
- [ ] implement UUIDv4 for user IDs (and party IDs) instead of using their username as IDs (client & server)
- [ ] limit the (next tracks) queue to avoid spamming (maybe per user and configurable by owner/mods => queue limit, user limit)
- [ ] define and delete a "dead room" by the time no user is connected to avoid having rooms with no clients and keeping the interval for too much time


# SvelteKit app

- [ ] Finish the rewrite to match the Remix inital POC
- - [ ] Display users and their status
- [ ] Don't forget that every client env var is used dynamically, maybe think about using static after thinking about it
- [ ] Rework Spotify handler to match the server (the server handles the refresh token etc..)
- [ ] Better handle on refresh token (on processToken when laucnhing app -> retrieving tokens from localstorage) and disable its loop since it's handled by the server
- [ ] Remove track from party tracks_queue when track is playing

## Ideas
- ~~*Maybe use a second Spotify token (of the owner) to only handle the search and spread it to clients ?* if so, update the README~~ No, it won't be good for user experience to ask for 2 access on his/her Spotify account
