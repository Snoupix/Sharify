# Sharify by Snoupix

Sharify is a Remix web app project that resolves the following problem: let's say you're at a party and someone you don't know manages the music with **Spotify**. You would like to put a particular song but you can't control his phone. Here comes Sharify. It's an app where you link your Spotify account to create a "room" with a password where people can join and add a song to your current playlist queue. So everyone with the app and the room's password can add songs to listen to!

### EDIT

Spotify recently released [Spotify Jam](https://support.spotify.com/us/article/jam/) which is an equivalent of my app but since I wanted to add features for streamers like moderation stuff, a twitch bot, a Deezer/Youtube link.. This project will still be continued.

## Current features

- The room owner can see, kick or ban people from their room. They can see and control the current playing song (play, pause, next, previous, volume) and add a song to the current queue with a search bar that retrieves Spotify songs. They also can see the 5 next and 5 previous tracks.
- The room client can see the current playing song, use the same search bar and add to the current queue. They can see the same next and previous tracks.

## Technical details

This web app uses:

- [Remix](https://remix.run/) (so, React)
- [Typescript](https://www.typescriptlang.org/)
- [Cypress](https://www.cypress.io/) (for End-to-End testing)
- [Tailwind](https://tailwindcss.com/)
- [Spotify API](https://developer.spotify.com/documentation/web-api/) but with [this package](https://www.npmjs.com/package/spotify-web-api-node)

## Potential ideas for the app

- Work with Twitch/Youtube streamers to make it available for them and their community -> the room owner can turn a client into a moderator. (Maybe make a twitch bot available for them to communicate easily)
- Release the web app on Beta then make a Report page for any bug report or issue encountered
