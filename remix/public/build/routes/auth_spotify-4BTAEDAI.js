import {
  require_node
} from "/build/_shared/chunk-TMJLOEVS.js";
import {
  Title,
  require_session
} from "/build/_shared/chunk-PBTJHL5C.js";
import {
  Link,
  useLoaderData,
  useOutletContext,
  useSubmit
} from "/build/_shared/chunk-EDQRRRFQ.js";
import {
  createHotContext
} from "/build/_shared/chunk-3PUPADQ7.js";
import "/build/_shared/chunk-MS7JXHIA.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-4LC45B2F.js";
import {
  require_react
} from "/build/_shared/chunk-J7D7NKIA.js";
import {
  __toESM
} from "/build/_shared/chunk-RODUX5XG.js";

// app/routes/auth_spotify.tsx
var import_node = __toESM(require_node());
var import_react = __toESM(require_react());
var import_session = __toESM(require_session());
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime());
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/auth_spotify.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/auth_spotify.tsx"
  );
  import.meta.hot.lastModified = "1712663727384.291";
}
function Auth_Spotify() {
  _s();
  const loaderData = useLoaderData();
  const {
    spotify
  } = useOutletContext();
  const submit = useSubmit();
  const [text, setText] = (0, import_react.useState)("");
  const [fetched, setFetched] = (0, import_react.useState)(false);
  const [isReady, setIsReady] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    if (spotify == null)
      return;
    const interval = setInterval(() => {
      if (spotify.is_ready) {
        setIsReady(true);
        clearInterval(interval);
      }
    }, 5e3);
    return () => clearInterval(interval);
  }, [spotify]);
  (0, import_react.useEffect)(() => {
    if (fetched || spotify == null)
      return;
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    const error = params.get("error");
    if (code) {
      setFetched(true);
      return spotify.FetchAccessToken(code);
    }
    if (error) {
      setFetched(true);
      return setText(`Error: ${error}`);
    }
    if (loaderData && loaderData.SpotifyTokens) {
      const expires_in = (loaderData.SpotifyTokens.ein > 0 && loaderData.SpotifyTokens.ein <= 3600 ? loaderData.SpotifyTokens.ein : 3600) * 1e3;
      const msDiff = loaderData.SpotifyTokens.date + expires_in - Date.now();
      if (msDiff > 0) {
        setFetched(true);
        return spotify.ProcessTokens({
          access_token: loaderData.SpotifyTokens.sat,
          refresh_token: loaderData.SpotifyTokens.srt,
          expires_in: loaderData.SpotifyTokens.ein,
          created_at: loaderData.SpotifyTokens.date
        });
      }
    }
    (async () => {
      const url = await spotify.GenerateAuthLink();
      if (url instanceof Error) {
        console.error(error);
        setText(`Error: ${error}`);
        return;
      }
      location.replace(url);
    })();
  }, [loaderData, fetched, spotify]);
  (0, import_react.useEffect)(() => {
    if (isReady) {
      (async () => {
        setFetched(true);
        const profile = await spotify.GetProfile();
        if (!(profile instanceof Error)) {
          setText(`Successfully connected to ${profile.display_name}`);
        }
        const tokens = spotify.GetTokens();
        setTimeout(() => {
          submit({
            spotifyTokens: JSON.stringify({
              sat: tokens.accessToken,
              srt: tokens.refreshToken,
              ein: tokens.expires_in,
              date: tokens.date
            })
          }, {
            method: "post"
          });
        }, 1e3);
      })();
    }
  }, [isReady, submit]);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-col items-center justify-center content-center h-screen text-main-color font-semibold", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Title, {}, void 0, false, {
      fileName: "app/routes/auth_spotify.tsx",
      lineNumber: 126,
      columnNumber: 13
    }, this),
    text != "" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: "/host", className: "text-4xl", "data-cy": "auth-text", children: text }, void 0, false, {
      fileName: "app/routes/auth_spotify.tsx",
      lineNumber: 127,
      columnNumber: 27
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "loader" }, void 0, false, {
      fileName: "app/routes/auth_spotify.tsx",
      lineNumber: 127,
      columnNumber: 101
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/auth_spotify.tsx",
    lineNumber: 125,
    columnNumber: 10
  }, this);
}
_s(Auth_Spotify, "aCroYVKnEj/nwyoO2my5A1A5zlk=", false, function() {
  return [useLoaderData, useOutletContext, useSubmit];
});
_c = Auth_Spotify;
var _c;
$RefreshReg$(_c, "Auth_Spotify");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Auth_Spotify as default
};
//# sourceMappingURL=/build/routes/auth_spotify-4BTAEDAI.js.map
