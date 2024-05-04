import {
  SpotifyHandler
} from "/build/_shared/chunk-FV3MF4NF.js";
import {
  require_handlers
} from "/build/_shared/chunk-PE7EVJAX.js";
import {
  require_node
} from "/build/_shared/chunk-TMJLOEVS.js";
import {
  Q,
  k
} from "/build/_shared/chunk-DUKFR7TL.js";
import {
  Title,
  require_session
} from "/build/_shared/chunk-PBTJHL5C.js";
import {
  Form,
  useActionData,
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

// app/routes/client.tsx
var import_react = __toESM(require_react());
var import_node = __toESM(require_node());
var import_handlers = __toESM(require_handlers());
var import_session = __toESM(require_session());
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime());
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/client.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
var _s2 = $RefreshSig$();
var _s3 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/client.tsx"
  );
  import.meta.hot.lastModified = "1702630583677.9128";
}
function Client() {
  _s();
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const context = useOutletContext();
  const submit = useSubmit();
  const [parties, setParties] = (0, import_react.useState)([]);
  const [showUP, setShowUP] = (0, import_react.useState)(false);
  const [showPP, setShowPP] = (0, import_react.useState)(false);
  const [username, setUsername] = (0, import_react.useState)("");
  const [password, setPassword] = (0, import_react.useState)("");
  const [partyData, setPartyData] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    if (loaderData.parties) {
      setParties(loaderData.parties.filter((party) => !party.bannedClients.includes(context.username)));
    }
    if (SpotifyHandler.isReady && !SpotifyHandler.isOwner) {
      submit({
        DeleteSpotifyTokens: "true"
      }, {
        method: "post"
      });
    }
    setUsername(context.username);
  }, [loaderData]);
  (0, import_react.useEffect)(() => {
    if (actionData && actionData.errorMessage) {
      const _toast = Q.error(actionData.errorMessage, {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark"
      });
      setUsername("");
      setPassword("");
      return () => Q.isActive(_toast) ? Q.dismiss(_toast) : void 0;
    }
  }, [actionData]);
  (0, import_react.useEffect)(() => {
    if (!showUP && !showPP && partyData != null && (username.trim() != "" || password != "")) {
      handleJoin(partyData.id, partyData.isPrivate);
    }
  }, [showUP, showPP]);
  const handleJoin = (id, isPrivate) => {
    setPartyData({
      id,
      isPrivate
    });
    if (!username || username.trim() == "") {
      setShowUP(true);
      return;
    }
    if (isPrivate && password == "") {
      setShowPP(true);
      return;
    }
    submit({
      username,
      partyID: String(id),
      partyPwd: password
    }, {
      method: "post"
    });
  };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Title, {}, void 0, false, {
      fileName: "app/routes/client.tsx",
      lineNumber: 156,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", { className: "h-screen", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { "data-cy": "div-rooms-array", className: "relative m-auto mt-28 w-3/5 h-3/5 flex flex-col overflow-y-scroll border-[1px] border-main-color-hover rounded-lg shadow-around", children: [
      parties && parties.length > 0 ? parties.map((party) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Form, { "data-cy": "client-form-room", onClick: () => handleJoin(party.id, party.isPrivate), className: "cursor-pointer flex flex-row justify-center text-2xl py-4 border-b-[1px] duration-300 hover:text-slate-400" + (party.id % 2 == 0 ? " text-indigo-600" : ""), children: [
        `[${party.id}] ${party.name} | ${party.clients.length}/${party.MAX_CLIENTS} | `,
        party.type == "Spotify" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("i", { className: "fab fa-spotify pl-2.5 pr-1 mt-1 text-[currentColor]" }, void 0, false, {
          fileName: "app/routes/client.tsx",
          lineNumber: 161,
          columnNumber: 56
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("i", { className: "fab fa-youtube pl-2.5 pr-1 mt-1 text-[currentColor]" }, void 0, false, {
          fileName: "app/routes/client.tsx",
          lineNumber: 161,
          columnNumber: 130
        }, this),
        party.isPrivate ? " | " : "",
        party.isPrivate ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("i", { className: "fas fa-lock pl-2.5 mt-[.15rem] text-[currentColor]" }, void 0, false, {
          fileName: "app/routes/client.tsx",
          lineNumber: 163,
          columnNumber: 48
        }, this) : ""
      ] }, party.id, true, {
        fileName: "app/routes/client.tsx",
        lineNumber: 159,
        columnNumber: 75
      }, this)) : null,
      loaderData && loaderData.parties && loaderData.parties.length == 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-center text-3xl m-auto", children: "No parties found" }, void 0, false, {
        fileName: "app/routes/client.tsx",
        lineNumber: 165,
        columnNumber: 91
      }, this) : null,
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PasswordPopup, { display: showPP, setDisplay: setShowPP, setPassword }, void 0, false, {
        fileName: "app/routes/client.tsx",
        lineNumber: 166,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(UsernamePopup, { display: showUP, setDisplay: setShowUP, username, setUsername }, void 0, false, {
        fileName: "app/routes/client.tsx",
        lineNumber: 167,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/client.tsx",
      lineNumber: 158,
      columnNumber: 17
    }, this) }, void 0, false, {
      fileName: "app/routes/client.tsx",
      lineNumber: 157,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(k, {}, void 0, false, {
      fileName: "app/routes/client.tsx",
      lineNumber: 170,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/client.tsx",
    lineNumber: 155,
    columnNumber: 10
  }, this);
}
_s(Client, "jy/CZtz6VcE6CvpquV4BD6lQ35w=", false, function() {
  return [useLoaderData, useActionData, useOutletContext, useSubmit];
});
_c = Client;
var UsernamePopup = (props) => {
  _s2();
  const {
    display,
    setDisplay,
    username,
    setUsername
  } = props;
  const inputRef = (0, import_react.useRef)(null);
  if (display) {
    setTimeout(() => {
      var _a;
      return (_a = inputRef.current) == null ? void 0 : _a.focus();
    }, 500);
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: `absolute top-0 left-0 h-full w-[100%] flex-col justify-center items-center gap-5 backdrop-blur-sm duration-300 ${display ? "flex" : "hidden"}`, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-center text-3xl", children: "First of all, you need to register your username" }, void 0, false, {
      fileName: "app/routes/client.tsx",
      lineNumber: 190,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { "data-cy": "client-username", ref: inputRef, type: "text", className: "form-input", placeholder: "Username", defaultValue: username, onChange: (e) => setUsername(e.target.value) }, void 0, false, {
      fileName: "app/routes/client.tsx",
      lineNumber: 191,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { "data-cy": "client-username-submit", className: "text-2xl", onClick: () => setDisplay(false), children: "Close" }, void 0, false, {
      fileName: "app/routes/client.tsx",
      lineNumber: 192,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/client.tsx",
    lineNumber: 189,
    columnNumber: 10
  }, this);
};
_s2(UsernamePopup, "iD9XNNsNOlNDckBemnvlLS+aHYk=");
_c2 = UsernamePopup;
var PasswordPopup = (props) => {
  _s3();
  const {
    display,
    setDisplay,
    setPassword
  } = props;
  const inputRef = (0, import_react.useRef)(null);
  if (display) {
    setTimeout(() => {
      var _a;
      return (_a = inputRef.current) == null ? void 0 : _a.focus();
    }, 500);
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: `absolute top-0 left-0 h-full w-[100%] flex-col justify-center items-center gap-5 backdrop-blur-sm duration-300 ${display ? "flex" : "hidden"}`, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-center text-3xl", children: "Type the correct Party password" }, void 0, false, {
      fileName: "app/routes/client.tsx",
      lineNumber: 209,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { "data-cy": "client-party-password", ref: inputRef, type: "password", className: "form-input w-full", placeholder: "Party password", onChange: (e) => setPassword(e.currentTarget.value) }, void 0, false, {
      fileName: "app/routes/client.tsx",
      lineNumber: 210,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { "data-cy": "client-party-password-submit", className: "text-2xl", onClick: () => setDisplay(false), children: "Close" }, void 0, false, {
      fileName: "app/routes/client.tsx",
      lineNumber: 211,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/client.tsx",
    lineNumber: 208,
    columnNumber: 10
  }, this);
};
_s3(PasswordPopup, "iD9XNNsNOlNDckBemnvlLS+aHYk=");
_c3 = PasswordPopup;
var _c;
var _c2;
var _c3;
$RefreshReg$(_c, "Client");
$RefreshReg$(_c2, "UsernamePopup");
$RefreshReg$(_c3, "PasswordPopup");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Client as default
};
//# sourceMappingURL=/build/routes/client-LZLJZFGE.js.map
