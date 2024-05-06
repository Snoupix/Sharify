export interface Party {
    id:                 number
    name:               string
    clients:            Array<PartyClient>
    bannedClients:      Array<PartyClient['username']>
    isPrivate:          boolean
    password:           string | null
    type:               'Spotify'// | 'Youtube'
    spotifyCreds: {
        accessToken:    string
        refreshToken:   string
        expiresIn:      number
        date:           number
    }
    currentDevice:      SpotifyApi.UserDevice | null
    tracksQueue:        Array<PartyTrack>
    MAX_CLIENTS:        number
}

type PartyTrack = {
    username:   PartyClient['username']
    trackId:    string
    trackName:  string
}

interface PartyClient {
    username:   string
    isHost:     boolean
}

export interface GetPartyReturnType {
    message:    string | 'NOT_ACTIVE' | 'USER_CHANGED' | 'ERROR'
    found?:     true | undefined
    partyData?: Party | undefined
}


//                                              /$$$$$$  /$$$$$$$  /$$$$$$
//                                             /$$__  $$| $$__  $$|_  $$_/
//                                            | $$  \ $$| $$  \ $$  | $$  
//                                            | $$$$$$$$| $$$$$$$/  | $$  
//                                            | $$__  $$| $$____/   | $$  
//                                            | $$  | $$| $$        | $$  
//                                            | $$  | $$| $$       /$$$$$$
//                                            |__/  |__/|__/      |______/


export default class SharifyAPI {
    private static MAX_CLIENTS = 15;
    private ACTIVE_PARTIES: Map<number, Party>;
    private USERS: Set<string>;
    private INDEX = 1;
    private DEBUG_MODE = true;
  
    constructor() {
        this.ACTIVE_PARTIES = new Map<number, Party>();
        this.USERS = new Set<string>();
    }
  
    CreateParty(
        clients:        Party['clients'],
        name:           Party['name'],
        isPrivate:      Party['isPrivate'],
        type:           Party['type'],
        spotifyCreds:   Party['spotifyCreds'],
        password?:      Party['password'],
    ): Party | PartyError {
        this.ACTIVE_PARTIES.set(this.INDEX, {
            id: this.INDEX,
            clients,
            bannedClients: [],
            name,
            isPrivate,
            password: password != undefined ? password : null,
            type,
            spotifyCreds,
            currentDevice: null,
            tracksQueue: [],
            MAX_CLIENTS: SharifyAPI.MAX_CLIENTS,
        });
  
        this.LogDebug(`[${this.INDEX}]${isPrivate ? 'Private party' : 'Party'} '${name}' created.`);
        
        this.INDEX ++;

        const party = this.ACTIVE_PARTIES.get(this.INDEX - 1);
        
        if (!party) {
            console.error(`Cannot create party (${party}) clients ${clients}, name ${name}, isprivate ${isPrivate}, type ${type}, password ${password}`);
            return new PartyError(`An error has occured while creating this party, please, contact Snoupix`);
        }

        this.USERS.add(party.clients[0].username);

        return party;
    }
  
    DeleteParty(id: Party['id'], username: string) {
        const party = this.ACTIVE_PARTIES.get(id);

        if (!party) return this.LogDebug(`${username} tried to delete a non-existing party ${id}`);

        if (party.clients.find(client => client.isHost == true)?.username != username) {
            this.LogDebug(`${username} tried to delete party id ${id} while not being the host`);
        }

        this.LogDebug(`${username} is deleting '${party.name}' party ${id}`);

        party.clients.map(client => this.USERS.delete(client.username));
    
        this.ACTIVE_PARTIES.delete(id);
    }
  
    GetParty(id: Party['id']): Party | null {
        const party = this.ACTIVE_PARTIES.get(id);
        
        if (!party) {
            this.LogDebug(`Cannot find party id: ${id}`);
            return null;
        }

        return party;
    }

    GetUserParty(username: string): Party | null {
        let party: Party | null = null;

        this.ACTIVE_PARTIES.forEach(p => {
            p.clients.forEach(client => {
                if (client.username == username) {
                    party = p;
                    return;
                }
            })
        })

        return party;
    }

    GetParties(privateFilter: boolean) {
        const returning = new Array<Party>();

        if (!privateFilter) {
            this.ACTIVE_PARTIES.forEach(party => returning.push(party));

            this.LogDebug(`Returning every parties to the client (${returning.length})`);

            return returning;
        }

        this.ACTIVE_PARTIES.forEach(party => {
            if (!party.isPrivate) {
                returning.push(party);
            }
        })

        this.LogDebug(`Returning ${returning.length} private parties to the client`);

        return returning;
    }

    AddToTracksQueue(
        id: Party['id'],
        username: PartyClient['username'],
        trackId: PartyTrack['trackId'],
        trackName: PartyTrack['trackName']
    ) {
        const party = this.ACTIVE_PARTIES.get(id);
        
        if (!party) {
            this.LogDebug(`Cannot find party id: ${id}`);
            return;
        }

        party.tracksQueue.push({ trackId, username, trackName });

        this.ACTIVE_PARTIES.set(id, party);

        this.LogDebug(`${username} added ${trackName} to party ${party.name} ${id}`);
    }

    RemoveFromTracksQueue(id: Party['id'], trackNAME: PartyTrack['trackName']) {
        const party = this.ACTIVE_PARTIES.get(id);
        
        if (!party) {
            this.LogDebug(`Cannot find party id: ${id}`);
            return;
        }

        const trackFound = party.tracksQueue.find(({ trackName }) => trackName == trackNAME);

        if (trackFound) {
            let avoidDuplicate = false;
            const newQueue: Party['tracksQueue'] = [];

            party.tracksQueue.forEach(t => {
                if (avoidDuplicate) return newQueue.push(t);

                if (t.trackName == trackFound.trackName) {
                    avoidDuplicate = true;
                    return;
                }

                newQueue.push(t);
            })

            party.tracksQueue = newQueue;
    
            this.ACTIVE_PARTIES.set(id, party);
    
            this.LogDebug(`Removed ${trackNAME} from party ${party.name} ${id}`);
        }
    }

    KickUser(id: Party['id'], username: string) {
        const party = this.ACTIVE_PARTIES.get(id);
        
        if (!party) {
            this.LogDebug(`Cannot find party id: ${id}`);
            return;
        }

        const clients = party.clients.filter(client => client.username != username);

        party.clients = clients;

        this.ACTIVE_PARTIES.set(id, party);

        this.USERS.delete(username);

        this.LogDebug(`Kicked ${username} from party ${party.name} ${id}`);
    }

    BanUser(id: Party['id'], username: string) {
        const party = this.ACTIVE_PARTIES.get(id);
        
        if (!party) {
            this.LogDebug(`Cannot find party id: ${id}`);
            return;
        }

        this.KickUser(id, username);

        party.bannedClients.push(username);

        this.ACTIVE_PARTIES.set(id, party);

        this.LogDebug(`Banned ${username} from party ${party.name} ${id}`);
    }

    JoinParty(id: Party['id'], username: string) {
        const party = this.ACTIVE_PARTIES.get(id);
        
        if (!party) {
            this.LogDebug(`Cannot find party id: ${id}`);
            return;
        }

        if (party.clients.length + 1 > SharifyAPI.MAX_CLIENTS) {
            return new PartyError(`[Party full] Max clients exceeded: ${SharifyAPI.MAX_CLIENTS}`);
        }

        if (this.UsernameExists(username)) {
            return new PartyError(`Error: username "${username}" is already in use`);
        }

        party.clients.push({ isHost: false, username });

        this.ACTIVE_PARTIES.set(id, party);
        this.USERS.add(username);

        this.LogDebug(`Added ${username} to party ${party.name} ${id}`);
    }

    LeaveParty(id: Party['id'], username: string) {
        const party = this.ACTIVE_PARTIES.get(id);
        
        if (!party) {
            this.LogDebug(`Cannot find party id: ${id}`);
            return;
        }

        party.clients = party.clients.filter(client => client.username != username);

        this.ACTIVE_PARTIES.set(id, party);
        this.USERS.delete(username);

        this.LogDebug(`Removed ${username} from party ${party.name} ${id}`);
    }

    RemoveFromParty(username: PartyClient['username']) {
        if (this.UsernameExists(username)) {
            this.ACTIVE_PARTIES.forEach((party, i) => {
                const client = party.clients.find(client => client.username == username);

                if (client) {
                    if (client.isHost) {
                        this.DeleteParty(i, username);
                    } else {
                        this.LeaveParty(i, username);
                    }

                    this.LogDebug(`${username} is deleting party ${i} by leaving`);

                    return;
                }
            })
        }
    }

    UsernameExists(username: string): boolean {
        return this.USERS.has(username);
    }

    LogDebug(...args: any[]) {
        if (this.DEBUG_MODE) {
            console.log(...args);
        }
    }
}

export class PartyError extends Error {}
