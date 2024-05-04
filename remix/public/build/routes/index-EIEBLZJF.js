import {
  SpotifyHandler
} from "/build/_shared/chunk-FV3MF4NF.js";
import {
  GetStorageValue,
  Q,
  k
} from "/build/_shared/chunk-DUKFR7TL.js";
import {
  Title,
  require_session
} from "/build/_shared/chunk-PBTJHL5C.js";
import {
  Link,
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

// app/routes/index.tsx
var import_react = __toESM(require_react());
var import_session = __toESM(require_session());
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime());
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/index.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/index.tsx"
  );
  import.meta.hot.lastModified = "1708949685558.6482";
}
function Index() {
  _s();
  const {
    spotify
  } = useOutletContext();
  const submit = useSubmit();
  const [spotifyUser, setSpotifyUser] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    if (!spotify)
      return;
    if (spotify.is_ready) {
      (async () => {
        const profile = await spotify.GetProfile();
        if (!(profile instanceof Error)) {
          setSpotifyUser(profile);
        }
      })();
    } else if (GetStorageValue("st") != null && !spotify.is_ready) {
      (async () => {
        const profile = await spotify.GetProfile();
        if (!(profile instanceof Error)) {
          setSpotifyUser(profile);
        }
      })();
    }
  }, [spotify]);
  const handleSpotifyDisconnect = () => {
    Q(`[Spotify] Disconnected from ${spotifyUser == null ? void 0 : spotifyUser.display_name} !`, {
      position: "bottom-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light"
    });
    submit({
      DeleteSpotifyTokens: "true"
    }, {
      method: "post"
    });
    SpotifyHandler.Disconnect();
    setSpotifyUser(null);
  };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("nav", { className: "fixed top-0 left-0 h-14 w-screen" }, void 0, false, {
      fileName: "app/routes/index.tsx",
      lineNumber: 83,
      columnNumber: 4
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "h-screen flex flex-col justify-center items-center content-center gap-y-4 md:gap-y-6 xl:gap-y-9", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Title, {}, void 0, false, {
        fileName: "app/routes/index.tsx",
        lineNumber: 87,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { className: "duration-300 p-main-btn md:t-main-btn xl:main-btn hover:shadow-around hover:shadow-main-color hover:border-bg-color", to: "/host", "data-cy": "host-link", children: "Host" }, void 0, false, {
        fileName: "app/routes/index.tsx",
        lineNumber: 88,
        columnNumber: 5
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { className: "duration-300 p-main-btn md:t-main-btn xl:main-btn hover:shadow-around hover:shadow-main-color hover:border-bg-color", to: "/client", "data-cy": "client-link", children: "Client" }, void 0, false, {
        fileName: "app/routes/index.tsx",
        lineNumber: 91,
        columnNumber: 5
      }, this),
      spotifyUser ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { "data-cy": "horizontal-bar", className: "border-t-[1px] border-indigo-700 w-[20%]" }, void 0, false, {
        fileName: "app/routes/index.tsx",
        lineNumber: 94,
        columnNumber: 20
      }, this) : null,
      spotifyUser ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { className: "duration-300 p-main-btn md:t-main-btn xl:main-btn hover:shadow-around hover:shadow-main-color hover:border-bg-color", onClick: handleSpotifyDisconnect, "data-cy": "disconnect-btn", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-xl xl:text-2xl", children: `Disconnect from ${spotifyUser.display_name}` }, void 0, false, {
        fileName: "app/routes/index.tsx",
        lineNumber: 96,
        columnNumber: 7
      }, this) }, void 0, false, {
        fileName: "app/routes/index.tsx",
        lineNumber: 95,
        columnNumber: 20
      }, this) : null
    ] }, void 0, true, {
      fileName: "app/routes/index.tsx",
      lineNumber: 86,
      columnNumber: 4
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(k, {}, void 0, false, {
      fileName: "app/routes/index.tsx",
      lineNumber: 99,
      columnNumber: 4
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/index.tsx",
    lineNumber: 82,
    columnNumber: 10
  }, this);
}
_s(Index, "WLFjkMqv8SEmq9DW5/uw3qc3ivA=", false, function() {
  return [useOutletContext, useSubmit];
});
_c = Index;
var _c;
$RefreshReg$(_c, "Index");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Index as default
};
//# sourceMappingURL=/build/routes/index-EIEBLZJF.js.map
