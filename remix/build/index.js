var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf, __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
}, __copyProps = (to, from, except, desc) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: !0 }) : target,
  mod
)), __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: !0 }), mod);

// <stdin>
var stdin_exports = {};
__export(stdin_exports, {
  assets: () => assets_manifest_default,
  assetsBuildDirectory: () => assetsBuildDirectory,
  entry: () => entry,
  future: () => future,
  publicPath: () => publicPath,
  routes: () => routes
});
module.exports = __toCommonJS(stdin_exports);

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => handleRequest
});
var import_stream = require("stream"), import_node = require("@remix-run/node"), import_react = require("@remix-run/react"), import_isbot = __toESM(require("isbot")), import_server = require("react-dom/server"), import_jsx_dev_runtime = require("react/jsx-dev-runtime"), ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return (0, import_isbot.default)(request.headers.get("user-agent")) ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let didError = !1, { pipe, abort } = (0, import_server.renderToPipeableStream)(
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_react.RemixServer, { context: remixContext, url: request.url }, void 0, !1, {
        fileName: "app/entry.server.tsx",
        lineNumber: 41,
        columnNumber: 7
      }, this),
      {
        onAllReady() {
          let body = new import_stream.PassThrough();
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new import_node.Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          didError = !0, console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let didError = !1, { pipe, abort } = (0, import_server.renderToPipeableStream)(
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_react.RemixServer, { context: remixContext, url: request.url }, void 0, !1, {
        fileName: "app/entry.server.tsx",
        lineNumber: 82,
        columnNumber: 7
      }, this),
      {
        onShellReady() {
          let body = new import_stream.PassThrough();
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new import_node.Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(err) {
          reject(err);
        },
        onError(error) {
          didError = !0, console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}

// app/root.tsx
var root_exports = {};
__export(root_exports, {
  ErrorBoundary: () => ErrorBoundary,
  action: () => action,
  default: () => App,
  links: () => links,
  loader: () => loader,
  meta: () => meta
});
var import_react3 = require("react"), import_websocket = require("websocket"), import_react_toastify = require("react-toastify"), import_node3 = require("@remix-run/node"), import_v1_meta = require("@remix-run/v1-meta"), import_framer_motion = require("framer-motion"), import_react4 = require("@remix-run/react");

// app/compiled.css
var compiled_default = "/build/_assets/compiled-W7H6T5YA.css";

// node_modules/.pnpm/react-toastify@9.1.3_react-dom@18.2.0_react@18.2.0/node_modules/react-toastify/dist/ReactToastify.min.css
var ReactToastify_min_default = "/build/_assets/ReactToastify.min-SK2FHDYC.css";

// app/utils/spotify.ts
var import_web_api_ts_sdk = require("@spotify/web-api-ts-sdk");

// app/utils/utils.tsx
var import_react2 = require("react"), SetStorageValue = (value) => {
  if (!localStorage || !window.localStorage)
    throw new Error("Cannot access localStorage nor window.localStorage");
  let store = localStorage ?? window.localStorage, storage2 = store.getItem("Sharify");
  if (storage2 == null) {
    store.setItem("Sharify", JSON.stringify(value));
    return;
  }
  let parsed_storage = JSON.parse(storage2);
  store.setItem("Sharify", JSON.stringify({ ...parsed_storage, ...value }));
};
function GetStorageValue(value) {
  if (!localStorage || !window.localStorage)
    return {};
  let store = localStorage ?? window.localStorage, returns = JSON.parse(store.getItem("Sharify") || "{}")[value];
  return returns == {} ? null : returns;
}
function useDebounce(value, delay = 500) {
  let [debouncedValue, setDebouncedValue] = (0, import_react2.useState)(value);
  return (0, import_react2.useEffect)(() => {
    let handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]), debouncedValue;
}
function FormatTime(progress, duration) {
  let [p, m] = [new Date(progress), new Date(duration)], FormatNumber = (int) => int.toString().padStart(2, "0");
  return `${FormatNumber(p.getMinutes())}:${FormatNumber(p.getSeconds())} / ${FormatNumber(m.getMinutes())}:${FormatNumber(m.getSeconds())}`;
}

// app/utils/spotify.ts
var tokens_default = {
  access_token: "",
  refresh_token: "",
  expires_in: 0,
  created_at: 0
}, _SpotifyHandler = class {
  constructor(client_id) {
    this.sdk = null;
    this.tokens = tokens_default;
    this.client_id = "";
    this.redirectURI = "http://localhost:3000/auth_spotify";
    this.scopes = "user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private";
    this.timeout = null;
    this.code_verifier = "";
    this.code_challenge = "";
    this.is_owner = !0;
    this.is_ready = !1;
    if (client_id == "")
      throw new Error("No client id provided");
    this.client_id = client_id;
  }
  InitSdk() {
    this.sdk = import_web_api_ts_sdk.SpotifyApi.withAccessToken(this.client_id, {
      ...this.tokens,
      token_type: "code"
    }, { afterRequest: this.HandleRequests });
  }
  async GenerateAuthLink() {
    try {
      let res = await fetch(`${_SpotifyHandler.BACK_API}/code_verifier`, { method: "GET" });
      this.code_verifier = await res.text(), SetStorageValue({ code_verifier: this.code_verifier }), res = await fetch(`${_SpotifyHandler.BACK_API}/code_challenge/${this.code_verifier}`, { method: "GET" }), this.code_challenge = await res.text();
      let url = new URL("https://accounts.spotify.com/authorize");
      return url.search = new URLSearchParams({
        client_id: this.client_id,
        response_type: "code",
        redirect_uri: encodeURI(this.redirectURI),
        show_dialog: "true",
        scope: this.scopes,
        code_challenge_method: "S256",
        code_challenge: this.code_challenge
      }).toString(), url.toString();
    } catch (error) {
      return console.error(error), new Error(error);
    }
  }
  /**
  * Can throw Error on failed request, bad status code or empty body
  */
  async CallAuthorizationAPI(body) {
    try {
      let res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body
      });
      if (res.status != 200) {
        let error = new Error(`[CallAuthorizationAPI ${res.status}] Error: ${res.statusText} Response text: ${await res.text()}; Body supplied: ${body}`);
        throw console.error(error), error;
      }
      let json6 = await res.json();
      if (!json6 || !json6.access_token)
        throw console.error(res), new Error(`[CallAuthorizationAPI] Error: empty body. Response json: ${json6}; Body supplied: ${body}`);
      this.ProcessTokens(json6);
    } catch (error) {
      console.error(error);
    }
  }
  ProcessTokens(data) {
    this.timeout && clearTimeout(this.timeout), this.tokens = { ...tokens_default, ...data }, this.tokens.created_at = data.created_at ?? Date.now();
    let expires_in = this.tokens.expires_in && this.tokens.expires_in > 0 ? this.tokens.expires_in * 1e3 : 1e3 * 60 * 60, msDiff = this.tokens.created_at + expires_in - Date.now();
    if (msDiff <= 0)
      return this.RefreshAccessToken();
    this.timeout = setTimeout(
      this.RefreshAccessToken,
      msDiff
    ), this.TokenFetchingEnded();
  }
  FetchAccessToken(code) {
    let code_verifier = GetStorageValue("code_verifier");
    if (code_verifier == null)
      throw new Error("No code verifier on local storage");
    let params = new URLSearchParams({
      client_id: this.client_id,
      grant_type: "authorization_code",
      code,
      redirect_uri: encodeURI(this.redirectURI),
      code_verifier
    });
    this.CallAuthorizationAPI(params);
  }
  RefreshAccessToken() {
    let params = new URLSearchParams({
      client_id: this.client_id,
      grant_type: "refresh_token",
      refresh_token: this.tokens.refresh_token
    });
    this.CallAuthorizationAPI(params);
  }
  async TokenFetchingEnded() {
    SetStorageValue({
      st: {
        at: this.tokens.access_token,
        rt: this.tokens.refresh_token,
        ein: this.tokens.expires_in,
        date: this.tokens.created_at
      }
    });
    let deviceName = GetStorageValue("SpotifyDevice");
    try {
      let { devices } = await this.sdk.player.getAvailableDevices();
      this.current_device = deviceName ? devices.find((device) => device.name == deviceName) : devices.find((device) => device.is_active), this.current_device && SetStorageValue({ SpotifyDevice: JSON.stringify(this.current_device) });
    } catch (error) {
      console.error(error);
      return;
    }
    this.InitSdk(), this.is_ready = !0;
  }
  LinkToURI(link) {
    var _a;
    return `spotify:track:${link.split("/").pop()}`.split("?").length > 1 ? `spotify:track:${(_a = link.split("/").pop()) == null ? void 0 : _a.split("?").shift()}` : `spotify:track:${link.split("/").pop()}`;
  }
  GetTokens() {
    return this.tokens;
  }
  SetTokens() {
    let tokens = GetStorageValue("st");
    if (tokens == null)
      throw new Error("No Spotify tokens on local storage");
    this.ProcessTokens({
      access_token: tokens.at,
      refresh_token: tokens.rt,
      expires_in: tokens.ein,
      created_at: tokens.date
    });
  }
  EnsureInitialized() {
    this.is_ready || this.SetTokens();
  }
  ExceededQota(request) {
    return request.status == 429;
  }
  HandleRequests(_url, _options, response) {
    if (this.ExceededQota(response))
      throw new Error("Spotify API Quota excedeed, be patient");
  }
  Disconnect() {
    this.is_ready = !1, this.tokens = tokens_default, SetStorageValue({ st: null });
  }
  Pause() {
    return this.EnsureInitialized(), new Promise(async (resolve, reject) => {
      var _a;
      try {
        await this.sdk.player.pausePlayback(((_a = this.current_device) == null ? void 0 : _a.id) ?? ""), resolve(this);
      } catch (error) {
        reject(new Error(`There was an error pausing track. (${error})`));
      }
    });
  }
  Resume() {
    return this.EnsureInitialized(), new Promise(async (resolve, reject) => {
      var _a;
      try {
        await this.sdk.player.startResumePlayback(((_a = this.current_device) == null ? void 0 : _a.id) ?? ""), resolve(this);
      } catch (error) {
        reject(new Error(`There was an error resuming track. (${error})`));
      }
    });
  }
  AddNextTrack(link) {
    return this.EnsureInitialized(), new Promise(async (resolve, reject) => {
      var _a;
      try {
        await this.sdk.player.addItemToPlaybackQueue(this.LinkToURI(link), ((_a = this.current_device) == null ? void 0 : _a.id) ?? ""), resolve();
      } catch (error) {
        reject(new Error(`There was an error adding track to the queue. (${error})`));
      }
    });
  }
  SkipToPrevious() {
    return this.EnsureInitialized(), new Promise(async (resolve, reject) => {
      var _a;
      try {
        await this.sdk.player.skipToPrevious(((_a = this.current_device) == null ? void 0 : _a.id) ?? ""), resolve(this);
      } catch (error) {
        reject(new Error(`There was an error skiping to previous track. (${error})`));
      }
    });
  }
  SkipToNext() {
    return this.EnsureInitialized(), new Promise(async (resolve, reject) => {
      var _a;
      try {
        await this.sdk.player.skipToNext(((_a = this.current_device) == null ? void 0 : _a.id) ?? ""), resolve(this);
      } catch (error) {
        reject(new Error(`There was an error skiping to next track. (${error})`));
      }
    });
  }
  GetRecentlyPlayedTracks(limit) {
    return this.EnsureInitialized(), new Promise(async (resolve, reject) => {
      try {
        let { items } = await this.sdk.player.getRecentlyPlayedTracks(limit);
        resolve(items);
      } catch (error) {
        reject(new Error(`There was an error showing the ${limit} recently played tracks. (${error})`));
      }
    });
  }
  SetVolume(value) {
    return this.EnsureInitialized(), new Promise(async (resolve, reject) => {
      var _a;
      try {
        await this.sdk.player.setPlaybackVolume(value, ((_a = this.current_device) == null ? void 0 : _a.id) ?? ""), resolve();
      } catch (error) {
        reject(new Error(`There was an error setting volume to ${value}. (${error})`));
      }
    });
  }
  GetCurrentTrackData() {
    return this.EnsureInitialized(), new Promise(async (resolve, reject) => {
      try {
        let state = await this.sdk.player.getPlaybackState();
        resolve(state);
      } catch (error) {
        reject(new Error(`There was an error getting current playback response (${error})`));
      }
    });
  }
  SearchTracks(input) {
    return this.EnsureInitialized(), new Promise(async (resolve, reject) => {
      try {
        let res = await this.sdk.search(input, ["tracks"], void 0, 10);
        resolve(res);
      } catch (error) {
        reject(new Error(`There was an error searching for tracks with ${input} (${error})`));
      }
    });
  }
  GetDevices() {
    return this.EnsureInitialized(), new Promise(async (resolve, reject) => {
      try {
        let { devices } = await this.sdk.player.getAvailableDevices();
        resolve(devices);
      } catch (error) {
        reject(new Error(`There was an error searching for devices (${error})`));
      }
    });
  }
  Seek(position) {
    return this.EnsureInitialized(), new Promise(async (resolve, reject) => {
      var _a;
      try {
        await this.sdk.player.seekToPosition(position, ((_a = this.current_device) == null ? void 0 : _a.id) ?? ""), resolve();
      } catch (error) {
        reject(new Error(`There was an error seeking to ${position} (${error})`));
      }
    });
  }
  GetProfile() {
    return this.is_owner ? (this.EnsureInitialized(), new Promise(async (resolve, reject) => {
      try {
        let profile = await this.sdk.currentUser.profile();
        resolve(profile);
      } catch (error) {
        reject(new Error(`There was an error getting profile (${error})`));
      }
    })) : (this.Disconnect(), new Promise((_, reject) => reject(new Error())));
  }
  GetCurrentQueueData() {
    return this.EnsureInitialized(), new Promise(async (resolve, reject) => {
      try {
        let queue = await this.sdk.player.getUsersQueue();
        resolve(queue);
      } catch (error) {
        reject(new Error(`There was an error getting current queue data (${error})`));
      }
    });
  }
  SetDevice(device) {
    this.current_device = device;
  }
}, SpotifyHandler = _SpotifyHandler;
SpotifyHandler.BACK_API = "http://localhost:3100/sharify";

// app/server/session.server.ts
var import_dotenv = __toESM(require("dotenv")), import_node2 = require("@remix-run/node");
import_dotenv.default.config();
var sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret)
  throw new Error("SESSION_SECRET must be set");
var storage = (0, import_node2.createCookieSessionStorage)({
  cookie: {
    name: "Sharify_session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: !1,
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: !0
  }
});
function getUserSession(request) {
  return storage.getSession(request.headers.get("Cookie"));
}
async function getSessionData(request, property) {
  let data = (await getUserSession(request)).get(property);
  return !data || typeof data != "string" ? null : data;
}
async function setSessionData(request, property, data, redirectTo) {
  let session = await getUserSession(request);
  return session.set(property, data), (0, import_node2.redirect)(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session)
    }
  });
}
async function unsetSessionData(request, property, redirectTo) {
  let session = await getUserSession(request);
  return session.unset(property), (0, import_node2.redirect)(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session)
    }
  });
}

// app/server/api.server.ts
var _SharifyAPI = class {
  constructor() {
    this.INDEX = 1;
    this.DEBUG_MODE = !0;
    this.ACTIVE_PARTIES = /* @__PURE__ */ new Map(), this.USERS = /* @__PURE__ */ new Set();
  }
  CreateParty(clients, name, isPrivate, type, spotifyCreds, password) {
    this.ACTIVE_PARTIES.set(this.INDEX, {
      id: this.INDEX,
      clients,
      bannedClients: [],
      name,
      isPrivate,
      password: password ?? null,
      type,
      spotifyCreds,
      currentDevice: null,
      tracksQueue: [],
      MAX_CLIENTS: _SharifyAPI.MAX_CLIENTS
    }), this.LogDebug(`[${this.INDEX}]${isPrivate ? "Private party" : "Party"} '${name}' created.`), this.INDEX++;
    let party = this.ACTIVE_PARTIES.get(this.INDEX - 1);
    return party ? (this.USERS.add(party.clients[0].username), party) : (console.error(`Cannot create party (${party}) clients ${clients}, name ${name}, isprivate ${isPrivate}, type ${type}, password ${password}`), new PartyError("An error has occured while creating this party, please, contact Snoupix"));
  }
  DeleteParty(id, username) {
    var _a;
    let party = this.ACTIVE_PARTIES.get(id);
    if (!party)
      return this.LogDebug(`${username} tried to delete a non-existing party ${id}`);
    ((_a = party.clients.find((client) => client.isHost == !0)) == null ? void 0 : _a.username) != username && this.LogDebug(`${username} tried to delete party id ${id} while not being the host`), this.LogDebug(`${username} is deleting '${party.name}' party ${id}`), party.clients.map((client) => this.USERS.delete(client.username)), this.ACTIVE_PARTIES.delete(id);
  }
  GetParty(id) {
    let party = this.ACTIVE_PARTIES.get(id);
    return party || (this.LogDebug(`Cannot find party id: ${id}`), null);
  }
  GetUserParty(username) {
    let party = null;
    return this.ACTIVE_PARTIES.forEach((p) => {
      p.clients.forEach((client) => {
        if (client.username == username) {
          party = p;
          return;
        }
      });
    }), party;
  }
  GetParties(privateFilter) {
    let returning = new Array();
    return privateFilter ? (this.ACTIVE_PARTIES.forEach((party) => {
      party.isPrivate || returning.push(party);
    }), this.LogDebug(`Returning ${returning.length} private parties to the client`), returning) : (this.ACTIVE_PARTIES.forEach((party) => returning.push(party)), this.LogDebug(`Returning every parties to the client (${returning.length})`), returning);
  }
  AddToTracksQueue(id, username, trackId, trackName) {
    let party = this.ACTIVE_PARTIES.get(id);
    if (!party) {
      this.LogDebug(`Cannot find party id: ${id}`);
      return;
    }
    party.tracksQueue.push({ trackId, username, trackName }), this.ACTIVE_PARTIES.set(id, party), this.LogDebug(`${username} added ${trackName} to party ${party.name} ${id}`);
  }
  RemoveFromTracksQueue(id, trackNAME) {
    let party = this.ACTIVE_PARTIES.get(id);
    if (!party) {
      this.LogDebug(`Cannot find party id: ${id}`);
      return;
    }
    let trackFound = party.tracksQueue.find(({ trackName }) => trackName == trackNAME);
    if (trackFound) {
      let avoidDuplicate = !1, newQueue = [];
      party.tracksQueue.forEach((t) => {
        if (avoidDuplicate)
          return newQueue.push(t);
        if (t.trackName == trackFound.trackName) {
          avoidDuplicate = !0;
          return;
        }
        newQueue.push(t);
      }), party.tracksQueue = newQueue, this.ACTIVE_PARTIES.set(id, party), this.LogDebug(`Removed ${trackNAME} from party ${party.name} ${id}`);
    }
  }
  KickUser(id, username) {
    let party = this.ACTIVE_PARTIES.get(id);
    if (!party) {
      this.LogDebug(`Cannot find party id: ${id}`);
      return;
    }
    let clients = party.clients.filter((client) => client.username != username);
    party.clients = clients, this.ACTIVE_PARTIES.set(id, party), this.USERS.delete(username), this.LogDebug(`Kicked ${username} from party ${party.name} ${id}`);
  }
  BanUser(id, username) {
    let party = this.ACTIVE_PARTIES.get(id);
    if (!party) {
      this.LogDebug(`Cannot find party id: ${id}`);
      return;
    }
    this.KickUser(id, username), party.bannedClients.push(username), this.ACTIVE_PARTIES.set(id, party), this.LogDebug(`Banned ${username} from party ${party.name} ${id}`);
  }
  JoinParty(id, username) {
    let party = this.ACTIVE_PARTIES.get(id);
    if (!party) {
      this.LogDebug(`Cannot find party id: ${id}`);
      return;
    }
    if (party.clients.length + 1 > _SharifyAPI.MAX_CLIENTS)
      return new PartyError(`[Party full] Max clients exceeded: ${_SharifyAPI.MAX_CLIENTS}`);
    if (this.UsernameExists(username))
      return new PartyError(`Error: username "${username}" is already in use`);
    party.clients.push({ isHost: !1, username }), this.ACTIVE_PARTIES.set(id, party), this.USERS.add(username), this.LogDebug(`Added ${username} to party ${party.name} ${id}`);
  }
  LeaveParty(id, username) {
    let party = this.ACTIVE_PARTIES.get(id);
    if (!party) {
      this.LogDebug(`Cannot find party id: ${id}`);
      return;
    }
    party.clients = party.clients.filter((client) => client.username != username), this.ACTIVE_PARTIES.set(id, party), this.USERS.delete(username), this.LogDebug(`Removed ${username} from party ${party.name} ${id}`);
  }
  RemoveFromParty(username) {
    this.UsernameExists(username) && this.ACTIVE_PARTIES.forEach((party, i) => {
      let client = party.clients.find((client2) => client2.username == username);
      if (client) {
        client.isHost ? this.DeleteParty(i, username) : this.LeaveParty(i, username), this.LogDebug(`${username} is deleting party ${i} by leaving`);
        return;
      }
    });
  }
  UsernameExists(username) {
    return this.USERS.has(username);
  }
  LogDebug(...args) {
    this.DEBUG_MODE && console.log(...args);
  }
}, SharifyAPI = _SharifyAPI;
SharifyAPI.MAX_CLIENTS = 15;
var PartyError = class extends Error {
};

// app/server/handlers.server.ts
var api;
global.__api || (global.__api = new SharifyAPI()), api = global.__api;

// app/root.tsx
var import_jsx_dev_runtime2 = require("react/jsx-dev-runtime"), links = () => [
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Kaushan+Script&family=Montserrat:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
  },
  {
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css"
  },
  {
    rel: "stylesheet",
    href: ReactToastify_min_default
  },
  {
    rel: "stylesheet",
    href: compiled_default
  }
], meta = (args) => (0, import_v1_meta.metaV1)(args, {
  charset: "utf-8",
  title: "Sharify",
  viewport: "width=device-width,initial-scale=1",
  keywords: "Sharify, Snoupix, Samuel Dewaele, Spotify, Share, Music, Party"
}), action = async ({ request }) => {
  let username = await getSessionData(request, "username");
  return username && api.RemoveFromParty(username), null;
}, loader = async ({ request }) => {
  let username = await getSessionData(request, "username");
  return (0, import_node3.json)({
    id: process.env.SPOTIFY_CLIENT_ID,
    username
  });
};
function Document({
  children
}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("html", { lang: "en", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("head", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react4.Meta, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 101,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("title", { children: "Sharify" }, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 102,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react4.Links, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 103,
        columnNumber: 5
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 100,
      columnNumber: 4
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("body", { className: "bg-bg-color overflow-x-hidden", children: [
      children,
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react4.ScrollRestoration, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 107,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react4.Scripts, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 108,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react4.LiveReload, {}, void 0, !1, {
        fileName: "app/root.tsx",
        lineNumber: 109,
        columnNumber: 5
      }, this)
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 105,
      columnNumber: 4
    }, this)
  ] }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 99,
    columnNumber: 5
  }, this);
}
function App() {
  let loaderData = (0, import_react4.useLoaderData)(), fetcher = (0, import_react4.useFetcher)(), { pathname } = (0, import_react4.useLocation)(), [contextData, setContextData] = (0, import_react3.useState)({
    toast: import_react_toastify.toast,
    username: loaderData.username || "",
    spotify: null,
    party_data: null,
    websocket_connected: !1
  }), [serverInterval, setServerInterval] = (0, import_react3.useState)(null), [isServerUp, setIsServerUp] = (0, import_react3.useState)(!1);
  (0, import_react3.useEffect)(() => {
    !loaderData.id || contextData.spotify || (console.log("init spotify"), setContextData((data) => ({ ...data, spotify: new SpotifyHandler(loaderData.id) })));
  }, [loaderData, contextData.spotify]);
  let initWS = () => {
    let ws = new import_websocket.w3cwebsocket("ws://127.0.0.1:3100/sharify_ws/1");
    ws.onmessage = (message) => {
      try {
        let data = JSON.parse(message.data.toString());
        console.log(data), contextData.party_data = data;
      } catch {
        console.log("websocket message (not JSON):", message);
      }
    }, ws.onopen = () => {
      console.log("connected"), contextData.websocket_connected = !0;
    }, ws.onclose = () => {
      console.log("disconnected"), contextData.websocket_connected = !1;
    }, ws.onerror = (error) => {
      console.error("websocket error:", error);
    };
  };
  (0, import_react3.useEffect)(() => (serverInterval && clearInterval(serverInterval), console.log("init interval"), setServerInterval(setInterval(async () => {
    try {
      (await fetch(SpotifyHandler.BACK_API.split("/").slice(0, 3).join("/"))).status == 200 && (console.log("good", serverInterval), setIsServerUp(!0), x(), initWS());
    } catch (error) {
      console.error("server not reachable", error);
    }
  }, 5e3)), () => {
    fetcher.submit(null, { method: "post" }), serverInterval && clearInterval(serverInterval);
  }), []);
  function x() {
    clearInterval(serverInterval), setTimeout(() => setServerInterval(null), 5e3);
  }
  return isServerUp ? /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Document, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_framer_motion.AnimatePresence, { mode: "wait", initial: !1, children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(
    import_framer_motion.motion.main,
    {
      className: "relative min-h-screen w-screen",
      initial: { translateY: "2.5%" },
      animate: { translateY: "0%" },
      exit: { translateY: "2.5%" },
      transition: { duration: 0.2 },
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react4.Outlet, { context: contextData }, void 0, !1, {
          fileName: "app/root.tsx",
          lineNumber: 221,
          columnNumber: 6
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react_toastify.ToastContainer, {}, void 0, !1, {
          fileName: "app/root.tsx",
          lineNumber: 222,
          columnNumber: 6
        }, this)
      ]
    },
    pathname,
    !0,
    {
      fileName: "app/root.tsx",
      lineNumber: 213,
      columnNumber: 5
    },
    this
  ) }, void 0, !1, {
    fileName: "app/root.tsx",
    lineNumber: 212,
    columnNumber: 4
  }, this) }, void 0, !1, {
    fileName: "app/root.tsx",
    lineNumber: 211,
    columnNumber: 5
  }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Document, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "error-container", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("h1", { children: "Server is unreachable/loading..." }, void 0, !1, {
    fileName: "app/root.tsx",
    lineNumber: 204,
    columnNumber: 21
  }, this) }, void 0, !1, {
    fileName: "app/root.tsx",
    lineNumber: 203,
    columnNumber: 17
  }, this) }, void 0, !1, {
    fileName: "app/root.tsx",
    lineNumber: 202,
    columnNumber: 7
  }, this);
}
function ErrorBoundary() {
  let error = (0, import_react4.useRouteError)();
  if ((0, import_react4.isRouteErrorResponse)(error))
    return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Document, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "error-container", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("h1", { children: [
      error.status,
      " ",
      error.statusText,
      " ",
      error.data
    ] }, void 0, !0, {
      fileName: "app/root.tsx",
      lineNumber: 236,
      columnNumber: 21
    }, this) }, void 0, !1, {
      fileName: "app/root.tsx",
      lineNumber: 235,
      columnNumber: 17
    }, this) }, void 0, !1, {
      fileName: "app/root.tsx",
      lineNumber: 234,
      columnNumber: 7
    }, this);
  let err = error;
  return console.error(error, err), /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Document, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "error-container", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("h1", { children: "App Error" }, void 0, !1, {
      fileName: "app/root.tsx",
      lineNumber: 250,
      columnNumber: 5
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("pre", { children: (err == null ? void 0 : err.message) ?? error }, void 0, !1, {
      fileName: "app/root.tsx",
      lineNumber: 251,
      columnNumber: 5
    }, this)
  ] }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 249,
    columnNumber: 4
  }, this) }, void 0, !1, {
    fileName: "app/root.tsx",
    lineNumber: 248,
    columnNumber: 5
  }, this);
}

// app/routes/auth_spotify.tsx
var auth_spotify_exports = {};
__export(auth_spotify_exports, {
  action: () => action2,
  default: () => Auth_Spotify,
  loader: () => loader2
});
var import_node4 = require("@remix-run/node"), import_react6 = require("react"), import_react7 = require("@remix-run/react");

// app/components/title.tsx
var import_react5 = require("@remix-run/react"), import_jsx_dev_runtime3 = require("react/jsx-dev-runtime");
function Title() {
  let location2 = (0, import_react5.useLocation)(), defaultStyle = "z-10 font-kaushan text-shadow font-bold text-2xl md:text-3xl xl:text-5xl", topLeftStyle = "z-10 font-kaushan text-shadow font-bold text-2xl md:text-3xl xl:text-5xl absolute top-0 left-0 p-8";
  return /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_react5.Link, { "data-cy": "home-btn", className: location2.pathname == "/" ? defaultStyle : topLeftStyle, to: "/", children: "Sharify" }, void 0, !1, {
    fileName: "app/components/title.tsx",
    lineNumber: 9,
    columnNumber: 12
  }, this);
}

// app/routes/auth_spotify.tsx
var import_jsx_dev_runtime4 = require("react/jsx-dev-runtime"), action2 = async ({
  request
}) => {
  let sTokens = (await request.formData()).get("spotifyTokens");
  return await setSessionData(request, "SpotifyTokens", sTokens, "/host");
}, loader2 = async ({
  request
}) => {
  let SpotifyTokens = await getSessionData(request, "SpotifyTokens");
  return SpotifyTokens ? (0, import_node4.json)({ SpotifyTokens: JSON.parse(SpotifyTokens) }) : null;
};
function Auth_Spotify() {
  let loaderData = (0, import_react7.useLoaderData)(), { spotify } = (0, import_react7.useOutletContext)(), submit = (0, import_react7.useSubmit)(), [text, setText] = (0, import_react6.useState)(""), [fetched, setFetched] = (0, import_react6.useState)(!1), [isReady, setIsReady] = (0, import_react6.useState)(!1);
  return (0, import_react6.useEffect)(() => {
    if (spotify == null)
      return;
    let interval = setInterval(() => {
      spotify.is_ready && (setIsReady(!0), clearInterval(interval));
    }, 5e3);
    return () => clearInterval(interval);
  }, [spotify]), (0, import_react6.useEffect)(() => {
    if (fetched || spotify == null)
      return;
    let params = new URLSearchParams(location.search), code = params.get("code"), error = params.get("error");
    if (code)
      return setFetched(!0), spotify.FetchAccessToken(code);
    if (error)
      return setFetched(!0), setText(`Error: ${error}`);
    if (loaderData && loaderData.SpotifyTokens) {
      let expires_in = (loaderData.SpotifyTokens.ein > 0 && loaderData.SpotifyTokens.ein <= 3600 ? loaderData.SpotifyTokens.ein : 3600) * 1e3;
      if (loaderData.SpotifyTokens.date + expires_in - Date.now() > 0)
        return setFetched(!0), spotify.ProcessTokens({
          access_token: loaderData.SpotifyTokens.sat,
          refresh_token: loaderData.SpotifyTokens.srt,
          expires_in: loaderData.SpotifyTokens.ein,
          created_at: loaderData.SpotifyTokens.date
        });
    }
    (async () => {
      let url = await spotify.GenerateAuthLink();
      if (url instanceof Error) {
        console.error(error), setText(`Error: ${error}`);
        return;
      }
      location.replace(url);
    })();
  }, [loaderData, fetched, spotify]), (0, import_react6.useEffect)(() => {
    isReady && (async () => {
      setFetched(!0);
      let profile = await spotify.GetProfile();
      profile instanceof Error || setText(`Successfully connected to ${profile.display_name}`);
      let tokens = spotify.GetTokens();
      setTimeout(() => {
        submit(
          {
            spotifyTokens: JSON.stringify({
              sat: tokens.accessToken,
              srt: tokens.refreshToken,
              ein: tokens.expires_in,
              date: tokens.date
            })
          },
          { method: "post" }
        );
      }, 1e3);
    })();
  }, [isReady, submit]), /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "flex flex-col items-center justify-center content-center h-screen text-main-color font-semibold", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(Title, {}, void 0, !1, {
      fileName: "app/routes/auth_spotify.tsx",
      lineNumber: 142,
      columnNumber: 13
    }, this),
    text != "" ? /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(import_react7.Link, { to: "/host", className: "text-4xl", "data-cy": "auth-text", children: text }, void 0, !1, {
      fileName: "app/routes/auth_spotify.tsx",
      lineNumber: 145,
      columnNumber: 17
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", { className: "loader" }, void 0, !1, {
      fileName: "app/routes/auth_spotify.tsx",
      lineNumber: 146,
      columnNumber: 17
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/auth_spotify.tsx",
    lineNumber: 141,
    columnNumber: 9
  }, this);
}

// app/routes/room.$roomID.tsx
var room_roomID_exports = {};
__export(room_roomID_exports, {
  Icon: () => Icon,
  action: () => action3,
  default: () => Room,
  loader: () => loader3
});
var import_react11 = require("react"), import_react12 = require("@remix-run/react"), import_react_toastify2 = require("react-toastify"), import_node5 = require("@remix-run/node");

// app/components/hostRoom.tsx
var import_react8 = require("react"), import_react9 = require("@remix-run/react");
var import_jsx_dev_runtime5 = require("react/jsx-dev-runtime");
function HostRoom(props) {
  let {
    fetcher,
    username,
    title,
    volume,
    setRoomData,
    isPlaying,
    durationMS,
    progressMS,
    FetchData,
    clients,
    recentTracks,
    tracksQueue,
    partyTracksQ,
    currentDevice,
    devices,
    searchResults,
    addTrackToQueue
  } = props, [showVolume, setShowVolume] = (0, import_react8.useState)(!1), tracksQElements = [];
  tracksQueue.forEach((track, i) => {
    let owner = partyTracksQ.find((trackOwner) => trackOwner.trackId == track.id);
    tracksQElements.push(track.type == "episode" ? null : /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "text-lg", children: /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("span", { children: `[${i + 1}]${owner ? ` (${owner.username})` : ""} ${track.name} - ${track.artists.map((a) => a.name).join(", ")}` }, void 0, !1, {
      fileName: "app/components/hostRoom.tsx",
      lineNumber: 58,
      columnNumber: 17
    }, this) }, i, !1, {
      fileName: "app/components/hostRoom.tsx",
      lineNumber: 57,
      columnNumber: 13
    }, this));
  });
  let handlePlay = () => {
    SpotifyHandler.Resume().then(() => FetchData(250)).catch(console.error);
  }, handlePause = () => {
    SpotifyHandler.Pause().then(() => FetchData(250)).catch(console.error);
  }, handleNext = () => {
    SpotifyHandler.SkipToNext().then(() => FetchData(500)).catch(console.error);
  }, handlePrevious = () => {
    if (durationMS - progressMS < durationMS / 2)
      return SpotifyHandler.Seek(0).then(() => FetchData(500)).catch(console.error);
    SpotifyHandler.SkipToPrevious().then(() => FetchData(500)).catch(console.error);
  }, handleSeek = (e) => {
    setRoomData({ seekPos: parseInt(e.target.value) }), FetchData(1e3);
  }, setSpotifyDevice = (device) => {
    SpotifyHandler.SetDevice(device), SetStorageValue({ SpotifyDevice: JSON.stringify(device) }), fetcher.submit(
      { type: "setSpotifyDevice", spotifyDevice: JSON.stringify(device) },
      { method: "post" }
    );
  };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_jsx_dev_runtime5.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("nav", { className: "absolute top-0 right-10 w-2/6 h-28 z-10 flex flex-row items-center justify-end content-center", children: /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react9.Form, { method: "post", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("input", { type: "hidden", name: "username", value: username }, void 0, !1, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 118,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("input", { type: "hidden", name: "type", value: "deleteRoom" }, void 0, !1, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 119,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
        "button",
        {
          type: "submit",
          className: "text-2xl rounded-3xl w-36 border-2 duration-300 border-main-color hover:border-red-700 hover:text-red-700 hover:border-4 hover:scale-105",
          children: "Delete Room"
        },
        void 0,
        !1,
        {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 120,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/components/hostRoom.tsx",
      lineNumber: 117,
      columnNumber: 17
    }, this) }, void 0, !1, {
      fileName: "app/components/hostRoom.tsx",
      lineNumber: 116,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("section", { className: "scrollsnap-page", children: /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex flex-col items-center justify-center text-center w-10/12 m-auto my-28", children: [
      currentDevice ? null : /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("span", { className: "text-2xl p-6", children: "Select a Device to use" }, void 0, !1, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 132,
          columnNumber: 29
        }, this),
        devices.map((device) => /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
          "button",
          {
            className: "text-2xl form-input rounded-xl",
            onClick: () => setSpotifyDevice(device),
            children: `${device.name} (${device.is_active ? "Active" : "Inactive"})`
          },
          device.name,
          !1,
          {
            fileName: "app/components/hostRoom.tsx",
            lineNumber: 134,
            columnNumber: 33
          },
          this
        ))
      ] }, void 0, !0, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 131,
        columnNumber: 25
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("span", { className: "text-2xl p-6", children: title }, void 0, !1, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 144,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex flex-col gap-5 mb-5", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("span", { children: FormatTime(progressMS, durationMS) }, void 0, !1, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 146,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
          "input",
          {
            type: "range",
            min: 0,
            max: durationMS,
            defaultValue: progressMS,
            className: "accent-indigo-700",
            draggable: !1,
            onChange: handleSeek
          },
          void 0,
          !1,
          {
            fileName: "app/components/hostRoom.tsx",
            lineNumber: 147,
            columnNumber: 25
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 145,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "scrollsnap-start-component flex flex-row items-center justify-center gap-x-10 py-6 border-y-[1px] border-main-color-hover w-full", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(Icon, { classStr: "fa-solid fa-backward-step", onClick: handlePrevious }, void 0, !1, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 158,
          columnNumber: 25
        }, this),
        isPlaying ? /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(Icon, { classStr: "fa-solid fa-pause", onClick: handlePause }, void 0, !1, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 161,
          columnNumber: 35
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(Icon, { classStr: "fa-solid fa-play", onClick: handlePlay }, void 0, !1, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 162,
          columnNumber: 35
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(Icon, { classStr: "fa-solid fa-forward-step", onClick: handleNext }, void 0, !1, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 164,
          columnNumber: 25
        }, this),
        volume >= 50 ? /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(Icon, { onClick: () => setShowVolume((v) => !v), classStr: "fa-solid fa-volume-high" }, void 0, !1, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 166,
          columnNumber: 29
        }, this) : null,
        volume < 50 && volume > 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(Icon, { onClick: () => setShowVolume((v) => !v), classStr: "fa-solid fa-volume-low" }, void 0, !1, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 169,
          columnNumber: 29
        }, this) : null,
        volume == 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(Icon, { onClick: () => setShowVolume((v) => !v), classStr: "fa-solid fa-volume-xmark" }, void 0, !1, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 172,
          columnNumber: 29
        }, this) : null,
        showVolume ? /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex flex-col text-center items-center justify-center", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("span", { className: "text-xl", children: [
            volume,
            " %"
          ] }, void 0, !0, {
            fileName: "app/components/hostRoom.tsx",
            lineNumber: 176,
            columnNumber: 33
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
            "input",
            {
              type: "range",
              min: 0,
              max: 100,
              value: volume,
              className: "accent-main-color",
              onChange: (e) => setRoomData({ volume: parseInt(e.currentTarget.value) })
            },
            void 0,
            !1,
            {
              fileName: "app/components/hostRoom.tsx",
              lineNumber: 177,
              columnNumber: 33
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 175,
          columnNumber: 29
        }, this) : null
      ] }, void 0, !0, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 157,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "scrollsnap-start-component flex flex-row w-full", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex flex-col flex-wrap h-80 w-full", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("span", { className: "text-2xl", children: "Party members:" }, void 0, !1, {
            fileName: "app/components/hostRoom.tsx",
            lineNumber: 190,
            columnNumber: 29
          }, this),
          clients.map((client) => /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex flex-row flex-wrap gap-3 justify-center items-center max-w-[50%]", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("span", { className: `input-form text-3xl ${client.isHost ? "text-main-color" : "text-indigo-700"}`, children: client.username }, void 0, !1, {
              fileName: "app/components/hostRoom.tsx",
              lineNumber: 193,
              columnNumber: 37
            }, this),
            client.isHost ? null : /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_jsx_dev_runtime5.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react9.Form, { method: "post", children: [
                /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("input", { type: "hidden", name: "username", value: client.username }, void 0, !1, {
                  fileName: "app/components/hostRoom.tsx",
                  lineNumber: 199,
                  columnNumber: 49
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("input", { type: "hidden", name: "type", value: "kick" }, void 0, !1, {
                  fileName: "app/components/hostRoom.tsx",
                  lineNumber: 200,
                  columnNumber: 49
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("button", { type: "submit", children: "Kick" }, void 0, !1, {
                  fileName: "app/components/hostRoom.tsx",
                  lineNumber: 201,
                  columnNumber: 49
                }, this)
              ] }, void 0, !0, {
                fileName: "app/components/hostRoom.tsx",
                lineNumber: 198,
                columnNumber: 45
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react9.Form, { method: "post", children: [
                /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("input", { type: "hidden", name: "username", value: client.username }, void 0, !1, {
                  fileName: "app/components/hostRoom.tsx",
                  lineNumber: 204,
                  columnNumber: 49
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("input", { type: "hidden", name: "type", value: "ban" }, void 0, !1, {
                  fileName: "app/components/hostRoom.tsx",
                  lineNumber: 205,
                  columnNumber: 49
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("button", { type: "submit", children: "Ban" }, void 0, !1, {
                  fileName: "app/components/hostRoom.tsx",
                  lineNumber: 206,
                  columnNumber: 49
                }, this)
              ] }, void 0, !0, {
                fileName: "app/components/hostRoom.tsx",
                lineNumber: 203,
                columnNumber: 45
              }, this)
            ] }, void 0, !0, {
              fileName: "app/components/hostRoom.tsx",
              lineNumber: 197,
              columnNumber: 41
            }, this)
          ] }, client.username, !0, {
            fileName: "app/components/hostRoom.tsx",
            lineNumber: 192,
            columnNumber: 33
          }, this))
        ] }, void 0, !0, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 189,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex flex-row justify-center items-center content-center text-center w-full gap-5 pb-5", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "w-full flex flex-col gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("span", { className: "text-2xl", children: "Coming next:" }, void 0, !1, {
              fileName: "app/components/hostRoom.tsx",
              lineNumber: 215,
              columnNumber: 33
            }, this),
            tracksQElements.map((el) => el)
          ] }, void 0, !0, {
            fileName: "app/components/hostRoom.tsx",
            lineNumber: 214,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "w-full flex flex-col gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("span", { className: "text-2xl", children: "Previously played:" }, void 0, !1, {
              fileName: "app/components/hostRoom.tsx",
              lineNumber: 219,
              columnNumber: 33
            }, this),
            recentTracks.map((trackData, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "text-lg", children: /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("span", { children: `[${i + 1}] ${trackData.track.name} - ${trackData.track.artists.map((a) => a.name).join(", ")}` }, void 0, !1, {
              fileName: "app/components/hostRoom.tsx",
              lineNumber: 222,
              columnNumber: 41
            }, this) }, i, !1, {
              fileName: "app/components/hostRoom.tsx",
              lineNumber: 221,
              columnNumber: 37
            }, this))
          ] }, void 0, !0, {
            fileName: "app/components/hostRoom.tsx",
            lineNumber: 218,
            columnNumber: 29
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 213,
          columnNumber: 25
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 188,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "scrollsnap-end-component flex flex-col items-center justify-center content-center gap-2 border-t-[1px] border-main-color-hover w-full h-56", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("span", { className: "text-2xl", children: "Search a song to add to the queue:" }, void 0, !1, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 231,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
          "input",
          {
            className: "rounded-lg outline-none",
            type: "text",
            name: "searchBar",
            onChange: (e) => setRoomData({ searchInput: e.target.value })
          },
          void 0,
          !1,
          {
            fileName: "app/components/hostRoom.tsx",
            lineNumber: 232,
            columnNumber: 25
          },
          this
        ),
        /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("div", { className: "flex flex-row flex-wrap gap-5 justify-center overflow-y-scroll", children: searchResults.map((track) => /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(
          "button",
          {
            className: "border-[1px] border-[white] rounded-xl text-lg p-1 mt-4 hover:scale-105",
            onClick: () => addTrackToQueue(track),
            children: `${track.name} - ${track.artists.map((a) => a.name).join(", ")}`
          },
          track.id,
          !1,
          {
            fileName: "app/components/hostRoom.tsx",
            lineNumber: 240,
            columnNumber: 33
          },
          this
        )) }, void 0, !1, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 238,
          columnNumber: 25
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 230,
        columnNumber: 21
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/hostRoom.tsx",
      lineNumber: 129,
      columnNumber: 17
    }, this) }, void 0, !1, {
      fileName: "app/components/hostRoom.tsx",
      lineNumber: 128,
      columnNumber: 13
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/hostRoom.tsx",
    lineNumber: 115,
    columnNumber: 9
  }, this);
}

// app/components/clientRoom.tsx
var import_react10 = require("@remix-run/react");
var import_jsx_dev_runtime6 = require("react/jsx-dev-runtime");
function ClientRoom(props) {
  let {
    username,
    title,
    durationMS,
    progressMS,
    recentTracks,
    tracksQueue,
    partyTracksQ,
    setRoomData,
    searchResults,
    addTrackToQueue
  } = props, tracksQElements = [];
  return tracksQueue.forEach((track, i) => {
    let owner = partyTracksQ.find((trackOwner) => trackOwner.trackId == track.id);
    tracksQElements.push(track.type == "episode" ? null : /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "text-lg", children: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("span", { children: `[${i + 1}]${owner ? ` (${owner.username})` : ""} ${track.name} - ${track.artists.map((a) => a.name).join(", ")}` }, void 0, !1, {
      fileName: "app/components/clientRoom.tsx",
      lineNumber: 41,
      columnNumber: 17
    }, this) }, i, !1, {
      fileName: "app/components/clientRoom.tsx",
      lineNumber: 40,
      columnNumber: 13
    }, this));
  }), /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_jsx_dev_runtime6.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("nav", { className: "absolute top-0 right-10 w-2/6 h-28 z-10 flex flex-row items-center justify-end content-center", children: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_react10.Form, { method: "post", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("input", { type: "hidden", name: "username", value: username }, void 0, !1, {
        fileName: "app/components/clientRoom.tsx",
        lineNumber: 50,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("input", { type: "hidden", name: "type", value: "leaveRoom" }, void 0, !1, {
        fileName: "app/components/clientRoom.tsx",
        lineNumber: 51,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(
        "button",
        {
          type: "submit",
          className: "text-2xl rounded-3xl w-36 border-2 duration-300 border-main-color hover:border-red-700 hover:text-red-700 hover:border-4 hover:scale-105",
          children: "Leave Room"
        },
        void 0,
        !1,
        {
          fileName: "app/components/clientRoom.tsx",
          lineNumber: 52,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/components/clientRoom.tsx",
      lineNumber: 49,
      columnNumber: 17
    }, this) }, void 0, !1, {
      fileName: "app/components/clientRoom.tsx",
      lineNumber: 48,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("section", { className: "scrollsnap-page", children: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "flex flex-col items-center justify-center text-center w-10/12 m-auto my-28", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("span", { className: "text-2xl p-6", children: title }, void 0, !1, {
        fileName: "app/components/clientRoom.tsx",
        lineNumber: 62,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "flex flex-col gap-5 mb-5", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("span", { children: FormatTime(progressMS, durationMS) }, void 0, !1, {
          fileName: "app/components/clientRoom.tsx",
          lineNumber: 64,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(
          "input",
          {
            type: "range",
            min: 0,
            max: durationMS,
            defaultValue: progressMS,
            className: "accent-indigo-700",
            draggable: !1,
            onChange: (e) => e.target.value = String(progressMS)
          },
          void 0,
          !1,
          {
            fileName: "app/components/clientRoom.tsx",
            lineNumber: 65,
            columnNumber: 25
          },
          this
        )
      ] }, void 0, !0, {
        fileName: "app/components/clientRoom.tsx",
        lineNumber: 63,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "scrollsnap-end-component flex flex-row items-center justify-center gap-x-10 py-6 border-t-[1px] border-main-color-hover w-full", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "flex flex-col items-center justify-center content-center gap-2 w-full h-56 overflow-x-hidden", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("span", { className: "text-2xl", children: "Search a song to add to the queue:" }, void 0, !1, {
            fileName: "app/components/clientRoom.tsx",
            lineNumber: 77,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(
            "input",
            {
              className: "rounded-lg outline-none",
              type: "text",
              name: "searchBar",
              onChange: (e) => setRoomData({ searchInput: e.target.value })
            },
            void 0,
            !1,
            {
              fileName: "app/components/clientRoom.tsx",
              lineNumber: 78,
              columnNumber: 29
            },
            this
          ),
          /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "flex flex-row flex-wrap gap-2 justify-center overflow-y-scroll", children: searchResults.map((track) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(
            "button",
            {
              className: "border-[1px] border-[white] rounded-xl text-lg p-1 m-4 hover:scale-105",
              onClick: () => addTrackToQueue(track),
              children: `${track.name} - ${track.artists.map((a) => a.name).join(", ")}`
            },
            track.id,
            !1,
            {
              fileName: "app/components/clientRoom.tsx",
              lineNumber: 86,
              columnNumber: 37
            },
            this
          )) }, void 0, !1, {
            fileName: "app/components/clientRoom.tsx",
            lineNumber: 84,
            columnNumber: 29
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/clientRoom.tsx",
          lineNumber: 76,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "flex flex-row justify-center items-center content-center text-center w-full gap-5 pb-5", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full flex flex-col gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("span", { className: "text-2xl", children: "Coming next:" }, void 0, !1, {
              fileName: "app/components/clientRoom.tsx",
              lineNumber: 98,
              columnNumber: 33
            }, this),
            tracksQElements.map((el) => el)
          ] }, void 0, !0, {
            fileName: "app/components/clientRoom.tsx",
            lineNumber: 97,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "w-full flex flex-col gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("span", { className: "text-2xl", children: "Previously played:" }, void 0, !1, {
              fileName: "app/components/clientRoom.tsx",
              lineNumber: 102,
              columnNumber: 33
            }, this),
            recentTracks.map((trackData, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", { className: "text-lg", children: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("span", { children: `[${i + 1}] ${trackData.track.name} - ${trackData.track.artists.map((a) => a.name).join(", ")}` }, void 0, !1, {
              fileName: "app/components/clientRoom.tsx",
              lineNumber: 105,
              columnNumber: 41
            }, this) }, i, !1, {
              fileName: "app/components/clientRoom.tsx",
              lineNumber: 104,
              columnNumber: 37
            }, this))
          ] }, void 0, !0, {
            fileName: "app/components/clientRoom.tsx",
            lineNumber: 101,
            columnNumber: 29
          }, this)
        ] }, void 0, !0, {
          fileName: "app/components/clientRoom.tsx",
          lineNumber: 96,
          columnNumber: 25
        }, this)
      ] }, void 0, !0, {
        fileName: "app/components/clientRoom.tsx",
        lineNumber: 75,
        columnNumber: 21
      }, this)
    ] }, void 0, !0, {
      fileName: "app/components/clientRoom.tsx",
      lineNumber: 61,
      columnNumber: 17
    }, this) }, void 0, !1, {
      fileName: "app/components/clientRoom.tsx",
      lineNumber: 60,
      columnNumber: 13
    }, this)
  ] }, void 0, !0, {
    fileName: "app/components/clientRoom.tsx",
    lineNumber: 47,
    columnNumber: 9
  }, this);
}

// app/routes/room.$roomID.tsx
var import_jsx_dev_runtime7 = require("react/jsx-dev-runtime"), action3 = async ({
  request,
  params
}) => {
  let username = await getSessionData(request, "username"), formData = await request.formData(), fetchType = formData.get("type"), id = params.roomID;
  if (!id || !username)
    return (0, import_node5.redirect)("/");
  switch (fetchType) {
    case "fetchData":
      let currentTrack = formData.get("currentTrack"), party = api.GetParty(parseInt(id));
      return party ? (api.RemoveFromTracksQueue(parseInt(id), currentTrack), (0, import_node5.json)({
        tracksQueue: party.tracksQueue,
        clients: party.clients,
        isPartyDeleted: !1
      })) : (0, import_node5.json)({
        tracksQueue: [],
        clients: [],
        isPartyDeleted: !0
      });
    case "deleteRoom":
      return api.DeleteParty(parseInt(id), username), (0, import_node5.redirect)("/");
    case "leaveRoom":
      return api.LeaveParty(parseInt(id), username), (0, import_node5.redirect)("/");
    case "addToQueue":
      let trackId = formData.get("trackId"), trackName = formData.get("trackName");
      return api.AddToTracksQueue(parseInt(id), username, trackId, trackName), null;
    case "kick": {
      let target = formData.get("username");
      return api.KickUser(parseInt(id), target), null;
    }
    case "ban": {
      let target = formData.get("username");
      return api.BanUser(parseInt(id), target), null;
    }
  }
  return null;
}, loader3 = async ({
  request,
  params
}) => {
  var _a;
  let id = params.roomID;
  if (!id)
    return (0, import_node5.redirect)("/");
  let party = api.GetParty(parseInt(id));
  if (!party)
    return (0, import_node5.json)({ errorMessage: "Error: Party not created or deleted", redirect: "/host" });
  let username = await getSessionData(request, "username");
  return username ? party.clients.find((client) => client.username == username) ? (0, import_node5.json)({
    party,
    isHost: (_a = party.clients.find((client) => client.username == username)) == null ? void 0 : _a.isHost
  }) : (0, import_node5.json)({ errorMessage: `Error: You are not a member of the Party ${party.name} anymore`, redirect: "/" }) : (0, import_node5.redirect)("/");
};
function Room() {
  var _a;
  let loaderData = (0, import_react12.useLoaderData)(), { spotify: _spotify, username: contextUsername } = (0, import_react12.useOutletContext)(), spotify = _spotify, fetcher = (0, import_react12.useFetcher)(), navigate = (0, import_react12.useNavigate)(), [isAllowed, setIsAllowed] = (0, import_react11.useState)(!0), fetchDataTimeout = (0, import_react11.useRef)(null), [fetchInterval, setFetchInterval] = (0, import_react11.useState)(), [syncInterval, setSyncInterval] = (0, import_react11.useState)(), [{
    title,
    volume,
    progressMS,
    durationMS,
    isPlaying,
    recentTracks,
    partyTracksQ,
    searchInput,
    searchResults,
    clients,
    currentDevice,
    devices,
    seekPos,
    tracksQueue
  }, setRoomData] = (0, import_react11.useReducer)(
    (oldState, newState) => ({ ...oldState, ...newState }),
    {
      title: "Loading...",
      volume: 99.9,
      progressMS: 0,
      durationMS: 0,
      isPlaying: !1,
      recentTracks: [],
      partyTracksQ: [],
      searchInput: "",
      searchResults: [],
      clients: [],
      currentDevice: null,
      devices: [],
      seekPos: 0,
      tracksQueue: []
    }
  ), debounceVolume = useDebounce(volume, 600), debounceSearch = useDebounce(searchInput, 600), debounceSeek = useDebounce(seekPos, 500);
  (_a = loaderData == null ? void 0 : loaderData.party) != null && _a.id;
  let FetchData = (0, import_react11.useCallback)((delay) => {
    fetchDataTimeout.current && clearTimeout(fetchDataTimeout.current), fetchDataTimeout.current = setTimeout(() => {
      (async () => {
        fetchDataTimeout.current = null;
        let [playbackData, recentTracks2, queueData] = await Promise.all([
          spotify.GetCurrentTrackData(),
          spotify.GetRecentlyPlayedTracks(5),
          spotify.GetCurrentQueueData()
        ]);
        if (playbackData instanceof Error) {
          import_react_toastify2.toast.error(`Error: Failed to fetch current track (${playbackData.message})`, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: !1,
            closeOnClick: !0,
            pauseOnHover: !0,
            draggable: !0,
            theme: "light"
          }), console.error(playbackData.message);
          return;
        }
        if (recentTracks2 instanceof Error) {
          import_react_toastify2.toast.error(`Error: Failed to fetch recent tracks (${recentTracks2.message})`, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: !1,
            closeOnClick: !0,
            pauseOnHover: !0,
            draggable: !0,
            theme: "light"
          }), console.error(recentTracks2.message);
          return;
        }
        if (queueData instanceof Error) {
          import_react_toastify2.toast.error(`Error: Failed to fetch tracks in queue (${queueData.message})`, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: !1,
            closeOnClick: !0,
            pauseOnHover: !0,
            draggable: !0,
            theme: "light"
          }), console.error(queueData.message);
          return;
        }
        if (!playbackData || !playbackData.device.is_active) {
          let devices2 = await spotify.GetDevices();
          devices2 instanceof Error || setRoomData({ currentDevice: null, devices: devices2 });
        }
        if (!playbackData)
          return setRoomData({
            title: "Play a music on Spotify to start using Sharify"
          });
        let currentTrack = playbackData.item, recentArr = [], queueArr = [];
        return recentTracks2.forEach((track) => {
          track instanceof Error || recentArr.push(track);
        }), queueData.queue.forEach((track, i) => {
          i >= 5 || queueArr.push(track);
        }), currentTrack ? currentTrack.type == "episode" ? setRoomData({
          title: currentTrack.name,
          recentTracks: recentArr,
          tracksQueue: queueArr,
          durationMS: currentTrack.duration_ms
        }) : setRoomData({
          title: `${currentTrack.name} - ${currentTrack.artists.map((artist) => artist.name).join(", ")}`,
          recentTracks: recentArr,
          tracksQueue: queueArr,
          durationMS: currentTrack.duration_ms,
          progressMS: playbackData.progress_ms || 0,
          isPlaying: playbackData.is_playing,
          volume: playbackData.device.volume_percent || 50
        }) : console.error("Couldn't fetch current track");
      })();
    }, delay || 500);
  }, [fetchDataTimeout, setRoomData]);
  (0, import_react11.useEffect)(() => {
    if (!isAllowed)
      return;
    let interval = setInterval(() => fetcher.submit({
      type: "fetchData",
      username: contextUsername,
      currentTrack: title
    }, { method: "post" }), 1e3);
    setFetchInterval(interval);
    let syncInterval2 = setInterval(() => FetchData(0), 1e4);
    setSyncInterval(syncInterval2);
    let timeout = setTimeout(() => FetchData(0), 1e3);
    return () => {
      clearTimeout(timeout), clearInterval(interval), clearInterval(syncInterval2);
    };
  }, [title]), (0, import_react11.useEffect)(() => {
    if (fetcher.data) {
      if (fetcher.data.isPartyDeleted) {
        let _toast = (0, import_react_toastify2.toast)("The party has been deleted by the host!", {
          position: "bottom-right",
          autoClose: 2500,
          hideProgressBar: !1,
          closeOnClick: !0,
          pauseOnHover: !0,
          draggable: !0,
          theme: "light"
        }), timeout = setTimeout(() => navigate("/"), 3e3);
        return setIsAllowed(!1), () => {
          import_react_toastify2.toast.isActive(_toast) && import_react_toastify2.toast.dismiss(_toast), clearTimeout(timeout);
        };
      }
      if (!fetcher.data.clients.find((client) => client.username == contextUsername)) {
        clearInterval(fetchInterval), clearInterval(syncInterval), setIsAllowed(!1);
        let _toast = (0, import_react_toastify2.toast)("You have been kicked of the room by the host!", {
          position: "bottom-right",
          autoClose: 2500,
          hideProgressBar: !1,
          closeOnClick: !0,
          pauseOnHover: !0,
          draggable: !0,
          theme: "light"
        }), timeout = setTimeout(() => navigate("/client"), 3e3);
        return () => {
          import_react_toastify2.toast.isActive(_toast) && import_react_toastify2.toast.dismiss(_toast), clearTimeout(timeout);
        };
      }
      setRoomData({
        partyTracksQ: fetcher.data.tracksQueue,
        clients: fetcher.data.clients
      });
    }
  }, [fetcher.data]), (0, import_react11.useEffect)(() => {
    if (!isPlaying)
      return;
    let timeout = setTimeout(() => {
      if (durationMS > 0 && progressMS >= durationMS) {
        clearTimeout(timeout), FetchData();
        return;
      }
      setRoomData({ progressMS: progressMS + 1e3 });
    }, 1e3);
    return () => clearTimeout(timeout);
  }, [progressMS, durationMS, setRoomData, isPlaying, FetchData]), (0, import_react11.useEffect)(() => {
    debounceVolume != 99.9 && spotify.SetVolume(debounceVolume);
  }, [debounceVolume]), (0, import_react11.useEffect)(() => {
    debounceSearch.trim() != "" && spotify.SearchTracks(debounceSearch).then((resp) => {
      var _a2;
      if (resp instanceof Error)
        return console.error(resp.message);
      setRoomData({ searchResults: (_a2 = resp.tracks) == null ? void 0 : _a2.items });
    }).catch(console.error);
  }, [debounceSearch]), (0, import_react11.useEffect)(() => {
    debounceSeek != 0 && spotify.Seek(debounceSeek);
  }, [debounceSeek]), (0, import_react11.useEffect)(() => {
    if (loaderData.errorMessage) {
      let _toast = import_react_toastify2.toast.error(loaderData.errorMessage, {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: !1,
        closeOnClick: !0,
        pauseOnHover: !0,
        draggable: !0,
        theme: "light"
      }), timeout = setTimeout(() => navigate(loaderData.redirect || "/"), 3e3);
      return setIsAllowed(!1), () => {
        import_react_toastify2.toast.isActive(_toast) && import_react_toastify2.toast.dismiss(_toast), clearTimeout(timeout);
      };
    }
    if (SetStorageValue({
      st: {
        at: loaderData.party.spotifyCreds.accessToken,
        rt: loaderData.party.spotifyCreds.refreshToken,
        ein: loaderData.party.spotifyCreds.expiresIn,
        date: loaderData.party.spotifyCreds.date
      }
    }), spotify.is_owner = loaderData.isHost, currentDevice)
      return;
    let spotifyDevice = GetStorageValue("SpotifyDevice");
    if (spotifyDevice) {
      let device = JSON.parse(spotifyDevice);
      setRoomData({ currentDevice: device });
    } else
      spotify.current_device ? setRoomData({ currentDevice: spotify.current_device }) : (async () => {
        let devices2 = await spotify.GetDevices();
        if (devices2 instanceof Error) {
          import_react_toastify2.toast.error(`Error: Failed to get devices (${devices2.message})`, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: !1,
            closeOnClick: !0,
            pauseOnHover: !0,
            draggable: !0,
            theme: "light"
          });
          return;
        }
        setRoomData({ currentDevice: spotify.current_device, devices: devices2 });
      })();
  }, [loaderData, navigate]);
  let addTrackToQueue = (track) => {
    (async () => (await spotify.AddNextTrack(track.external_urls.spotify) instanceof Error || (0, import_react_toastify2.toast)(`Added track ${track.name} - ${track.artists.map((a) => a.name).join(", ")} to queue !`, {
      position: "bottom-right",
      autoClose: 3e3,
      hideProgressBar: !1,
      closeOnClick: !0,
      pauseOnHover: !0,
      draggable: !0,
      theme: "light"
    }), fetcher.submit({
      type: "addToQueue",
      trackId: track.id,
      trackName: `${track.name} - ${track.artists.map((artist) => artist.name).join(", ")}`
    }, { method: "post" }), setRoomData({ searchResults: [] })))();
  };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(import_jsx_dev_runtime7.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(Title, {}, void 0, !1, {
      fileName: "app/routes/room.$roomID.tsx",
      lineNumber: 516,
      columnNumber: 13
    }, this),
    isAllowed ? loaderData.errorMessage ? null : loaderData.isHost ? /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(
      HostRoom,
      {
        fetcher,
        username: contextUsername,
        title,
        volume,
        setRoomData,
        isPlaying,
        durationMS,
        progressMS,
        FetchData,
        clients,
        recentTracks,
        tracksQueue,
        partyTracksQ,
        currentDevice,
        devices,
        searchResults,
        addTrackToQueue
      },
      void 0,
      !1,
      {
        fileName: "app/routes/room.$roomID.tsx",
        lineNumber: 520,
        columnNumber: 27
      },
      this
    ) : /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(
      ClientRoom,
      {
        username: contextUsername,
        title,
        isPlaying,
        durationMS,
        progressMS,
        FetchData,
        recentTracks,
        tracksQueue,
        partyTracksQ,
        setRoomData,
        searchResults,
        addTrackToQueue
      },
      void 0,
      !1,
      {
        fileName: "app/routes/room.$roomID.tsx",
        lineNumber: 539,
        columnNumber: 27
      },
      this
    ) : null,
    /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(import_react_toastify2.ToastContainer, {}, void 0, !1, {
      fileName: "app/routes/room.$roomID.tsx",
      lineNumber: 555,
      columnNumber: 13
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/room.$roomID.tsx",
    lineNumber: 515,
    columnNumber: 9
  }, this);
}
var Icon = (props) => {
  let { classStr, onClick } = props;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(
    "div",
    {
      className: "flex text-center items-center justify-center cursor-pointer rounded-full hover:bg-main-color-hover/30 w-12 h-12",
      onClick,
      children: /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("i", { className: `${classStr} text-2xl` }, void 0, !1, {
        fileName: "app/routes/room.$roomID.tsx",
        lineNumber: 571,
        columnNumber: 13
      }, this)
    },
    void 0,
    !1,
    {
      fileName: "app/routes/room.$roomID.tsx",
      lineNumber: 567,
      columnNumber: 9
    },
    this
  );
};

// app/routes/client.tsx
var client_exports = {};
__export(client_exports, {
  action: () => action4,
  default: () => Client,
  loader: () => loader4
});
var import_react_toastify3 = require("react-toastify"), import_react13 = require("react"), import_node6 = require("@remix-run/node"), import_react14 = require("@remix-run/react");
var import_jsx_dev_runtime8 = require("react/jsx-dev-runtime"), action4 = async ({
  request
}) => {
  let formData = await request.formData();
  (formData.get("DeleteSpotifyTokens") || !1) && await unsetSessionData(request, "SpotifyTokens", "/");
  let username = formData.get("username"), partyID = formData.get("partyID"), password = formData.get("partyPwd");
  if (!partyID)
    throw new Error("Party ID not found, please contact Snoupix");
  let party = api.GetParty(parseInt(partyID));
  if (!username)
    throw new Error("Username not found, please contact Snoupix");
  if (!party)
    return (0, import_node6.json)({ errorMessage: `Party id ${partyID} doesn't exist anymore.` });
  if (party.isPrivate && party.password != password)
    return (0, import_node6.json)({ errorMessage: "Error: Party password incorrect" });
  if (api.UsernameExists(username))
    return (0, import_node6.json)({ errorMessage: `Error: There is already a Sharify member called "${username}"` });
  let error = api.JoinParty(parseInt(partyID), username);
  return error ? (0, import_node6.json)({ errorMessage: error.message }) : await setSessionData(request, "username", username, `/room/${partyID}`);
}, loader4 = async ({
  request
}) => {
  let username = await getSessionData(request, "username");
  if (username) {
    let party = api.GetUserParty(username);
    if (party != null)
      return (0, import_node6.redirect)(`/room/${party.id}`);
  }
  let parties = api.GetParties(!1);
  return (0, import_node6.json)({ parties });
};
function Client() {
  let loaderData = (0, import_react14.useLoaderData)(), actionData = (0, import_react14.useActionData)(), context = (0, import_react14.useOutletContext)(), submit = (0, import_react14.useSubmit)(), [parties, setParties] = (0, import_react13.useState)([]), [showUP, setShowUP] = (0, import_react13.useState)(!1), [showPP, setShowPP] = (0, import_react13.useState)(!1), [username, setUsername] = (0, import_react13.useState)(""), [password, setPassword] = (0, import_react13.useState)(""), [partyData, setPartyData] = (0, import_react13.useState)(null);
  (0, import_react13.useEffect)(() => {
    loaderData.parties && setParties(loaderData.parties.filter(
      (party) => !party.bannedClients.includes(context.username)
    )), SpotifyHandler.isReady && !SpotifyHandler.isOwner && submit({ DeleteSpotifyTokens: "true" }, { method: "post" }), setUsername(context.username);
  }, [loaderData]), (0, import_react13.useEffect)(() => {
    if (actionData && actionData.errorMessage) {
      let _toast = import_react_toastify3.toast.error(actionData.errorMessage, {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: !1,
        closeOnClick: !0,
        pauseOnHover: !0,
        draggable: !0,
        theme: "dark"
      });
      return setUsername(""), setPassword(""), () => import_react_toastify3.toast.isActive(_toast) ? import_react_toastify3.toast.dismiss(_toast) : void 0;
    }
  }, [actionData]), (0, import_react13.useEffect)(() => {
    !showUP && !showPP && partyData != null && (username.trim() != "" || password != "") && handleJoin(partyData.id, partyData.isPrivate);
  }, [showUP, showPP]);
  let handleJoin = (id, isPrivate) => {
    if (setPartyData({ id, isPrivate }), !username || username.trim() == "") {
      setShowUP(!0);
      return;
    }
    if (isPrivate && password == "") {
      setShowPP(!0);
      return;
    }
    submit(
      {
        username,
        partyID: String(id),
        partyPwd: password
      },
      { method: "post" }
    );
  };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_jsx_dev_runtime8.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(Title, {}, void 0, !1, {
      fileName: "app/routes/client.tsx",
      lineNumber: 167,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("section", { className: "h-screen", children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { "data-cy": "div-rooms-array", className: "relative m-auto mt-28 w-3/5 h-3/5 flex flex-col overflow-y-scroll border-[1px] border-main-color-hover rounded-lg shadow-around", children: [
      parties && parties.length > 0 ? parties.map((party) => /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(
        import_react14.Form,
        {
          "data-cy": "client-form-room",
          onClick: () => handleJoin(party.id, party.isPrivate),
          className: "cursor-pointer flex flex-row justify-center text-2xl py-4 border-b-[1px] duration-300 hover:text-slate-400" + (party.id % 2 == 0 ? " text-indigo-600" : ""),
          children: [
            `[${party.id}] ${party.name} | ${party.clients.length}/${party.MAX_CLIENTS} | `,
            party.type == "Spotify" ? /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("i", { className: "fab fa-spotify pl-2.5 pr-1 mt-1 text-[currentColor]" }, void 0, !1, {
              fileName: "app/routes/client.tsx",
              lineNumber: 180,
              columnNumber: 56
            }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("i", { className: "fab fa-youtube pl-2.5 pr-1 mt-1 text-[currentColor]" }, void 0, !1, {
              fileName: "app/routes/client.tsx",
              lineNumber: 180,
              columnNumber: 130
            }, this),
            party.isPrivate ? " | " : "",
            party.isPrivate ? /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("i", { className: "fas fa-lock pl-2.5 mt-[.15rem] text-[currentColor]" }, void 0, !1, {
              fileName: "app/routes/client.tsx",
              lineNumber: 182,
              columnNumber: 48
            }, this) : ""
          ]
        },
        party.id,
        !0,
        {
          fileName: "app/routes/client.tsx",
          lineNumber: 171,
          columnNumber: 25
        },
        this
      )) : null,
      loaderData && loaderData.parties && loaderData.parties.length == 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("span", { className: "text-center text-3xl m-auto", children: "No parties found" }, void 0, !1, {
        fileName: "app/routes/client.tsx",
        lineNumber: 186,
        columnNumber: 25
      }, this) : null,
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(
        PasswordPopup,
        {
          display: showPP,
          setDisplay: setShowPP,
          setPassword
        },
        void 0,
        !1,
        {
          fileName: "app/routes/client.tsx",
          lineNumber: 188,
          columnNumber: 21
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(
        UsernamePopup,
        {
          display: showUP,
          setDisplay: setShowUP,
          username,
          setUsername
        },
        void 0,
        !1,
        {
          fileName: "app/routes/client.tsx",
          lineNumber: 193,
          columnNumber: 21
        },
        this
      )
    ] }, void 0, !0, {
      fileName: "app/routes/client.tsx",
      lineNumber: 169,
      columnNumber: 17
    }, this) }, void 0, !1, {
      fileName: "app/routes/client.tsx",
      lineNumber: 168,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(import_react_toastify3.ToastContainer, {}, void 0, !1, {
      fileName: "app/routes/client.tsx",
      lineNumber: 201,
      columnNumber: 13
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/client.tsx",
    lineNumber: 166,
    columnNumber: 9
  }, this);
}
var UsernamePopup = (props) => {
  let { display, setDisplay, username, setUsername } = props, inputRef = (0, import_react13.useRef)(null);
  return display && setTimeout(() => {
    var _a;
    return (_a = inputRef.current) == null ? void 0 : _a.focus();
  }, 500), /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: `absolute top-0 left-0 h-full w-[100%] flex-col justify-center items-center gap-5 backdrop-blur-sm duration-300 ${display ? "flex" : "hidden"}`, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("span", { className: "text-center text-3xl", children: "First of all, you need to register your username" }, void 0, !1, {
      fileName: "app/routes/client.tsx",
      lineNumber: 223,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(
      "input",
      {
        "data-cy": "client-username",
        ref: inputRef,
        type: "text",
        className: "form-input",
        placeholder: "Username",
        defaultValue: username,
        onChange: (e) => setUsername(e.target.value)
      },
      void 0,
      !1,
      {
        fileName: "app/routes/client.tsx",
        lineNumber: 224,
        columnNumber: 13
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("button", { "data-cy": "client-username-submit", className: "text-2xl", onClick: () => setDisplay(!1), children: "Close" }, void 0, !1, {
      fileName: "app/routes/client.tsx",
      lineNumber: 233,
      columnNumber: 13
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/client.tsx",
    lineNumber: 222,
    columnNumber: 9
  }, this);
}, PasswordPopup = (props) => {
  let { display, setDisplay, setPassword } = props, inputRef = (0, import_react13.useRef)(null);
  return display && setTimeout(() => {
    var _a;
    return (_a = inputRef.current) == null ? void 0 : _a.focus();
  }, 500), /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("div", { className: `absolute top-0 left-0 h-full w-[100%] flex-col justify-center items-center gap-5 backdrop-blur-sm duration-300 ${display ? "flex" : "hidden"}`, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("span", { className: "text-center text-3xl", children: "Type the correct Party password" }, void 0, !1, {
      fileName: "app/routes/client.tsx",
      lineNumber: 254,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(
      "input",
      {
        "data-cy": "client-party-password",
        ref: inputRef,
        type: "password",
        className: "form-input w-full",
        placeholder: "Party password",
        onChange: (e) => setPassword(e.currentTarget.value)
      },
      void 0,
      !1,
      {
        fileName: "app/routes/client.tsx",
        lineNumber: 255,
        columnNumber: 13
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("button", { "data-cy": "client-party-password-submit", className: "text-2xl", onClick: () => setDisplay(!1), children: "Close" }, void 0, !1, {
      fileName: "app/routes/client.tsx",
      lineNumber: 263,
      columnNumber: 13
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/client.tsx",
    lineNumber: 253,
    columnNumber: 9
  }, this);
};

// app/routes/index.tsx
var routes_exports = {};
__export(routes_exports, {
  action: () => action5,
  default: () => Index
});
var import_react15 = require("react"), import_react_toastify4 = require("react-toastify"), import_react16 = require("@remix-run/react");
var import_jsx_dev_runtime9 = require("react/jsx-dev-runtime"), action5 = async ({
  request
}) => (await request.formData()).get("DeleteSpotifyTokens") || !1 ? await unsetSessionData(request, "SpotifyTokens", "/") : null;
function Index() {
  let { spotify } = (0, import_react16.useOutletContext)(), submit = (0, import_react16.useSubmit)(), [spotifyUser, setSpotifyUser] = (0, import_react15.useState)(null);
  return (0, import_react15.useEffect)(() => {
    spotify && (spotify.is_ready ? (async () => {
      let profile = await spotify.GetProfile();
      profile instanceof Error || setSpotifyUser(profile);
    })() : GetStorageValue("st") != null && !spotify.is_ready && (async () => {
      let profile = await spotify.GetProfile();
      profile instanceof Error || setSpotifyUser(profile);
    })());
  }, [spotify]), /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_jsx_dev_runtime9.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("nav", { className: "fixed top-0 left-0 h-14 w-screen" }, void 0, !1, {
      fileName: "app/routes/index.tsx",
      lineNumber: 72,
      columnNumber: 4
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { className: "h-screen flex flex-col justify-center items-center content-center gap-y-4 md:gap-y-6 xl:gap-y-9", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(Title, {}, void 0, !1, {
        fileName: "app/routes/index.tsx",
        lineNumber: 76,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(
        import_react16.Link,
        {
          className: "duration-300 p-main-btn md:t-main-btn xl:main-btn hover:shadow-around hover:shadow-main-color hover:border-bg-color",
          to: "/host",
          "data-cy": "host-link",
          children: "Host"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/index.tsx",
          lineNumber: 77,
          columnNumber: 5
        },
        this
      ),
      /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(
        import_react16.Link,
        {
          className: "duration-300 p-main-btn md:t-main-btn xl:main-btn hover:shadow-around hover:shadow-main-color hover:border-bg-color",
          to: "/client",
          "data-cy": "client-link",
          children: "Client"
        },
        void 0,
        !1,
        {
          fileName: "app/routes/index.tsx",
          lineNumber: 84,
          columnNumber: 5
        },
        this
      ),
      spotifyUser ? /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("div", { "data-cy": "horizontal-bar", className: "border-t-[1px] border-indigo-700 w-[20%]" }, void 0, !1, {
        fileName: "app/routes/index.tsx",
        lineNumber: 92,
        columnNumber: 6
      }, this) : null,
      spotifyUser ? /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(
        "button",
        {
          className: "duration-300 p-main-btn md:t-main-btn xl:main-btn hover:shadow-around hover:shadow-main-color hover:border-bg-color",
          onClick: () => {
            (0, import_react_toastify4.toast)(`[Spotify] Disconnected from ${spotifyUser == null ? void 0 : spotifyUser.display_name} !`, {
              position: "bottom-right",
              autoClose: 2500,
              hideProgressBar: !1,
              closeOnClick: !0,
              pauseOnHover: !0,
              draggable: !0,
              theme: "light"
            }), submit({ DeleteSpotifyTokens: "true" }, { method: "post" }), SpotifyHandler.Disconnect(), setSpotifyUser(null);
          },
          "data-cy": "disconnect-btn",
          children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("span", { className: "text-xl xl:text-2xl", children: `Disconnect from ${spotifyUser.display_name}` }, void 0, !1, {
            fileName: "app/routes/index.tsx",
            lineNumber: 100,
            columnNumber: 7
          }, this)
        },
        void 0,
        !1,
        {
          fileName: "app/routes/index.tsx",
          lineNumber: 95,
          columnNumber: 6
        },
        this
      ) : null
    ] }, void 0, !0, {
      fileName: "app/routes/index.tsx",
      lineNumber: 75,
      columnNumber: 4
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(import_react_toastify4.ToastContainer, {}, void 0, !1, {
      fileName: "app/routes/index.tsx",
      lineNumber: 104,
      columnNumber: 4
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/index.tsx",
    lineNumber: 71,
    columnNumber: 3
  }, this);
}

// app/routes/host.tsx
var host_exports = {};
__export(host_exports, {
  CatchBoundary: () => CatchBoundary,
  ErrorBoundary: () => ErrorBoundary2,
  action: () => action6,
  default: () => Host,
  loader: () => loader5
});
var import_react_toastify5 = require("react-toastify"), import_node7 = require("@remix-run/node"), import_react17 = require("@remix-run/react"), import_react18 = require("react");
var import_jsx_dev_runtime10 = require("react/jsx-dev-runtime"), action6 = async ({
  request
}) => {
  let _data = (await request.formData()).get("data");
  if (!_data)
    return (0, import_node7.json)({ errorMessage: "Error: Cannot retrieve data, please, contact Snoupix" });
  let data = JSON.parse(_data), party = api.CreateParty(
    [{
      isHost: !0,
      username: data.username
    }],
    data.name,
    data.isPrivate,
    data.type || "Spotify",
    {
      accessToken: data.sat,
      refreshToken: data.srt,
      expiresIn: data.sd,
      date: data.sdate
    },
    data.isPrivate ? data.password : void 0
  );
  if (party instanceof PartyError)
    throw new Response(party.message, { status: 404 });
  return await setSessionData(request, "username", data.username, `/room/${party.id}`);
}, loader5 = async ({
  request
}) => {
  let username = await getSessionData(request, "username"), sTokens = await getSessionData(request, "SpotifyTokens");
  if (username) {
    let party = api.GetUserParty(username);
    if (party)
      return (0, import_node7.redirect)(`/room/${party.id}`);
  }
  return sTokens ? (0, import_node7.json)({ spotifyTokens: JSON.parse(sTokens) }) : null;
};
function Host() {
  let loaderData = (0, import_react17.useLoaderData)(), actionData = (0, import_react17.useActionData)(), { spotify, username: contextUsername } = (0, import_react17.useOutletContext)(), submit = (0, import_react17.useSubmit)(), navigate = (0, import_react17.useNavigate)(), formRef = (0, import_react18.useRef)(null), [connectedTo, setConnectedTo] = (0, import_react18.useState)({ spotify: !1 }), [dataToSend, setDataToSend] = (0, import_react18.useState)(""), [formState, setFormState] = (0, import_react18.useReducer)(
    (state, newState) => (setDataToSend(JSON.stringify({ ...state, ...newState })), { ...state, ...newState }),
    {
      username: "",
      name: "",
      isPrivate: !1,
      password: "",
      type: null,
      sat: "",
      srt: "",
      sd: 0,
      sdate: 0
    }
  );
  (0, import_react18.useEffect)(() => {
    let toast_id;
    if (console.log(spotify), !!spotify)
      return console.log(spotify), spotify.is_ready ? (async () => {
        let profile = await spotify.GetProfile();
        profile instanceof Error || (toast_id = (0, import_react_toastify5.toast)(`[Spotify] Connected as ${profile.display_name}`, {
          position: "bottom-right",
          autoClose: 2500,
          hideProgressBar: !1,
          closeOnClick: !0,
          pauseOnHover: !0,
          draggable: !0,
          theme: "light"
        })), setFormState({
          sat: loaderData.spotifyTokens.sat,
          srt: loaderData.spotifyTokens.srt,
          sd: loaderData.spotifyTokens.ein,
          sdate: loaderData.spotifyTokens.date,
          username: contextUsername,
          name: `${contextUsername}'s party`,
          type: "Spotify"
        }), setConnectedTo((prev) => ({ ...prev, spotify: !0 }));
      })() : GetStorageValue("st") != null && !spotify.is_ready && (async () => {
        let profile = await spotify.GetProfile();
        profile instanceof Error || (toast_id = (0, import_react_toastify5.toast)(`[Spotify] Connected as ${profile.display_name}`, {
          position: "bottom-right",
          autoClose: 2500,
          hideProgressBar: !1,
          closeOnClick: !0,
          pauseOnHover: !0,
          draggable: !0,
          theme: "light"
        })), setFormState({
          sat: loaderData.spotifyTokens.sat,
          srt: loaderData.spotifyTokens.srt,
          sd: loaderData.spotifyTokens.ein,
          sdate: loaderData.spotifyTokens.date,
          username: contextUsername,
          name: `${contextUsername}'s party`,
          type: "Spotify"
        }), setConnectedTo((prev) => ({ ...prev, spotify: !0 }));
      })(), () => import_react_toastify5.toast.dismiss(toast_id);
  }, [spotify]), (0, import_react18.useEffect)(() => {
    if (actionData != null && actionData.errorMessage) {
      let _toast = import_react_toastify5.toast.error(actionData.errorMessage, {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: !1,
        closeOnClick: !0,
        pauseOnHover: !0,
        draggable: !0,
        theme: "dark"
      });
      return () => import_react_toastify5.toast.isActive(_toast) ? import_react_toastify5.toast.dismiss(_toast) : void 0;
    }
  }, [actionData]);
  let checkFormInputs = () => !(formState.name == "" || formState.type == null || formState.isPrivate && formState.password == "" || formState.username.trim() == ""), handleSubmit = () => {
    checkFormInputs() && formRef.current ? submit(formRef.current, { method: "post" }) : import_react_toastify5.toast.error("Error: Missing fields", {
      position: "bottom-right",
      autoClose: 2500,
      hideProgressBar: !1,
      closeOnClick: !0,
      pauseOnHover: !0,
      draggable: !0,
      theme: "dark"
    });
  };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("section", { className: "h-screen", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(Title, {}, void 0, !1, {
      fileName: "app/routes/host.tsx",
      lineNumber: 242,
      columnNumber: 4
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(
      import_react17.Form,
      {
        ref: formRef,
        className: "flex flex-col justify-center items-center content-center h-full gap-y-6",
        onSubmit: (e) => e.preventDefault(),
        children: formState.type == null ? /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(import_jsx_dev_runtime10.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("span", { className: "text-2xl", children: "Party type" }, void 0, !1, {
            fileName: "app/routes/host.tsx",
            lineNumber: 251,
            columnNumber: 8
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "flex flex-row gap-x-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(
            "button",
            {
              className: "text-xl px-5 py-2 rounded-3xl bg-bg-color text-main-color border-[1px] border-main-color transition-all duration-300 " + (formState.type == "Spotify" ? "text-[white] shadow-backRight shadow-main-color scale-105" : ""),
              onClick: () => connectedTo.spotify ? setFormState({ type: "Spotify" }) : navigate("/auth_spotify"),
              children: "Connect to Spotify"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/host.tsx",
              lineNumber: 253,
              columnNumber: 9
            },
            this
          ) }, void 0, !1, {
            fileName: "app/routes/host.tsx",
            lineNumber: 252,
            columnNumber: 8
          }, this)
        ] }, void 0, !0, {
          fileName: "app/routes/host.tsx",
          lineNumber: 250,
          columnNumber: 7
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(import_jsx_dev_runtime10.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "flex flex-row", children: formState.type == "Spotify" ? /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("i", { className: "fab fa-spotify text-3xl text-[currentColor]" }, void 0, !1, {
            fileName: "app/routes/host.tsx",
            lineNumber: 264,
            columnNumber: 40
          }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("i", { className: "fab fa-youtube text-3xl text-[currentColor]" }, void 0, !1, {
            fileName: "app/routes/host.tsx",
            lineNumber: 264,
            columnNumber: 106
          }, this) }, void 0, !1, {
            fileName: "app/routes/host.tsx",
            lineNumber: 263,
            columnNumber: 8
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("input", { type: "hidden", name: "srt", value: formState.srt }, void 0, !1, {
            fileName: "app/routes/host.tsx",
            lineNumber: 266,
            columnNumber: 8
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("input", { type: "hidden", name: "sat", value: formState.sat }, void 0, !1, {
            fileName: "app/routes/host.tsx",
            lineNumber: 267,
            columnNumber: 8
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("input", { type: "hidden", name: "data", value: dataToSend }, void 0, !1, {
            fileName: "app/routes/host.tsx",
            lineNumber: 268,
            columnNumber: 8
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(
            "input",
            {
              "data-cy": "host-form-username",
              autoFocus: !0,
              className: "form-input",
              type: "text",
              maxLength: 20,
              placeholder: "Username",
              spellCheck: !1,
              defaultValue: formState.username,
              onChange: (e) => setFormState({
                username: e.currentTarget.value == "" ? "Guest" : e.currentTarget.value,
                name: `${e.currentTarget.value}'s party`
              })
            },
            void 0,
            !1,
            {
              fileName: "app/routes/host.tsx",
              lineNumber: 269,
              columnNumber: 8
            },
            this
          ),
          /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(
            "input",
            {
              "data-cy": "host-form-party-name",
              className: "form-input",
              type: "text",
              maxLength: 20,
              placeholder: "Party's name",
              spellCheck: !1,
              value: formState.name,
              onChange: (e) => setFormState({ name: e.currentTarget.value })
            },
            void 0,
            !1,
            {
              fileName: "app/routes/host.tsx",
              lineNumber: 283,
              columnNumber: 8
            },
            this
          ),
          /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("span", { className: "text-2xl", children: "Is the party private ?" }, void 0, !1, {
            fileName: "app/routes/host.tsx",
            lineNumber: 293,
            columnNumber: 8
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "flex flex-row gap-x-4", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(
              "button",
              {
                "data-cy": "host-form-make-private",
                className: "text-xl px-5 py-2 rounded-3xl bg-bg-color text-main-color border-[1px] border-main-color transition-all duration-300 " + (formState.isPrivate ? "text-[white] shadow-around shadow-main-color scale-105" : ""),
                onClick: () => formState.isPrivate ? null : setFormState({ isPrivate: !0, password: "" }),
                children: "Yes"
              },
              void 0,
              !1,
              {
                fileName: "app/routes/host.tsx",
                lineNumber: 295,
                columnNumber: 9
              },
              this
            ),
            /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(
              "button",
              {
                "data-cy": "host-form-make-public",
                className: "text-xl px-5 py-2 rounded-3xl bg-bg-color text-main-color border-[1px] border-main-color transition-all duration-300 " + (formState.isPrivate ? "" : "text-[white] shadow-inner shadow-main-color scale-105"),
                onClick: () => formState.isPrivate ? setFormState({ isPrivate: !1, password: "" }) : null,
                children: "No"
              },
              void 0,
              !1,
              {
                fileName: "app/routes/host.tsx",
                lineNumber: 302,
                columnNumber: 9
              },
              this
            )
          ] }, void 0, !0, {
            fileName: "app/routes/host.tsx",
            lineNumber: 294,
            columnNumber: 8
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(
            "input",
            {
              "data-cy": "host-form-party-password",
              className: formState.isPrivate ? "form-input block" : "hidden",
              type: "password",
              name: "password",
              placeholder: "Password",
              onChange: (e) => setFormState({ password: e.currentTarget.value })
            },
            void 0,
            !1,
            {
              fileName: "app/routes/host.tsx",
              lineNumber: 310,
              columnNumber: 8
            },
            this
          ),
          /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(
            "button",
            {
              "data-cy": "host-form-submit",
              className: "form-input mt-4 text-lg md:text-xl xl:text-2xl rounded-lg border-[1px] px-5 py-3 border-main-color hover:shadow-around text-shadow",
              type: "submit",
              onClick: handleSubmit,
              children: "Create your party"
            },
            void 0,
            !1,
            {
              fileName: "app/routes/host.tsx",
              lineNumber: 318,
              columnNumber: 8
            },
            this
          )
        ] }, void 0, !0, {
          fileName: "app/routes/host.tsx",
          lineNumber: 262,
          columnNumber: 7
        }, this)
      },
      void 0,
      !1,
      {
        fileName: "app/routes/host.tsx",
        lineNumber: 243,
        columnNumber: 4
      },
      this
    ),
    /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(import_react_toastify5.ToastContainer, {}, void 0, !1, {
      fileName: "app/routes/host.tsx",
      lineNumber: 330,
      columnNumber: 4
    }, this)
  ] }, void 0, !0, {
    fileName: "app/routes/host.tsx",
    lineNumber: 241,
    columnNumber: 3
  }, this);
}
function ErrorBoundary2() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "error-container", children: "An error has occured while creating a party." }, void 0, !1, {
    fileName: "app/routes/host.tsx",
    lineNumber: 337,
    columnNumber: 3
  }, this);
}
function CatchBoundary() {
  let caught = (0, import_react17.useCatch)(), params = (0, import_react17.useParams)();
  if (caught.status === 404)
    return /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("div", { className: "error-container", children: `[${caught.status}] ${caught.data} (${params.roomID})` }, void 0, !1, {
      fileName: "app/routes/host.tsx",
      lineNumber: 349,
      columnNumber: 4
    }, this);
  throw new Error(`Unhandled error: ${caught.status} ${caught.data} ${params.roomID}`);
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { entry: { module: "/build/entry.client-6EHI2XZS.js", imports: ["/build/_shared/chunk-ABQ3UCFU.js", "/build/_shared/chunk-QJIVJGGC.js", "/build/_shared/chunk-EDQRRRFQ.js", "/build/_shared/chunk-3PUPADQ7.js", "/build/_shared/chunk-MS7JXHIA.js", "/build/_shared/chunk-4LC45B2F.js", "/build/_shared/chunk-J7D7NKIA.js", "/build/_shared/chunk-RODUX5XG.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-JAE4VZ5R.js", imports: ["/build/_shared/chunk-FV3MF4NF.js", "/build/_shared/chunk-TMJLOEVS.js", "/build/_shared/chunk-DUKFR7TL.js"], hasAction: !0, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !0 }, "routes/auth_spotify": { id: "routes/auth_spotify", parentId: "root", path: "auth_spotify", index: void 0, caseSensitive: void 0, module: "/build/routes/auth_spotify-4BTAEDAI.js", imports: ["/build/_shared/chunk-PBTJHL5C.js"], hasAction: !0, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/client": { id: "routes/client", parentId: "root", path: "client", index: void 0, caseSensitive: void 0, module: "/build/routes/client-LZLJZFGE.js", imports: ["/build/_shared/chunk-PE7EVJAX.js", "/build/_shared/chunk-PBTJHL5C.js"], hasAction: !0, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/host": { id: "routes/host", parentId: "root", path: "host", index: void 0, caseSensitive: void 0, module: "/build/routes/host-OTPK6YZY.js", imports: ["/build/_shared/chunk-PE7EVJAX.js", "/build/_shared/chunk-PBTJHL5C.js"], hasAction: !0, hasLoader: !0, hasCatchBoundary: !0, hasErrorBoundary: !0 }, "routes/index": { id: "routes/index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/index-EIEBLZJF.js", imports: ["/build/_shared/chunk-PBTJHL5C.js"], hasAction: !0, hasLoader: !1, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/room.$roomID": { id: "routes/room.$roomID", parentId: "root", path: "room/:roomID", index: void 0, caseSensitive: void 0, module: "/build/routes/room.$roomID-P3RNG24D.js", imports: ["/build/_shared/chunk-PE7EVJAX.js", "/build/_shared/chunk-PBTJHL5C.js"], hasAction: !0, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 } }, version: "8d6ecf39", hmr: { runtime: "/build/_shared/chunk-3PUPADQ7.js", timestamp: 1714842627378 }, url: "/build/manifest-8D6ECF39.js" };

// server-entry-module:@remix-run/dev/server-build
var assetsBuildDirectory = "public/build", future = { v2_dev: !0, unstable_postcss: !1, unstable_tailwind: !1, v2_errorBoundary: !0, v2_headers: !0, v2_meta: !0, v2_normalizeFormMethod: !0, v2_routeConvention: !0 }, publicPath = "/build/", entry = { module: entry_server_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/auth_spotify": {
    id: "routes/auth_spotify",
    parentId: "root",
    path: "auth_spotify",
    index: void 0,
    caseSensitive: void 0,
    module: auth_spotify_exports
  },
  "routes/room.$roomID": {
    id: "routes/room.$roomID",
    parentId: "root",
    path: "room/:roomID",
    index: void 0,
    caseSensitive: void 0,
    module: room_roomID_exports
  },
  "routes/client": {
    id: "routes/client",
    parentId: "root",
    path: "client",
    index: void 0,
    caseSensitive: void 0,
    module: client_exports
  },
  "routes/index": {
    id: "routes/index",
    parentId: "root",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: routes_exports
  },
  "routes/host": {
    id: "routes/host",
    parentId: "root",
    path: "host",
    index: void 0,
    caseSensitive: void 0,
    module: host_exports
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  assets,
  assetsBuildDirectory,
  entry,
  future,
  publicPath,
  routes
});
//# sourceMappingURL=index.js.map
