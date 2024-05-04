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
  FormatTime,
  GetStorageValue,
  Q,
  SetStorageValue,
  k,
  useDebounce
} from "/build/_shared/chunk-DUKFR7TL.js";
import {
  Title,
  require_session
} from "/build/_shared/chunk-PBTJHL5C.js";
import {
  Form,
  useFetcher,
  useLoaderData,
  useNavigate,
  useOutletContext
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

// app/routes/room.$roomID.tsx
var import_react4 = __toESM(require_react());
var import_node = __toESM(require_node());
var import_handlers = __toESM(require_handlers());
var import_session = __toESM(require_session());

// app/components/hostRoom.tsx
var import_react = __toESM(require_react());
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime());
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/hostRoom.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/hostRoom.tsx"
  );
  import.meta.hot.lastModified = "1702628822321.2346";
}
function HostRoom(props) {
  _s();
  const {
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
  } = props;
  const [showVolume, setShowVolume] = (0, import_react.useState)(false);
  const tracksQElements = [];
  tracksQueue.forEach((track, i) => {
    const owner = partyTracksQ.find((trackOwner) => trackOwner.trackId == track.id);
    tracksQElements.push(track.type == "episode" ? null : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "text-lg", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: `[${i + 1}]${owner ? ` (${owner.username})` : ""} ${track.name} - ${track.artists.map((a) => a.name).join(", ")}` }, void 0, false, {
      fileName: "app/components/hostRoom.tsx",
      lineNumber: 53,
      columnNumber: 17
    }, this) }, i, false, {
      fileName: "app/components/hostRoom.tsx",
      lineNumber: 52,
      columnNumber: 59
    }, this));
  });
  const handlePlay = () => {
    SpotifyHandler.Resume().then(() => FetchData(250)).catch(console.error);
  };
  const handlePause = () => {
    SpotifyHandler.Pause().then(() => FetchData(250)).catch(console.error);
  };
  const handleNext = () => {
    SpotifyHandler.SkipToNext().then(() => FetchData(500)).catch(console.error);
  };
  const handlePrevious = () => {
    if (durationMS - progressMS < durationMS / 2) {
      return SpotifyHandler.Seek(0).then(() => FetchData(500)).catch(console.error);
    }
    SpotifyHandler.SkipToPrevious().then(() => FetchData(500)).catch(console.error);
  };
  const handleSeek = (e) => {
    setRoomData({
      seekPos: parseInt(e.target.value)
    });
    FetchData(1e3);
  };
  const setSpotifyDevice = (device) => {
    SpotifyHandler.SetDevice(device);
    SetStorageValue({
      SpotifyDevice: JSON.stringify(device)
    });
    fetcher.submit({
      type: "setSpotifyDevice",
      spotifyDevice: JSON.stringify(device)
    }, {
      method: "post"
    });
  };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("nav", { className: "absolute top-0 right-10 w-2/6 h-28 z-10 flex flex-row items-center justify-end content-center", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Form, { method: "post", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "username", value: username }, void 0, false, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 92,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "type", value: "deleteRoom" }, void 0, false, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 93,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { type: "submit", className: "text-2xl rounded-3xl w-36 border-2 duration-300 border-main-color hover:border-red-700 hover:text-red-700 hover:border-4 hover:scale-105", children: "Delete Room" }, void 0, false, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 94,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/hostRoom.tsx",
      lineNumber: 91,
      columnNumber: 17
    }, this) }, void 0, false, {
      fileName: "app/components/hostRoom.tsx",
      lineNumber: 90,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("section", { className: "scrollsnap-page", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-col items-center justify-center text-center w-10/12 m-auto my-28", children: [
      !currentDevice ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-2xl p-6", children: "Select a Device to use" }, void 0, false, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 102,
          columnNumber: 29
        }, this),
        devices.map((device) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { className: "text-2xl form-input rounded-xl", onClick: () => setSpotifyDevice(device), children: `${device.name} (${device.is_active ? "Active" : "Inactive"})` }, device.name, false, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 103,
          columnNumber: 52
        }, this))
      ] }, void 0, true, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 101,
        columnNumber: 39
      }, this) : null,
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-2xl p-6", children: title }, void 0, false, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 107,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-col gap-5 mb-5", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: FormatTime(progressMS, durationMS) }, void 0, false, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 109,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "range", min: 0, max: durationMS, defaultValue: progressMS, className: "accent-indigo-700", draggable: false, onChange: handleSeek }, void 0, false, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 110,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 108,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "scrollsnap-start-component flex flex-row items-center justify-center gap-x-10 py-6 border-y-[1px] border-main-color-hover w-full", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, { classStr: "fa-solid fa-backward-step", onClick: handlePrevious }, void 0, false, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 113,
          columnNumber: 25
        }, this),
        isPlaying ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, { classStr: "fa-solid fa-pause", onClick: handlePause }, void 0, false, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 114,
          columnNumber: 38
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, { classStr: "fa-solid fa-play", onClick: handlePlay }, void 0, false, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 114,
          columnNumber: 100
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, { classStr: "fa-solid fa-forward-step", onClick: handleNext }, void 0, false, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 115,
          columnNumber: 25
        }, this),
        volume >= 50 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, { onClick: () => setShowVolume((v) => !v), classStr: "fa-solid fa-volume-high" }, void 0, false, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 116,
          columnNumber: 41
        }, this) : null,
        volume < 50 && volume > 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, { onClick: () => setShowVolume((v) => !v), classStr: "fa-solid fa-volume-low" }, void 0, false, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 117,
          columnNumber: 54
        }, this) : null,
        volume == 0 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Icon, { onClick: () => setShowVolume((v) => !v), classStr: "fa-solid fa-volume-xmark" }, void 0, false, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 118,
          columnNumber: 40
        }, this) : null,
        showVolume ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-col text-center items-center justify-center", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-xl", children: [
            volume,
            " %"
          ] }, void 0, true, {
            fileName: "app/components/hostRoom.tsx",
            lineNumber: 120,
            columnNumber: 33
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "range", min: 0, max: 100, value: volume, className: "accent-main-color", onChange: (e) => setRoomData({
            volume: parseInt(e.currentTarget.value)
          }) }, void 0, false, {
            fileName: "app/components/hostRoom.tsx",
            lineNumber: 121,
            columnNumber: 33
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 119,
          columnNumber: 39
        }, this) : null
      ] }, void 0, true, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 112,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "scrollsnap-start-component flex flex-row w-full", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-col flex-wrap h-80 w-full", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-2xl", children: "Party members:" }, void 0, false, {
            fileName: "app/components/hostRoom.tsx",
            lineNumber: 128,
            columnNumber: 29
          }, this),
          clients.map((client) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-row flex-wrap gap-3 justify-center items-center max-w-[50%]", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: `input-form text-3xl ${client.isHost ? "text-main-color" : "text-indigo-700"}`, children: client.username }, void 0, false, {
              fileName: "app/components/hostRoom.tsx",
              lineNumber: 130,
              columnNumber: 37
            }, this),
            !client.isHost ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Form, { method: "post", children: [
                /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "username", value: client.username }, void 0, false, {
                  fileName: "app/components/hostRoom.tsx",
                  lineNumber: 135,
                  columnNumber: 49
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "type", value: "kick" }, void 0, false, {
                  fileName: "app/components/hostRoom.tsx",
                  lineNumber: 136,
                  columnNumber: 49
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { type: "submit", children: "Kick" }, void 0, false, {
                  fileName: "app/components/hostRoom.tsx",
                  lineNumber: 137,
                  columnNumber: 49
                }, this)
              ] }, void 0, true, {
                fileName: "app/components/hostRoom.tsx",
                lineNumber: 134,
                columnNumber: 45
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Form, { method: "post", children: [
                /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "username", value: client.username }, void 0, false, {
                  fileName: "app/components/hostRoom.tsx",
                  lineNumber: 140,
                  columnNumber: 49
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { type: "hidden", name: "type", value: "ban" }, void 0, false, {
                  fileName: "app/components/hostRoom.tsx",
                  lineNumber: 141,
                  columnNumber: 49
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { type: "submit", children: "Ban" }, void 0, false, {
                  fileName: "app/components/hostRoom.tsx",
                  lineNumber: 142,
                  columnNumber: 49
                }, this)
              ] }, void 0, true, {
                fileName: "app/components/hostRoom.tsx",
                lineNumber: 139,
                columnNumber: 45
              }, this)
            ] }, void 0, true, {
              fileName: "app/components/hostRoom.tsx",
              lineNumber: 133,
              columnNumber: 55
            }, this) : null
          ] }, client.username, true, {
            fileName: "app/components/hostRoom.tsx",
            lineNumber: 129,
            columnNumber: 52
          }, this))
        ] }, void 0, true, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 127,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-row justify-center items-center content-center text-center w-full gap-5 pb-5", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "w-full flex flex-col gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-2xl", children: "Coming next:" }, void 0, false, {
              fileName: "app/components/hostRoom.tsx",
              lineNumber: 149,
              columnNumber: 33
            }, this),
            tracksQElements.map((el) => el)
          ] }, void 0, true, {
            fileName: "app/components/hostRoom.tsx",
            lineNumber: 148,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "w-full flex flex-col gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-2xl", children: "Previously played:" }, void 0, false, {
              fileName: "app/components/hostRoom.tsx",
              lineNumber: 153,
              columnNumber: 33
            }, this),
            recentTracks.map((trackData, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "text-lg", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: `[${i + 1}] ${trackData.track.name} - ${trackData.track.artists.map((a) => a.name).join(", ")}` }, void 0, false, {
              fileName: "app/components/hostRoom.tsx",
              lineNumber: 155,
              columnNumber: 41
            }, this) }, i, false, {
              fileName: "app/components/hostRoom.tsx",
              lineNumber: 154,
              columnNumber: 69
            }, this))
          ] }, void 0, true, {
            fileName: "app/components/hostRoom.tsx",
            lineNumber: 152,
            columnNumber: 29
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 147,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 126,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "scrollsnap-end-component flex flex-col items-center justify-center content-center gap-2 border-t-[1px] border-main-color-hover w-full h-56", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "text-2xl", children: "Search a song to add to the queue:" }, void 0, false, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 163,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("input", { className: "rounded-lg outline-none", type: "text", name: "searchBar", onChange: (e) => setRoomData({
          searchInput: e.target.value
        }) }, void 0, false, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 164,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-row flex-wrap gap-5 justify-center overflow-y-scroll", children: searchResults.map((track) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { className: "border-[1px] border-[white] rounded-xl text-lg p-1 mt-4 hover:scale-105", onClick: () => addTrackToQueue(track), children: `${track.name} - ${track.artists.map((a) => a.name).join(", ")}` }, track.id, false, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 168,
          columnNumber: 57
        }, this)) }, void 0, false, {
          fileName: "app/components/hostRoom.tsx",
          lineNumber: 167,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/hostRoom.tsx",
        lineNumber: 162,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/hostRoom.tsx",
      lineNumber: 100,
      columnNumber: 17
    }, this) }, void 0, false, {
      fileName: "app/components/hostRoom.tsx",
      lineNumber: 99,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/hostRoom.tsx",
    lineNumber: 89,
    columnNumber: 10
  }, this);
}
_s(HostRoom, "7RAbUW9LFA3LxekzmPif0czGMFg=");
_c = HostRoom;
var _c;
$RefreshReg$(_c, "HostRoom");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/clientRoom.tsx
var import_jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime());
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/clientRoom.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/clientRoom.tsx"
  );
  import.meta.hot.lastModified = "1702628822321.2346";
}
function ClientRoom(props) {
  const {
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
  } = props;
  const tracksQElements = [];
  tracksQueue.forEach((track, i) => {
    const owner = partyTracksQ.find((trackOwner) => trackOwner.trackId == track.id);
    tracksQElements.push(track.type == "episode" ? null : /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "text-lg", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("span", { children: `[${i + 1}]${owner ? ` (${owner.username})` : ""} ${track.name} - ${track.artists.map((a) => a.name).join(", ")}` }, void 0, false, {
      fileName: "app/components/clientRoom.tsx",
      lineNumber: 40,
      columnNumber: 17
    }, this) }, i, false, {
      fileName: "app/components/clientRoom.tsx",
      lineNumber: 39,
      columnNumber: 59
    }, this));
  });
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_jsx_dev_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("nav", { className: "absolute top-0 right-10 w-2/6 h-28 z-10 flex flex-row items-center justify-end content-center", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Form, { method: "post", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("input", { type: "hidden", name: "username", value: username }, void 0, false, {
        fileName: "app/components/clientRoom.tsx",
        lineNumber: 46,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("input", { type: "hidden", name: "type", value: "leaveRoom" }, void 0, false, {
        fileName: "app/components/clientRoom.tsx",
        lineNumber: 47,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("button", { type: "submit", className: "text-2xl rounded-3xl w-36 border-2 duration-300 border-main-color hover:border-red-700 hover:text-red-700 hover:border-4 hover:scale-105", children: "Leave Room" }, void 0, false, {
        fileName: "app/components/clientRoom.tsx",
        lineNumber: 48,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/clientRoom.tsx",
      lineNumber: 45,
      columnNumber: 17
    }, this) }, void 0, false, {
      fileName: "app/components/clientRoom.tsx",
      lineNumber: 44,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("section", { className: "scrollsnap-page", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "flex flex-col items-center justify-center text-center w-10/12 m-auto my-28", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("span", { className: "text-2xl p-6", children: title }, void 0, false, {
        fileName: "app/components/clientRoom.tsx",
        lineNumber: 55,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "flex flex-col gap-5 mb-5", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("span", { children: FormatTime(progressMS, durationMS) }, void 0, false, {
          fileName: "app/components/clientRoom.tsx",
          lineNumber: 57,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("input", { type: "range", min: 0, max: durationMS, defaultValue: progressMS, className: "accent-indigo-700", draggable: false, onChange: (e) => e.target.value = String(progressMS) }, void 0, false, {
          fileName: "app/components/clientRoom.tsx",
          lineNumber: 58,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/clientRoom.tsx",
        lineNumber: 56,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "scrollsnap-end-component flex flex-row items-center justify-center gap-x-10 py-6 border-t-[1px] border-main-color-hover w-full", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "flex flex-col items-center justify-center content-center gap-2 w-full h-56 overflow-x-hidden", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("span", { className: "text-2xl", children: "Search a song to add to the queue:" }, void 0, false, {
            fileName: "app/components/clientRoom.tsx",
            lineNumber: 62,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("input", { className: "rounded-lg outline-none", type: "text", name: "searchBar", onChange: (e) => setRoomData({
            searchInput: e.target.value
          }) }, void 0, false, {
            fileName: "app/components/clientRoom.tsx",
            lineNumber: 63,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "flex flex-row flex-wrap gap-2 justify-center overflow-y-scroll", children: searchResults.map((track) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("button", { className: "border-[1px] border-[white] rounded-xl text-lg p-1 m-4 hover:scale-105", onClick: () => addTrackToQueue(track), children: `${track.name} - ${track.artists.map((a) => a.name).join(", ")}` }, track.id, false, {
            fileName: "app/components/clientRoom.tsx",
            lineNumber: 67,
            columnNumber: 61
          }, this)) }, void 0, false, {
            fileName: "app/components/clientRoom.tsx",
            lineNumber: 66,
            columnNumber: 29
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/clientRoom.tsx",
          lineNumber: 61,
          columnNumber: 25
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "flex flex-row justify-center items-center content-center text-center w-full gap-5 pb-5", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "w-full flex flex-col gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("span", { className: "text-2xl", children: "Coming next:" }, void 0, false, {
              fileName: "app/components/clientRoom.tsx",
              lineNumber: 74,
              columnNumber: 33
            }, this),
            tracksQElements.map((el) => el)
          ] }, void 0, true, {
            fileName: "app/components/clientRoom.tsx",
            lineNumber: 73,
            columnNumber: 29
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "w-full flex flex-col gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("span", { className: "text-2xl", children: "Previously played:" }, void 0, false, {
              fileName: "app/components/clientRoom.tsx",
              lineNumber: 78,
              columnNumber: 33
            }, this),
            recentTracks.map((trackData, i) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", { className: "text-lg", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("span", { children: `[${i + 1}] ${trackData.track.name} - ${trackData.track.artists.map((a) => a.name).join(", ")}` }, void 0, false, {
              fileName: "app/components/clientRoom.tsx",
              lineNumber: 80,
              columnNumber: 41
            }, this) }, i, false, {
              fileName: "app/components/clientRoom.tsx",
              lineNumber: 79,
              columnNumber: 69
            }, this))
          ] }, void 0, true, {
            fileName: "app/components/clientRoom.tsx",
            lineNumber: 77,
            columnNumber: 29
          }, this)
        ] }, void 0, true, {
          fileName: "app/components/clientRoom.tsx",
          lineNumber: 72,
          columnNumber: 25
        }, this)
      ] }, void 0, true, {
        fileName: "app/components/clientRoom.tsx",
        lineNumber: 60,
        columnNumber: 21
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/clientRoom.tsx",
      lineNumber: 54,
      columnNumber: 17
    }, this) }, void 0, false, {
      fileName: "app/components/clientRoom.tsx",
      lineNumber: 53,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/clientRoom.tsx",
    lineNumber: 43,
    columnNumber: 10
  }, this);
}
_c2 = ClientRoom;
var _c2;
$RefreshReg$(_c2, "ClientRoom");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/routes/room.$roomID.tsx
var import_jsx_dev_runtime3 = __toESM(require_jsx_dev_runtime());
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/room.$roomID.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s2 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/room.$roomID.tsx"
  );
  import.meta.hot.lastModified = "1707666133258.0908";
}
function Room() {
  var _a;
  _s2();
  const loaderData = useLoaderData();
  const {
    spotify: _spotify,
    username: contextUsername
  } = useOutletContext();
  const spotify = _spotify;
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [isAllowed, setIsAllowed] = (0, import_react4.useState)(true);
  const fetchDataTimeout = (0, import_react4.useRef)(null);
  const [fetchInterval, setFetchInterval] = (0, import_react4.useState)();
  const [syncInterval, setSyncInterval] = (0, import_react4.useState)();
  const [{
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
  }, setRoomData] = (0, import_react4.useReducer)((oldState, newState) => ({
    ...oldState,
    ...newState
  }), {
    title: "Loading...",
    volume: 99.9,
    progressMS: 0,
    durationMS: 0,
    isPlaying: false,
    recentTracks: [],
    partyTracksQ: [],
    searchInput: "",
    searchResults: [],
    clients: [],
    currentDevice: null,
    devices: [],
    seekPos: 0,
    tracksQueue: []
  });
  const debounceVolume = useDebounce(volume, 600);
  const debounceSearch = useDebounce(searchInput, 600);
  const debounceSeek = useDebounce(seekPos, 500);
  if ((_a = loaderData == null ? void 0 : loaderData.party) == null ? void 0 : _a.id) {
  }
  const FetchData = (0, import_react4.useCallback)((delay) => {
    if (fetchDataTimeout.current)
      clearTimeout(fetchDataTimeout.current);
    fetchDataTimeout.current = setTimeout(() => {
      (async () => {
        fetchDataTimeout.current = null;
        const [playbackData, recentTracks2, queueData] = await Promise.all([spotify.GetCurrentTrackData(), spotify.GetRecentlyPlayedTracks(5), spotify.GetCurrentQueueData()]);
        if (playbackData instanceof Error) {
          Q.error(`Error: Failed to fetch current track (${playbackData.message})`, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light"
          });
          console.error(playbackData.message);
          return;
        }
        if (recentTracks2 instanceof Error) {
          Q.error(`Error: Failed to fetch recent tracks (${recentTracks2.message})`, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light"
          });
          console.error(recentTracks2.message);
          return;
        }
        if (queueData instanceof Error) {
          Q.error(`Error: Failed to fetch tracks in queue (${queueData.message})`, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light"
          });
          console.error(queueData.message);
          return;
        }
        if (!playbackData || !playbackData.device.is_active) {
          const devices2 = await spotify.GetDevices();
          if (!(devices2 instanceof Error)) {
            setRoomData({
              currentDevice: null,
              devices: devices2
            });
          }
        }
        if (!playbackData) {
          return setRoomData({
            title: "Play a music on Spotify to start using Sharify"
          });
        }
        const currentTrack = playbackData.item;
        const recentArr = [];
        const queueArr = [];
        recentTracks2.forEach((track) => {
          if (!(track instanceof Error)) {
            recentArr.push(track);
          }
        });
        queueData.queue.forEach((track, i) => {
          if (i >= 5)
            return;
          queueArr.push(track);
        });
        if (!currentTrack)
          return console.error("Couldn't fetch current track");
        if (currentTrack.type == "episode")
          return setRoomData({
            title: currentTrack.name,
            recentTracks: recentArr,
            tracksQueue: queueArr,
            durationMS: currentTrack.duration_ms
          });
        return setRoomData({
          title: `${currentTrack.name} - ${currentTrack.artists.map((artist) => artist.name).join(", ")}`,
          recentTracks: recentArr,
          tracksQueue: queueArr,
          durationMS: currentTrack.duration_ms,
          progressMS: playbackData.progress_ms || 0,
          isPlaying: playbackData.is_playing,
          volume: playbackData.device.volume_percent || 50
        });
      })();
    }, delay || 500);
  }, [fetchDataTimeout, setRoomData]);
  (0, import_react4.useEffect)(() => {
    if (!isAllowed)
      return;
    const interval = setInterval(() => fetcher.submit({
      type: "fetchData",
      username: contextUsername,
      currentTrack: title
    }, {
      method: "post"
    }), 1e3);
    setFetchInterval(interval);
    const syncInterval2 = setInterval(() => FetchData(0), 1e4);
    setSyncInterval(syncInterval2);
    const timeout = setTimeout(() => FetchData(0), 1e3);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      clearInterval(syncInterval2);
    };
  }, [title]);
  (0, import_react4.useEffect)(() => {
    if (fetcher.data) {
      if (fetcher.data.isPartyDeleted) {
        const _toast = Q("The party has been deleted by the host!", {
          position: "bottom-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light"
        });
        const timeout = setTimeout(() => navigate("/"), 3e3);
        setIsAllowed(false);
        return () => {
          if (Q.isActive(_toast))
            Q.dismiss(_toast);
          clearTimeout(timeout);
        };
      }
      if (!fetcher.data.clients.find((client) => client.username == contextUsername)) {
        clearInterval(fetchInterval);
        clearInterval(syncInterval);
        setIsAllowed(false);
        const _toast = Q("You have been kicked of the room by the host!", {
          position: "bottom-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light"
        });
        const timeout = setTimeout(() => navigate("/client"), 3e3);
        return () => {
          if (Q.isActive(_toast))
            Q.dismiss(_toast);
          clearTimeout(timeout);
        };
      }
      setRoomData({
        partyTracksQ: fetcher.data.tracksQueue,
        clients: fetcher.data.clients
      });
    }
  }, [fetcher.data]);
  (0, import_react4.useEffect)(() => {
    if (!isPlaying)
      return;
    const timeout = setTimeout(() => {
      if (durationMS > 0 && progressMS >= durationMS) {
        clearTimeout(timeout);
        FetchData();
        return;
      }
      setRoomData({
        progressMS: progressMS + 1e3
      });
    }, 1e3);
    return () => clearTimeout(timeout);
  }, [progressMS, durationMS, setRoomData, isPlaying, FetchData]);
  (0, import_react4.useEffect)(() => {
    if (debounceVolume == 99.9)
      return;
    spotify.SetVolume(debounceVolume);
  }, [debounceVolume]);
  (0, import_react4.useEffect)(() => {
    if (debounceSearch.trim() == "")
      return;
    spotify.SearchTracks(debounceSearch).then((resp) => {
      var _a2;
      if (resp instanceof Error)
        return console.error(resp.message);
      setRoomData({
        searchResults: (_a2 = resp.tracks) == null ? void 0 : _a2.items
      });
    }).catch(console.error);
  }, [debounceSearch]);
  (0, import_react4.useEffect)(() => {
    if (debounceSeek == 0)
      return;
    spotify.Seek(debounceSeek);
  }, [debounceSeek]);
  (0, import_react4.useEffect)(() => {
    if (loaderData.errorMessage) {
      const _toast = Q.error(loaderData.errorMessage, {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light"
      });
      const timeout = setTimeout(() => navigate(loaderData.redirect || "/"), 3e3);
      setIsAllowed(false);
      return () => {
        if (Q.isActive(_toast))
          Q.dismiss(_toast);
        clearTimeout(timeout);
      };
    }
    SetStorageValue({
      st: {
        at: loaderData.party.spotifyCreds.accessToken,
        rt: loaderData.party.spotifyCreds.refreshToken,
        ein: loaderData.party.spotifyCreds.expiresIn,
        date: loaderData.party.spotifyCreds.date
      }
    });
    spotify.is_owner = loaderData.isHost;
    if (currentDevice)
      return;
    const spotifyDevice = GetStorageValue("SpotifyDevice");
    if (spotifyDevice) {
      const device = JSON.parse(spotifyDevice);
      setRoomData({
        currentDevice: device
      });
    } else if (spotify.current_device) {
      setRoomData({
        currentDevice: spotify.current_device
      });
    } else {
      (async () => {
        const devices2 = await spotify.GetDevices();
        if (devices2 instanceof Error) {
          Q.error(`Error: Failed to get devices (${devices2.message})`, {
            position: "bottom-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light"
          });
          return;
        }
        setRoomData({
          currentDevice: spotify.current_device,
          devices: devices2
        });
      })();
    }
  }, [loaderData, navigate]);
  const addTrackToQueue = (track) => {
    (async () => {
      const res = await spotify.AddNextTrack(track.external_urls.spotify);
      if (!(res instanceof Error)) {
        Q(`Added track ${track.name} - ${track.artists.map((a) => a.name).join(", ")} to queue !`, {
          position: "bottom-right",
          autoClose: 3e3,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light"
        });
      }
      fetcher.submit({
        type: "addToQueue",
        trackId: track.id,
        trackName: `${track.name} - ${track.artists.map((artist) => artist.name).join(", ")}`
      }, {
        method: "post"
      });
      setRoomData({
        searchResults: []
      });
    })();
  };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_jsx_dev_runtime3.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(Title, {}, void 0, false, {
      fileName: "app/routes/room.$roomID.tsx",
      lineNumber: 442,
      columnNumber: 13
    }, this),
    isAllowed ? loaderData.errorMessage ? null : loaderData.isHost ? /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(HostRoom, { fetcher, username: contextUsername, title, volume, setRoomData, isPlaying, durationMS, progressMS, FetchData, clients, recentTracks, tracksQueue, partyTracksQ, currentDevice, devices, searchResults, addTrackToQueue }, void 0, false, {
      fileName: "app/routes/room.$roomID.tsx",
      lineNumber: 443,
      columnNumber: 79
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(ClientRoom, { username: contextUsername, title, isPlaying, durationMS, progressMS, FetchData, recentTracks, tracksQueue, partyTracksQ, setRoomData, searchResults, addTrackToQueue }, void 0, false, {
      fileName: "app/routes/room.$roomID.tsx",
      lineNumber: 443,
      columnNumber: 499
    }, this) : null,
    /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(k, {}, void 0, false, {
      fileName: "app/routes/room.$roomID.tsx",
      lineNumber: 444,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/room.$roomID.tsx",
    lineNumber: 441,
    columnNumber: 10
  }, this);
}
_s2(Room, "MAVryHtsqDofr0zl1KvPSHXu03M=", false, function() {
  return [useLoaderData, useOutletContext, useFetcher, useNavigate, useDebounce, useDebounce, useDebounce];
});
_c3 = Room;
var Icon = (props) => {
  const {
    classStr,
    onClick
  } = props;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("div", { className: "flex text-center items-center justify-center cursor-pointer rounded-full hover:bg-main-color-hover/30 w-12 h-12", onClick, children: /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)("i", { className: `${classStr} text-2xl` }, void 0, false, {
    fileName: "app/routes/room.$roomID.tsx",
    lineNumber: 457,
    columnNumber: 13
  }, this) }, void 0, false, {
    fileName: "app/routes/room.$roomID.tsx",
    lineNumber: 456,
    columnNumber: 10
  }, this);
};
_c22 = Icon;
var _c3;
var _c22;
$RefreshReg$(_c3, "Room");
$RefreshReg$(_c22, "Icon");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Room as default
};
//# sourceMappingURL=/build/routes/room.$roomID-P3RNG24D.js.map
