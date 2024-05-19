import { require_handlers } from "/build/_shared/chunk-CAMVXGFL.js";
import { Q, k } from "/build/_shared/chunk-ZWDRPSVH.js";
import { Title, require_session } from "/build/_shared/chunk-N34FPOEX.js";
import { GetStorageValue, SpotifyHandler } from "/build/_shared/chunk-3C4RD22A.js";
import {
	Form,
	__commonJS,
	__toESM,
	require_jsx_dev_runtime,
	require_react,
	useActionData,
	useCatch,
	useLoaderData,
	useNavigate,
	useOutletContext,
	useParams,
	useSubmit,
} from "/build/_shared/chunk-OUWIEADR.js";

// empty-module:~/server/api.server
var require_api = __commonJS({
	"empty-module:~/server/api.server"(exports, module) {
		module.exports = {};
	},
});

// app/routes/host.tsx
var import_react2 = __toESM(require_react());
var import_handlers = __toESM(require_handlers());
var import_api = __toESM(require_api());
var import_session = __toESM(require_session());
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime());
function Host() {
	const loaderData = useLoaderData();
	const actionData = useActionData();
	const context = useOutletContext();
	const submit = useSubmit();
	const navigate = useNavigate();
	const formRef = (0, import_react2.useRef)(null);
	const [connectedTo, setConnectedTo] = (0, import_react2.useState)({ spotify: false });
	const [dataToSend, setDataToSend] = (0, import_react2.useState)("");
	const [formState, setFormState] = (0, import_react2.useReducer)(
		(state, newState) => {
			setDataToSend(JSON.stringify({ ...state, ...newState }));
			return { ...state, ...newState };
		},
		{
			username: "",
			name: "",
			isPrivate: false,
			password: "",
			type: null,
			sat: "",
			srt: "",
			sd: 0,
			sdate: 0,
		},
	);
	(0, import_react2.useEffect)(() => {
		let toast_id;
		if (SpotifyHandler.isReady || (GetStorageValue("st") != null && !SpotifyHandler.isReady)) {
			(async () => {
				const profile = await SpotifyHandler.GetProfile();
				if (!(profile instanceof Error)) {
					toast_id = Q(`[Spotify] Connected as ${profile.display_name}`, {
						position: "bottom-right",
						autoClose: 2500,
						hideProgressBar: false,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						theme: "light",
					});
				}
				setFormState({
					sat: loaderData.spotifyTokens.sat,
					srt: loaderData.spotifyTokens.srt,
					sd: loaderData.spotifyTokens.ein,
					sdate: loaderData.spotifyTokens.date,
					username: context.username,
					type: "Spotify",
				});
				setConnectedTo(prev => ({ ...prev, spotify: true }));
			})();
		}
		return () => Q.dismiss(toast_id);
	}, []);
	(0, import_react2.useEffect)(() => {
		if (actionData == null ? void 0 : actionData.errorMessage) {
			const _toast = Q.error(actionData.errorMessage, {
				position: "bottom-right",
				autoClose: 2500,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				theme: "dark",
			});
			return () => (Q.isActive(_toast) ? Q.dismiss(_toast) : void 0);
		}
	}, [actionData]);
	const checkFormInputs = () => {
		if (
			formState.name == "" ||
			formState.type == null ||
			(formState.isPrivate && formState.password == "") ||
			formState.username.trim() == ""
		) {
			return false;
		}
		return true;
	};
	const handleSubmit = () => {
		if (checkFormInputs() && formRef.current) {
			submit(formRef.current, { method: "post" });
		} else {
			Q.error("Error: Missing fields", {
				position: "bottom-right",
				autoClose: 2500,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				theme: "dark",
			});
		}
	};
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
		"section",
		{
			className: "h-screen",
			children: [
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
					Title,
					{},
					void 0,
					false,
					{
						fileName: "app/routes/host.tsx",
						lineNumber: 211,
						columnNumber: 4,
					},
					this,
				),
				/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
					Form,
					{
						ref: formRef,
						className: "flex flex-col justify-center items-center content-center h-full gap-y-6",
						onSubmit: e => e.preventDefault(),
						children:
							formState.type == null
								? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
										import_jsx_dev_runtime.Fragment,
										{
											children: [
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
													"span",
													{ className: "text-2xl", children: "Party type" },
													void 0,
													false,
													{
														fileName: "app/routes/host.tsx",
														lineNumber: 220,
														columnNumber: 8,
													},
													this,
												),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
													"div",
													{
														className: "flex flex-row gap-x-4",
														children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
															"button",
															{
																className:
																	"text-xl px-5 py-2 rounded-3xl bg-bg-color text-main-color border-[1px] border-main-color transition-all duration-300 " +
																	(formState.type == "Spotify"
																		? "text-[white] shadow-backRight shadow-main-color scale-105"
																		: ""),
																onClick: () =>
																	connectedTo.spotify
																		? setFormState({ type: "Spotify" })
																		: navigate("/auth_spotify"),
																children: "Connect to Spotify",
															},
															void 0,
															false,
															{
																fileName: "app/routes/host.tsx",
																lineNumber: 222,
																columnNumber: 9,
															},
															this,
														),
													},
													void 0,
													false,
													{
														fileName: "app/routes/host.tsx",
														lineNumber: 221,
														columnNumber: 8,
													},
													this,
												),
											],
										},
										void 0,
										true,
										{
											fileName: "app/routes/host.tsx",
											lineNumber: 219,
											columnNumber: 7,
										},
										this,
									)
								: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
										import_jsx_dev_runtime.Fragment,
										{
											children: [
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
													"div",
													{
														className: "flex flex-row",
														children:
															formState.type == "Spotify"
																? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
																		"div",
																		{
																			className:
																				"flex flex-col-reverse items-center justify-center gap-4",
																			children: [
																				/* @__PURE__ */ (0,
																				import_jsx_dev_runtime.jsxDEV)(
																					"i",
																					{
																						className:
																							"fab fa-spotify text-3xl text-[currentColor]",
																					},
																					void 0,
																					false,
																					{
																						fileName: "app/routes/host.tsx",
																						lineNumber: 235,
																						columnNumber: 41,
																					},
																					this,
																				),
																				/* @__PURE__ */ (0,
																				import_jsx_dev_runtime.jsxDEV)(
																					"span",
																					{
																						className: "text-4xl",
																						children: "Party settings",
																					},
																					void 0,
																					false,
																					{
																						fileName: "app/routes/host.tsx",
																						lineNumber: 236,
																						columnNumber: 41,
																					},
																					this,
																				),
																			],
																		},
																		void 0,
																		true,
																		{
																			fileName: "app/routes/host.tsx",
																			lineNumber: 234,
																			columnNumber: 39,
																		},
																		this,
																	)
																: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
																		"i",
																		{
																			className:
																				"fab fa-youtube text-3xl text-[currentColor]",
																		},
																		void 0,
																		false,
																		{
																			fileName: "app/routes/host.tsx",
																			lineNumber: 238,
																			columnNumber: 39,
																		},
																		this,
																	),
													},
													void 0,
													false,
													{
														fileName: "app/routes/host.tsx",
														lineNumber: 232,
														columnNumber: 8,
													},
													this,
												),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
													"input",
													{ type: "hidden", name: "srt", value: formState.srt },
													void 0,
													false,
													{
														fileName: "app/routes/host.tsx",
														lineNumber: 240,
														columnNumber: 8,
													},
													this,
												),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
													"input",
													{ type: "hidden", name: "sat", value: formState.sat },
													void 0,
													false,
													{
														fileName: "app/routes/host.tsx",
														lineNumber: 241,
														columnNumber: 8,
													},
													this,
												),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
													"input",
													{ type: "hidden", name: "data", value: dataToSend },
													void 0,
													false,
													{
														fileName: "app/routes/host.tsx",
														lineNumber: 242,
														columnNumber: 8,
													},
													this,
												),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
													"input",
													{
														"data-cy": "host-form-username",
														autoFocus: true,
														className: "form-input",
														type: "text",
														maxLength: 20,
														placeholder: "Username",
														spellCheck: false,
														defaultValue: formState.username,
														onChange: e =>
															setFormState({
																username:
																	e.currentTarget.value == ""
																		? "Guest"
																		: e.currentTarget.value,
															}),
													},
													void 0,
													false,
													{
														fileName: "app/routes/host.tsx",
														lineNumber: 243,
														columnNumber: 8,
													},
													this,
												),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
													"input",
													{
														"data-cy": "host-form-party-name",
														className: "form-input",
														type: "text",
														maxLength: 20,
														placeholder: "Party's name",
														spellCheck: false,
														onChange: e => setFormState({ name: e.currentTarget.value }),
													},
													void 0,
													false,
													{
														fileName: "app/routes/host.tsx",
														lineNumber: 254,
														columnNumber: 8,
													},
													this,
												),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
													"span",
													{ className: "text-2xl", children: "Is the party private ?" },
													void 0,
													false,
													{
														fileName: "app/routes/host.tsx",
														lineNumber: 263,
														columnNumber: 8,
													},
													this,
												),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
													"div",
													{
														className: "flex flex-row gap-x-4",
														children: [
															/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
																"button",
																{
																	"data-cy": "host-form-make-private",
																	className:
																		"text-xl px-5 py-2 rounded-3xl bg-bg-color text-main-color border-[1px] border-main-color transition-all duration-300 " +
																		(formState.isPrivate
																			? "text-[white] shadow-inner shadow-main-color scale-105 font-bold"
																			: ""),
																	onClick: () =>
																		!formState.isPrivate
																			? setFormState({
																					isPrivate: true,
																					password: "",
																				})
																			: null,
																	children: "Yes",
																},
																void 0,
																false,
																{
																	fileName: "app/routes/host.tsx",
																	lineNumber: 265,
																	columnNumber: 9,
																},
																this,
															),
															/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
																"button",
																{
																	"data-cy": "host-form-make-public",
																	className:
																		"text-xl px-5 py-2 rounded-3xl bg-bg-color text-main-color border-[1px] border-main-color transition-all duration-300 " +
																		(!formState.isPrivate
																			? "text-[white] shadow-inner shadow-main-color scale-105 font-bold"
																			: ""),
																	onClick: () =>
																		formState.isPrivate
																			? setFormState({
																					isPrivate: false,
																					password: "",
																				})
																			: null,
																	children: "No",
																},
																void 0,
																false,
																{
																	fileName: "app/routes/host.tsx",
																	lineNumber: 272,
																	columnNumber: 9,
																},
																this,
															),
														],
													},
													void 0,
													true,
													{
														fileName: "app/routes/host.tsx",
														lineNumber: 264,
														columnNumber: 8,
													},
													this,
												),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
													"input",
													{
														"data-cy": "host-form-party-password",
														className: formState.isPrivate ? "form-input block" : "hidden",
														type: "password",
														name: "password",
														placeholder: "Password",
														onChange: e =>
															setFormState({ password: e.currentTarget.value }),
													},
													void 0,
													false,
													{
														fileName: "app/routes/host.tsx",
														lineNumber: 280,
														columnNumber: 8,
													},
													this,
												),
												/* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
													"button",
													{
														"data-cy": "host-form-submit",
														className:
															"form-input mt-4 text-lg md:text-xl xl:text-2xl rounded-lg border-[1px] px-5 py-3 border-main-color hover:shadow-around text-shadow",
														type: "submit",
														onClick: handleSubmit,
														children: "Create your party",
													},
													void 0,
													false,
													{
														fileName: "app/routes/host.tsx",
														lineNumber: 288,
														columnNumber: 8,
													},
													this,
												),
											],
										},
										void 0,
										true,
										{
											fileName: "app/routes/host.tsx",
											lineNumber: 231,
											columnNumber: 7,
										},
										this,
									),
					},
					void 0,
					false,
					{
						fileName: "app/routes/host.tsx",
						lineNumber: 212,
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
						fileName: "app/routes/host.tsx",
						lineNumber: 300,
						columnNumber: 4,
					},
					this,
				),
			],
		},
		void 0,
		true,
		{
			fileName: "app/routes/host.tsx",
			lineNumber: 210,
			columnNumber: 3,
		},
		this,
	);
}
function ErrorBoundary() {
	return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
		"div",
		{ className: "error-container", children: `An error has occured while creating a party.` },
		void 0,
		false,
		{
			fileName: "app/routes/host.tsx",
			lineNumber: 307,
			columnNumber: 3,
		},
		this,
	);
}
function CatchBoundary() {
	const caught = useCatch();
	const params = useParams();
	if (caught.status === 404) {
		return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(
			"div",
			{ className: "error-container", children: `[${caught.status}] ${caught.data} (${params.roomID})` },
			void 0,
			false,
			{
				fileName: "app/routes/host.tsx",
				lineNumber: 319,
				columnNumber: 4,
			},
			this,
		);
	}
	throw new Error(`Unhandled error: ${caught.status} ${caught.data} ${params.roomID}`);
}
export { CatchBoundary, ErrorBoundary, Host as default };
//# sourceMappingURL=/build/routes/host-DTSMU4PO.js.map
