# Sharify by Snoupix

Sharify is a Remix web app project that resolves the following problem: let's say you're at a party and someone you don't know manages the music with **Spotify**. You would like to put a particular song but you can't control his phone. Here comes Sharify. It's an app where you link your Spotify account to create a "room" with a password where people can join and add a song to your current playlist queue. So everyone with the app and the room's password can add songs to listen to!

At the moment, there are some features that allows the room's owner to kick or ban people from their room.

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
