import {
  Link,
  useLocation
} from "/build/_shared/chunk-EDQRRRFQ.js";
import {
  createHotContext
} from "/build/_shared/chunk-3PUPADQ7.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-4LC45B2F.js";
import {
  __commonJS,
  __toESM
} from "/build/_shared/chunk-RODUX5XG.js";

// empty-module:~/server/session.server
var require_session = __commonJS({
  "empty-module:~/server/session.server"(exports, module) {
    module.exports = {};
  }
});

// app/components/title.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime());
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/title.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/title.tsx"
  );
  import.meta.hot.lastModified = "1702628822321.2346";
}
function Title() {
  _s();
  const location = useLocation();
  const defaultStyle = "z-10 font-kaushan text-shadow font-bold text-2xl md:text-3xl xl:text-5xl";
  const topLeftStyle = "z-10 font-kaushan text-shadow font-bold text-2xl md:text-3xl xl:text-5xl absolute top-0 left-0 p-8";
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { "data-cy": "home-btn", className: location.pathname == "/" ? defaultStyle : topLeftStyle, to: "/", children: "Sharify" }, void 0, false, {
    fileName: "app/components/title.tsx",
    lineNumber: 28,
    columnNumber: 10
  }, this);
}
_s(Title, "pkHmaVRPskBaU4tMJuJJpV42k1I=", false, function() {
  return [useLocation];
});
_c = Title;
var _c;
$RefreshReg$(_c, "Title");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  Title,
  require_session
};
//# sourceMappingURL=/build/_shared/chunk-PBTJHL5C.js.map
