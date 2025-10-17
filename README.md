# Sharify by Snoupix

**Sharify** is a **Sveltekit** web app (with a [public API](https://github.com/Snoupix/sharify-be)) project that resolves the following problem: let's say you're <at a party | watching a stream | in a musical work environment...> and someone you don't know manages the music with **Spotify**. You would like to listen to a particular song but you can't control his/her **Spotify account**. Here comes **Sharify**.

It's an app where you link your Spotify account to create a *"Room"* with a generated password so people can join your Room (without having to connect to Spotify), search and add songs to your current playlist queue. So everyone with the app and the Room's password can add songs to listen to! There are other features like Role/Member Management, Role Privileges and more to come.

### Facing reality

This project of mine has been dead and alive since 2019. It went through a few rewrites: from Remix and React to Sveltekit to Sveltekit and a Private API using GraphQL and Actor based Websocket to the current Public API using Actorless Websocket and Protobuf.

Since then, Spotify released two *features* that are basically restraining my fun and ambitions.

- september 2023: Spotify releases [Jam](https://newsroom.spotify.com/2023-09-26/spotify-jam-personalized-collaborative-listening-session-free-premium-users/) ([docs](https://support.spotify.com/us/article/jam/)).
  - This pretty much is the equivalent of Sharify with less features but integrated in the Official Spotify app and only Premium users can start a Jam.
- april 2025: Spotify removes the possibility to extend quota usage/access to their Web API for individual users ([link](https://developer.spotify.com/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access)).
  - Because of that, since I do not own a company, Sharify will be a self-hosting product (deployement in WIP on the [backend](https://github.com/Snoupix/sharify-be)) because the default limitations for their Web API access is 25 users and that means that only the 25 registered users are gonna be able to create a Room.

## Features

*As a user, I can:*

- Login using SSO
- Create a room by linking my Spotify account
- Copy the room link for the guests
- Manage users, roles and their permissions (`can_use_controls`, `can_manage_users`, `can_add_song`, `can_add_moderator`, `can_manage_room`)
- Join a room with its ID and password or direct link
- See the currently playing track and the player' state (playing/pause/next & previous tracks and who added them)
- See other Room members and their role
- Manage the current playback (play/pause/next/previous/volume)
- Search for a track to add to the owner's queue
- Add a track to the owner's queue from a Spotify track ID / Spotify link or integrated track search
- Bug/Feedback report page that uses a Discord webhook to aggregate messages on a text channel

## Deployment

This feature will be documented on the [Sharify backend](https://github.com/Snoupix/sharify-be) ASAP.

----

*Feel free to create an issue and PRs are welcome !*
