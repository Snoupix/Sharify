import { Title, require_session } from "/build/_shared/chunk-N34FPOEX.js";
import { SpotifyHandler } from "/build/_shared/chunk-3C4RD22A.js";
import {
	Link,
	__toESM,
	require_jsx_dev_runtime,
	require_react,
	useLoaderData,
	useSubmit,
} from "/build/_shared/chunk-OUWIEADR.js";

// app/routes/auth_spotify.tsx
var import_react = __toESM(require_react());
var import_session = __toESM(require_session());
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime());
function Auth_Spotify() {
	const loaderData = useLoaderData();
	const submit = useSubmit();
	const [text, setText] = (0, import_react.useState)("");
	const [fetched, setFetched] = (0, import_react.useState)(false);
	const [isReady, setIsReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const interval = setInterval(() => {
			if (SpotifyHandler.isReady) {
				setIsReady(true);
				clearInterval(interval);
			}
		}, 5e3);
		return () => clearInterval(interval);
	}, []);
	(0, import_react.useEffect)(() => {
		if (fetched) return;
		const params = new URLSearchParams(location.search);
		const code = params.get("code");
		const error = params.get("error");
		if (code) {
			setFetched(true);
			return SpotifyHandler.FetchAccessToken(code);
		}
		if (error) {
			setFetched(true);
			return setText(`Error: ${error}`);
		}
		if (loaderData && loaderData.SpotifyTokens) {
			const expires_in =
				(loaderData.SpotifyTokens.ein > 0 && loaderData.SpotifyTokens.ein <= 3600
					? loaderData.SpotifyTokens.ein
					: 3600) * 1e3;
			const msDiff = loaderData.SpotifyTokens.date + expires_in - Date.now();
			if (msDiff > 0) {
				setFetched(true);
				return SpotifyHandler.ProcessTokens({
					access_token: loaderData.SpotifyTokens.sat,
					refresh_token: loaderData.SpotifyTokens.srt,
					expires_in: loaderData.SpotifyTokens.ein,
					createdAt: loaderData.SpotifyTokens.date,
				});
			}
		}
		location.replace(SpotifyHandler.GetAuthLink());
	}, [loaderData, fetched]);
	(0, import_react.useEffect)(() => {
		if (isReady) {
			(async () => {
				setFetched(true);
				const profile = await SpotifyHandler.GetProfile();
				if (!(profile instanceof Error)) {
					setText(`Successfully connected to ${profile.display_name}`);
				}
				const tokens = SpotifyHandler.GetTokens();
				setTimeout(() => {
					submit(
						{
							spotifyTokens: JSON.stringify({
								sat: tokens.accessToken,
								srt: tokens.refreshToken,
								ein: tokens.expires_in,
								date: tokens.date,
							}),
						},
						{ method: "post" },
					);
				}, 1e3);
			})();
		}
	}, [isReady, submit]);
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
		"div",
		{
			className:
				"flex flex-col items-center justify-center content-center h-screen text-main-color font-semibold",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
					Title,
					{},
					void 0,
					false,
					{
						fileName: "app/routes/auth_spotify.tsx",
						lineNumber: 130,
						columnNumber: 13,
					},
					this,
				),
				text != ""
					? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
							Link,
							{ to: "/host", className: "text-4xl", "data-cy": "auth-text", children: text },
							void 0,
							false,
							{
								fileName: "app/routes/auth_spotify.tsx",
								lineNumber: 133,
								columnNumber: 17,
							},
							this,
						)
					: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
							"div",
							{ className: "loader" },
							void 0,
							false,
							{
								fileName: "app/routes/auth_spotify.tsx",
								lineNumber: 134,
								columnNumber: 17,
							},
							this,
						),
			],
		},
		void 0,
		true,
		{
			fileName: "app/routes/auth_spotify.tsx",
			lineNumber: 129,
			columnNumber: 9,
		},
		this,
	);
}
export { Auth_Spotify as default };
//# sourceMappingURL=/build/routes/auth_spotify-QQNTFAIC.js.map
