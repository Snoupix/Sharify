import { useEffect, useMemo, useState } from "react";
import { w3cwebsocket as WsClient } from "websocket";
import { toast, ToastContainer } from "react-toastify";
import type {
	LinksFunction,
	ActionFunction,
	LoaderFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { metaV1 } from "@remix-run/v1-meta";
import { AnimatePresence, motion } from "framer-motion";
import {
    isRouteErrorResponse,
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useFetcher,
	useLoaderData,
	useLocation,
    useRouteError,
} from "@remix-run/react";

import styles from "~/compiled.css";
import toastify from "react-toastify/dist/ReactToastify.min.css";
import Spotify from "./utils/spotify";
import { getSessionData } from "./server/session.server";
import { api } from "./server/handlers.server";
import type { Party } from "./server/api.server";

export type OutletContext = {
	username: string
	toast: typeof toast
    spotify: Spotify | null
    party_data: Party | null
    websocket_connected: boolean
}

type LoaderData = {
	id: 		string
	username: 	string
}

export const links: LinksFunction = () => {
	return [
		{
			rel: "stylesheet",
			href: "https://fonts.googleapis.com/css2?family=Kaushan+Script&family=Montserrat:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap",
		},
		{
			rel: "stylesheet",
			href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css",
		},
		{
			rel: "stylesheet",
			href: toastify,
		},
		{
			rel: "stylesheet",
			href: styles,
		},
	]
}

export const meta = (args: any) => metaV1(args, {
	charset: "utf-8",
	title: "Sharify",
	viewport: "width=device-width,initial-scale=1",
	keywords: "Sharify, Snoupix, Samuel Dewaele, Spotify, Share, Music, Party",
})

export const action: ActionFunction = async ({ request }) => {
	const username = await getSessionData(request, "username");

	if (username) {
		api.RemoveFromParty(username);
	}
	
	return null;
}

export const loader: LoaderFunction = async ({ request }) => {
	const username = await getSessionData(request, "username") as string;

	return json<LoaderData>({
		id: process.env.SPOTIFY_CLIENT_ID as string,
		username,
	});
}

function Document({
    children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<head>
				<Meta />
				<title>Sharify</title>
				<Links />
			</head>
			<body className="bg-bg-color overflow-x-hidden">
				{ children }
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	)
}

export default function App() {
	const loaderData = useLoaderData<LoaderData>();
	const fetcher = useFetcher();
	const { pathname } = useLocation();
	const [contextData, setContextData] = useState<OutletContext>({
        toast,
		username: loaderData.username || "",
        spotify: null,
        party_data: null,
        websocket_connected: false,
	});
    const [serverInterval, setServerInterval] = useState<NodeJS.Timeout | null>(null);
    const [isServerUp, setIsServerUp] = useState(false);

    useEffect(() => {
        // initWS(); // if you're in a room

        if (!loaderData.id || !!contextData.spotify) return;

        console.log("init spotify");
		setContextData(data => ({ ...data, spotify: new Spotify(loaderData.id) }));
    }, [loaderData, contextData.spotify]);

    const initWS = () => {
        const ws = new WsClient(`ws://127.0.0.1:3100/sharify_ws/1`);

        ws.onmessage = (message) => {
            try {
                const data = JSON.parse(message.data.toString());
                console.log(data);
                contextData.party_data = data;
            } catch (_) {
                console.log("websocket message (not JSON):", message);
            }
        }
        
        ws.onopen = () => {
            console.log("connected");
            contextData.websocket_connected = true;
        };

        ws.onclose = () => {
            console.log("disconnected");
            contextData.websocket_connected = false;
        };

        ws.onerror = (error) => {
            console.error("websocket error:", error);
        };
    };

	useEffect(() => {
        if (serverInterval) {
            clearInterval(serverInterval);
        }

        setServerInterval(setInterval(async () => {
            try {
                // console.log(Spotify.BACK_API.split("/").slice(0, 3).join("/"));
                if ((await fetch(Spotify.BACK_API.split("/").slice(0, 3).join("/"))).status == 200) {
                    // FIXME: for some reason, serverInterval is null
                    setIsServerUp(true);
                    clearInterval(serverInterval!);
                    setTimeout(() => setServerInterval(null), 5000);
                    initWS();
                }
            } catch (error) {
                console.error("server not reachable", error);
            }
        }, 5000));

		return () => {
            fetcher.submit(null, { method: 'post' })

            if (serverInterval) {
                clearInterval(serverInterval);
            }
        };
	}, [])

    if (!isServerUp) {
        return (
            <Document>
                <div className="error-container">
                    <h1>Server is unreachable/loading...</h1>
                </div>
            </Document>
        );
    }

	return (
		<Document>
			<AnimatePresence mode="wait" initial={false}>
				<motion.main
					className="relative min-h-screen w-screen"
					key={pathname}
					initial={{ translateY: '2.5%' }}
					animate={{ translateY: '0%' }}
					exit={{ translateY: '2.5%' }}
					transition={{ duration: .2 }}
				>
					<Outlet context={contextData} />
					<ToastContainer />
				</motion.main>
			</AnimatePresence>
		</Document>
	);
}

export function ErrorBoundary() {
    const error = useRouteError();
  
    if (isRouteErrorResponse(error)) {
        return (
            <Document>
                <div className="error-container">
                    <h1>
                        {error.status} {error.statusText} {error.data}
                    </h1>
                </div>
            </Document>
        );
    }

    const err = error as Error;
	console.error(error, err);

	return (
		<Document>
			<div className="error-container">
				<h1>App Error</h1>
				<pre>{err?.message ?? error}</pre>
			</div>
		</Document>
	);
}
