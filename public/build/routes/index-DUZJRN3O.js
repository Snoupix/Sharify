import { Q, k } from "/build/_shared/chunk-ZWDRPSVH.js";
import { Title, require_session } from "/build/_shared/chunk-N34FPOEX.js";
import { GetStorageValue, SpotifyHandler } from "/build/_shared/chunk-3C4RD22A.js";
import { Link, __toESM, require_jsx_dev_runtime, require_react, useSubmit } from "/build/_shared/chunk-OUWIEADR.js";

// app/routes/index.tsx
var import_react = __toESM(require_react());
var import_session = __toESM(require_session());
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime());
function Index() {
	const submit = useSubmit();
	const [spotifyUser, setSpotifyUser] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (SpotifyHandler.isReady) {
			(async () => {
				const profile = await SpotifyHandler.GetProfile();
				if (!(profile instanceof Error)) {
					setSpotifyUser(profile);
				}
			})();
		} else if (GetStorageValue("st") != null && !SpotifyHandler.isReady) {
			(async () => {
				const profile = await SpotifyHandler.GetProfile();
				if (!(profile instanceof Error)) {
					setSpotifyUser(profile);
				}
			})();
		}
	}, []);
	const handleSpotifyDisconnect = () => {
		Q(`[Spotify] Disconnected from ${spotifyUser == null ? void 0 : spotifyUser.display_name} !`, {
			position: "bottom-right",
			autoClose: 2500,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			theme: "light",
		});
		submit({ DeleteSpotifyTokens: "true" }, { method: "post" });
		SpotifyHandler.Disconnect();
		setSpotifyUser(null);
	};
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
		import_jsx_dev_runtime.Fragment,
		{
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
					"nav",
					{ className: "fixed top-0 left-0 h-14 w-screen" },
					void 0,
					false,
					{
						fileName: "app/routes/index.tsx",
						lineNumber: 67,
						columnNumber: 4,
					},
					this,
				),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
					"div",
					{
						className:
							"h-screen flex flex-col justify-center items-center content-center gap-y-4 md:gap-y-6 xl:gap-y-9",
						children: [
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
								Title,
								{},
								void 0,
								false,
								{
									fileName: "app/routes/index.tsx",
									lineNumber: 71,
									columnNumber: 5,
								},
								this,
							),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
								Link,
								{
									className:
										"duration-300 p-main-btn md:t-main-btn xl:main-btn hover:shadow-around hover:shadow-main-color hover:border-bg-color",
									to: "/host",
									"data-cy": "host-link",
									children: "Host",
								},
								void 0,
								false,
								{
									fileName: "app/routes/index.tsx",
									lineNumber: 72,
									columnNumber: 5,
								},
								this,
							),
							/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
								Link,
								{
									className:
										"duration-300 p-main-btn md:t-main-btn xl:main-btn hover:shadow-around hover:shadow-main-color hover:border-bg-color",
									to: "/client",
									"data-cy": "client-link",
									children: "Client",
								},
								void 0,
								false,
								{
									fileName: "app/routes/index.tsx",
									lineNumber: 79,
									columnNumber: 5,
								},
								this,
							),
							spotifyUser
								? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
										"div",
										{
											"data-cy": "horizontal-bar",
											className: "border-t-[1px] border-indigo-700 w-[20%]",
										},
										void 0,
										false,
										{
											fileName: "app/routes/index.tsx",
											lineNumber: 87,
											columnNumber: 6,
										},
										this,
									)
								: null,
							spotifyUser
								? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
										"button",
										{
											className:
												"duration-300 p-main-btn md:t-main-btn xl:main-btn hover:shadow-around hover:shadow-main-color hover:border-bg-color",
											onClick: handleSpotifyDisconnect,
											"data-cy": "disconnect-btn",
											children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
												"span",
												{
													className: "text-xl xl:text-2xl",
													children: `Disconnect from ${spotifyUser.display_name}`,
												},
												void 0,
												false,
												{
													fileName: "app/routes/index.tsx",
													lineNumber: 95,
													columnNumber: 7,
												},
												this,
											),
										},
										void 0,
										false,
										{
											fileName: "app/routes/index.tsx",
											lineNumber: 90,
											columnNumber: 6,
										},
										this,
									)
								: null,
						],
					},
					void 0,
					true,
					{
						fileName: "app/routes/index.tsx",
						lineNumber: 70,
						columnNumber: 4,
					},
					this,
				),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
					k,
					{},
					void 0,
					false,
					{
						fileName: "app/routes/index.tsx",
						lineNumber: 99,
						columnNumber: 4,
					},
					this,
				),
			],
		},
		void 0,
		true,
		{
			fileName: "app/routes/index.tsx",
			lineNumber: 66,
			columnNumber: 3,
		},
		this,
	);
}
export { Index as default };
//# sourceMappingURL=/build/routes/index-DUZJRN3O.js.map
