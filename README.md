# Sharify by Snoupix

Sharify is a Remix web app project that resolves the following problem: let's say you're at a party and someone you don't know manages the music with **Spotify**. You would like to put a particular song but you can't control his phone. Here comes Sharify. It's an app where you link your Spotify account to create a "room" with a password where people can join and add a song to your current playlist queue. So everyone with the app and the room's password can add songs to listen to!

### EDIT

Spotify recently released [Spotify Jam](https://support.spotify.com/us/article/jam/) which is an equivalent of my app but since I wanted to add features for streamers like moderation stuff, a twitch bot, a Deezer/Youtube link.. This project will still be continued.

## Current features

- The room owner can see, kick or ban people from their room. They can see and control the current playing song (play, pause, next, previous, volume) and add a song to the current queue with a search bar that retrieves Spotify songs. They also can see the 5 next and 5 previous tracks.
- The room client can see the current playing song, use the same search bar and add to the current queue. They can see the same next and previous tracks.

## Dependencies

This web app uses:

- [Remix](https://remix.run/) so, React
- [React toastify](https://fkhadra.github.io/react-toastify/introduction/) for notification handling
- [Typescript](https://www.typescriptlang.org/) for *pseudo* type-safety
- [Cypress](https://www.cypress.io/) for End-to-End testing
- [Tailwind](https://tailwindcss.com/) for styling
- [Spotify web API](https://developer.spotify.com/documentation/web-api/) but with [this package](https://www.npmjs.com/package/spotify-web-api-node)

## Spotify access tokens

I initially chosen to use the basic [authorization code](https://developer.spotify.com/documentation/web-api/tutorials/code-flow) strategy because it was used by my dependency ([spotify-web-api-node](https://www.npmjs.com/package/spotify-web-api-node)) and because it was easy to implement and was perfect for my use-case.

Then, since I, initially, used to share tokens across clients, I decided to use the [authorization code PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow) instead and generate `code_verifier` and `code_challenge` on my server API for security reasons.

----

To handle Spotify owners tokens and their integrity, I had these choices: *(bold "con(s)" are the reason(s) I omitted a choice)*

> Generate 1 token by the owner and spread it across clients for them to use it

Pros:
- easy to implement
- easy for the owner and clients to use the app

Con:
- **huge security issue for the owners tokens because they are shared and stored**

> Generate 2 different tokens, one for the owner and one for the clients with less scopes (less safe but the owner can create and leave)

Pros:
- scopes would be limited for the clients
- owner can create and leave the room without any issues

Cons:
- **event if limited, scopes are still a problem since they can be used to search tracks and manage the owner's playback state, therefore not secure enough**
- **tokens are still spread and unsecured**

> Generate 1 token and the owner have to stay connected to the app for clients to use data generated by the user through Spotify API and shared by websocket. Clients requests are handled by the server.

Pros:
- clients won't store/use any of the owner's tokens
- less requests to the Spotify API (clients fetching current playback state), trade HTTP and Spotify API load to WS load
- I could use what I've done with [my Deezer to Spotify CLI script](https://github.com/Snoupix/DtS) to implement the Spotify API token management

Cons:
- server will have to implement the use of the Spotify API too
- inconvenient for the owner since s.he has to stay connected to the app to spread his.her (current playback) data
- server will have a whole lot of requests to handle and to send back to clients for each clients in every room
- track search can't be implemented client-side, but the server could use the owners token and the search would be handled by the server... 

> Same as above but the server handles the data update too instead of the owner

Pros:
- owner wouldn't have to stay connected to the app and handle data updates
- so, less websocket load (client -> server)

Con:
- a lot more server requests to Spotify API for data updates (trading WS load for HTTP load) server side

----

Finally, I chose to generate 1 token for the owner and use it server-side for clients requests. It's a good idea to note that I can still make the owner requests server-side trading money (make it a paid service) for the user convenience.

Server-side, I can estimate a room latency for clients requests and deny some of them if there are too many of them (e.g. "search" and "add to queue" requests) since these requests can be delayed or done by themselves (they can search on their Spotify client the Spotify URI of a track to add it).

## Ideas for the app

- Work with Twitch/Youtube streamers to make it available for them and their community -> the room owner can turn a client into a moderator. (Maybe make a twitch bot available for them to communicate easily instead of using the webapp ?)
- Release the web app on Beta then make a Report page for any bug report or issue encountered
- Find an idea to monetize the app to make it a stable SaaS
