import {
  require_handlers
} from "/build/_shared/chunk-PE7EVJAX.js";
import {
  require_node
} from "/build/_shared/chunk-TMJLOEVS.js";
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
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useNavigate,
  useOutletContext,
  useParams,
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
  __commonJS,
  __toESM
} from "/build/_shared/chunk-RODUX5XG.js";

// empty-module:~/server/api.server
var require_api = __commonJS({
  "empty-module:~/server/api.server"(exports, module) {
    module.exports = {};
  }
});

// app/routes/host.tsx
var import_node = __toESM(require_node());
var import_react2 = __toESM(require_react());
var import_handlers = __toESM(require_handlers());
var import_api = __toESM(require_api());
var import_session = __toESM(require_session());
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime());
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/host.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
var _s2 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/host.tsx"
  );
  import.meta.hot.lastModified = "1708950261968.652";
}
function Host() {
  _s();
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const {
    spotify,
    username: contextUsername
  } = useOutletContext();
  const submit = useSubmit();
  const navigate = useNavigate();
  const formRef = (0, import_react2.useRef)(null);
  const [connectedTo, setConnectedTo] = (0, import_react2.useState)({
    spotify: false
  });
  const [dataToSend, setDataToSend] = (0, import_react2.useState)("");
  const [formState, setFormState] = (0, import_react2.useReducer)((state, newState) => {
    setDataToSend(JSON.stringify({
      ...state,
      ...newState
    }));
    return {
      ...state,
      ...newState
    };
  }, {
    username: "",
    name: "",
    isPrivate: false,
    password: "",
    type: null,
    sat: "",
    srt: "",
    sd: 0,
    sdate: 0
  });
  (0, import_react2.useEffect)(() => {
    let toast_id;
    console.log(spotify);
    if (!spotify)
      return;
    console.log(spotify);
    if (spotify.is_ready) {
      (async () => {
        const profile = await spotify.GetProfile();
        if (!(profile instanceof Error)) {
          toast_id = Q(`[Spotify] Connected as ${profile.display_name}`, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light"
          });
        }
        setFormState({
          sat: loaderData.spotifyTokens.sat,
          srt: loaderData.spotifyTokens.srt,
          sd: loaderData.spotifyTokens.ein,
          sdate: loaderData.spotifyTokens.date,
          username: contextUsername,
          name: `${contextUsername}'s party`,
          type: "Spotify"
        });
        setConnectedTo((prev) => ({
          ...prev,
          spotify: true
        }));
      })();
    } else if (GetStorageValue("st") != null && !spotify.is_ready) {
      (async () => {
        const profile = await spotify.GetProfile();
        if (!(profile instanceof Error)) {
          toast_id = Q(`[Spotify] Connected as ${profile.display_name}`, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light"
          });
        }
        setFormState({
          sat: loaderData.spotifyTokens.sat,
          srt: loaderData.spotifyTokens.srt,
          sd: loaderData.spotifyTokens.ein,
          sdate: loaderData.spotifyTokens.date,
          username: contextUsername,
          name: `${contextUsername}'s party`,
          type: "Spotify"
        });
        setConnectedTo((prev) => ({
          ...prev,
          spotify: true
        }));
      })();
    }
    return () => Q.dismiss(toast_id);
  }, [spotify]);
  (0, import_react2.useEffect)(() => {
    if (actionData == null ? void 0 : actionData.errorMessage) {
      const _toast = Q.error(actionData.errorMessage, {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark"
      });
      return () => Q.isActive(_toast) ? Q.dismiss(_toast) : void 0;
    }
  }, [actionData]);
  const checkFormInputs = () => {
    if (formState.name == "" || formState.type == null || formState.isPrivate && formState.password == "" || formState.username.trim() == "") {
      return false;
    }
    return true;
  };
  const handleSubmit = () => {
    if (checkFormInputs() && formRef.current) {
      submit(formRef.current, {
        method: "post"
      });
    } else {
      Q.error("Error: Missing fields", {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark"
      });
    }
  };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", { className: "h-screen", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Title, {}, void 0, false, {
      fileName: "app/routes/host.tsx",
      lineNumber: 212,
      columnNumber: 4
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Form, { ref: formRef, className: "flex flex-col justify-center items-center content-center h-full gap-y-6", onSubmit: (e) => e.preventDefault(), children: formState.type == null ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-2xl", children: "Party type" }, void 0, false, {
        fileName: "app/routes/host.tsx",
        lineNumber: 215,
        columnNumber: 8
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-row gap-x-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { className: "text-xl px-5 py-2 rounded-3xl bg-bg-color text-main-color border-[1px] border-main-color transition-all duration-300 " + (formState.type == "Spotify" ? "text-[white] shadow-backRight shadow-main-color scale-105" : ""), onClick: () => connectedTo.spotify ? setFormState({
        type: "Spotify"
      }) : navigate("/auth_spotify"), children: "Connect to Spotify" }, void 0, false, {
        fileName: "app/routes/host.tsx",
        lineNumber: 217,
        columnNumber: 9
      }, this) }, void 0, false, {
        fileName: "app/routes/host.tsx",
        lineNumber: 216,
        columnNumber: 8
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/host.tsx",
      lineNumber: 214,
      columnNumber: 31
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-row", children: formState.type == "Spotify" ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("i", { className: "fab fa-spotify text-3xl text-[currentColor]" }, void 0, false, {
        fileName: "app/routes/host.tsx",
        lineNumber: 225,
        columnNumber: 40
      }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("i", { className: "fab fa-youtube text-3xl text-[currentColor]" }, void 0, false, {
        fileName: "app/routes/host.tsx",
        lineNumber: 225,
        columnNumber: 106
      }, this) }, void 0, false, {
        fileName: "app/routes/host.tsx",
        lineNumber: 224,
        columnNumber: 8
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "srt", value: formState.srt }, void 0, false, {
        fileName: "app/routes/host.tsx",
        lineNumber: 227,
        columnNumber: 8
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "sat", value: formState.sat }, void 0, false, {
        fileName: "app/routes/host.tsx",
        lineNumber: 228,
        columnNumber: 8
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "data", value: dataToSend }, void 0, false, {
        fileName: "app/routes/host.tsx",
        lineNumber: 229,
        columnNumber: 8
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { "data-cy": "host-form-username", autoFocus: true, className: "form-input", type: "text", maxLength: 20, placeholder: "Username", spellCheck: false, defaultValue: formState.username, onChange: (e) => setFormState({
        username: e.currentTarget.value == "" ? "Guest" : e.currentTarget.value,
        name: `${e.currentTarget.value}'s party`
      }) }, void 0, false, {
        fileName: "app/routes/host.tsx",
        lineNumber: 230,
        columnNumber: 8
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { "data-cy": "host-form-party-name", className: "form-input", type: "text", maxLength: 20, placeholder: "Party's name", spellCheck: false, value: formState.name, onChange: (e) => setFormState({
        name: e.currentTarget.value
      }) }, void 0, false, {
        fileName: "app/routes/host.tsx",
        lineNumber: 234,
        columnNumber: 8
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-2xl", children: "Is the party private ?" }, void 0, false, {
        fileName: "app/routes/host.tsx",
        lineNumber: 237,
        columnNumber: 8
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-row gap-x-4", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { "data-cy": "host-form-make-private", className: "text-xl px-5 py-2 rounded-3xl bg-bg-color text-main-color border-[1px] border-main-color transition-all duration-300 " + (formState.isPrivate ? "text-[white] shadow-around shadow-main-color scale-105" : ""), onClick: () => !formState.isPrivate ? setFormState({
          isPrivate: true,
          password: ""
        }) : null, children: "Yes" }, void 0, false, {
          fileName: "app/routes/host.tsx",
          lineNumber: 239,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { "data-cy": "host-form-make-public", className: "text-xl px-5 py-2 rounded-3xl bg-bg-color text-main-color border-[1px] border-main-color transition-all duration-300 " + (!formState.isPrivate ? "text-[white] shadow-inner shadow-main-color scale-105" : ""), onClick: () => formState.isPrivate ? setFormState({
          isPrivate: false,
          password: ""
        }) : null, children: "No" }, void 0, false, {
          fileName: "app/routes/host.tsx",
          lineNumber: 245,
          columnNumber: 9
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/host.tsx",
        lineNumber: 238,
        columnNumber: 8
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { "data-cy": "host-form-party-password", className: formState.isPrivate ? "form-input block" : "hidden", type: "password", name: "password", placeholder: "Password", onChange: (e) => setFormState({
        password: e.currentTarget.value
      }) }, void 0, false, {
        fileName: "app/routes/host.tsx",
        lineNumber: 252,
        columnNumber: 8
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { "data-cy": "host-form-submit", className: "form-input mt-4 text-lg md:text-xl xl:text-2xl rounded-lg border-[1px] px-5 py-3 border-main-color hover:shadow-around text-shadow", type: "submit", onClick: handleSubmit, children: "Create your party" }, void 0, false, {
        fileName: "app/routes/host.tsx",
        lineNumber: 255,
        columnNumber: 8
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/host.tsx",
      lineNumber: 223,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "app/routes/host.tsx",
      lineNumber: 213,
      columnNumber: 4
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(k, {}, void 0, false, {
      fileName: "app/routes/host.tsx",
      lineNumber: 260,
      columnNumber: 4
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/host.tsx",
    lineNumber: 211,
    columnNumber: 10
  }, this);
}
_s(Host, "5/XH8cZWf7uYGR8qKBaGidnck1k=", false, function() {
  return [useLoaderData, useActionData, useOutletContext, useSubmit, useNavigate];
});
_c = Host;
function ErrorBoundary() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "error-container", children: `An error has occured while creating a party.` }, void 0, false, {
    fileName: "app/routes/host.tsx",
    lineNumber: 268,
    columnNumber: 10
  }, this);
}
_c2 = ErrorBoundary;
function CatchBoundary() {
  _s2();
  const caught = useCatch();
  const params = useParams();
  if (caught.status === 404) {
    return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "error-container", children: `[${caught.status}] ${caught.data} (${params.roomID})` }, void 0, false, {
      fileName: "app/routes/host.tsx",
      lineNumber: 278,
      columnNumber: 12
    }, this);
  }
  throw new Error(`Unhandled error: ${caught.status} ${caught.data} ${params.roomID}`);
}
_s2(CatchBoundary, "p0UCOvtWXqbV+0x8cNLYzbjGkIo=", false, function() {
  return [useCatch, useParams];
});
_c3 = CatchBoundary;
var _c;
var _c2;
var _c3;
$RefreshReg$(_c, "Host");
$RefreshReg$(_c2, "ErrorBoundary");
$RefreshReg$(_c3, "CatchBoundary");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  CatchBoundary,
  ErrorBoundary,
  Host as default
};
//# sourceMappingURL=/build/routes/host-OTPK6YZY.js.map
