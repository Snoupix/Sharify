<script lang="ts">
    import { getContext, hasContext, onMount } from "svelte";
    import { SquareArrowOutUpRight } from "lucide-svelte";
    import type { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";
    import type { Writable } from "svelte/store";
    import { toast } from "@zerodevx/svelte-toast";
    import { goto } from "$app/navigation";

    import { Input } from "$/components/ui/input";
    import { Label } from "$/components/ui/label";
    import { Button } from "$/components/ui/button";
    import CustomButton from "$/components/button.svelte";
    import Spotify from "$/lib/spotify";
    import { CREATE_PARTY } from "$/lib/queries";
    import { set_storage_value } from "$/lib/utils";
    import Logo from "$/components/logo.svelte";
    import type { Party } from "$/lib/types";

    if (!hasContext("GQL_Client")) {
        throw new Error("Unexpected error: Unable to get GraphQL client, please contact Snoupix");
    }

    const client: Writable<ApolloClient<NormalizedCacheObject> | null> = getContext("GQL_Client");

    if ($client == null) {
        throw new Error("Unexpected error: Unable to initiate GraphQL client, please contact Snoupix");
    }

    let autoname = true;
    let party = {
        username: "",
        party_name: "",
    };
    let spotify_link: Promise<string | Error> | undefined;

    $: if (autoname && party.username.trim() != "") {
        party.party_name = `${party.username}'s party`;
    } else if (autoname && party.username.trim() == "") {
        party.party_name = "";
    }

    onMount(async () => {
        spotify_link = $Spotify?.GenerateAuthLink();
    });

    async function create_room() {
        if (party.username.trim() == "" || party.party_name.trim() == "") {
            throw new Error("Error: Invalid username or room name (they must not be empty)");
        }

        if (!$Spotify || !$Spotify.is_ready) {
            throw new Error("Unexpected error: Spotify isn't (properly) linked to Sharify, please contact Snoupix");
        }

        const tokens = $Spotify.GetTokens();

        const gql_state = await $client?.mutate({
            mutation: CREATE_PARTY,
            variables: {
                username: party.username,
                party_name: party.party_name,
                creds: {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresIn: tokens.expires_in.toString(), // Important: these are scalar values (Timestamp => String wrapper of numbers)
                    createdAt: tokens.created_at.toString(), // and since I didn't make any resolver for it, Stringify them
                },
            },
        });

        const data: Party & { __typename: "Party" | "PartyError" | string; error: string } =
            gql_state?.data?.createParty;

        switch (data?.__typename) {
            case "Party":
                set_storage_value({ user: data.clients[0], current_room: data! });
                toast.push(`Successfully created party ${data.name}!`);
                await goto(`/room/${data.id}/${data.clients.find(c => c.username == party.username)?.id}`);
                break;
            case "PartyError":
                toast.push("Error: " + data?.error);
                break;
            default:
                console.error(gql_state);
        }
    }
</script>

<section>
    {#if $Spotify != null && $Spotify.is_ready}
        <form on:submit|preventDefault={create_room}>
            <Logo />
            <div>
                <Label for="username">Username</Label>
                <Input
                    class="px-2 text-main-content placeholder:text-main-content focus-visible:ring-main-color border-main-color bg-main-color-hover"
                    type="text"
                    id="username"
                    placeholder="Username"
                    bind:value={party.username} />
            </div>
            <div>
                <Label for="party_name">Party name</Label>
                <div class="w-full flex flex-row gap-4">
                    <Input
                        class="px-2 text-main-content placeholder:text-main-content focus-visible:ring-main-color border-main-color bg-main-color-hover"
                        disabled={autoname}
                        type="text"
                        id="party_name"
                        placeholder="Party name"
                        bind:value={party.party_name} />
                    {#if autoname}
                        <Button
                            class="text-main-content border-main-color bg-main-color-hover"
                            on:click={() => (autoname = false)}>Rename</Button>
                    {:else}
                        <Button
                            class="text-main-content border-main-color bg-main-color-hover"
                            on:click={() => (autoname = true)}>Auto name</Button>
                    {/if}
                </div>
            </div>
            <div>
                <CustomButton type="submit">Create the room</CustomButton>
            </div>
        </form>
    {:else}
        <div>
            <Logo />
            <p>First, you need to link Spotify to Sharify !</p>
            {#await spotify_link then link}
                {#if typeof link == "string"}
                    <a href={link}>Here you go <SquareArrowOutUpRight class="ml-2 w-5 stroke-neutral-200" /></a>
                {:else}
                    <h2>Generated link error: {link} please contact Snoupix</h2>
                {/if}
            {:catch e}
                <h2>Unexpected error: {e} please contact Snoupix</h2>
            {/await}
        </div>
    {/if}
</section>

<style lang="postcss">
    section {
        @apply w-full;

        form {
            @apply m-auto w-3/12 h-screen flex flex-col justify-center items-center gap-8;

            > div {
                @apply w-full flex flex-col justify-center items-start gap-2;

                :global(> *) {
                    @apply font-content text-xl;
                }

                :global(> :first-child) {
                    @apply text-lg;
                }
            }

            > div:last-child {
                @apply w-auto;
            }
        }

        > div {
            @apply m-auto w-4/12 h-screen flex flex-col justify-center items-center gap-8;

            p,
            a {
                @apply relative flex flex-row justify-center items-center font-bold text-xl;
            }

            :global(a > *) {
                @apply stroke-main-color;
            }

            a::after {
                content: "";
                display: block;
                position: absolute;
                bottom: -2px;
                left: auto;
                width: 95%;
                height: 2px;
                background: linear-gradient(
                    to right,
                    theme("colors.bg-color"),
                    theme("colors.main-color"),
                    theme("colors.bg-color")
                );
                border-radius: 1.25rem;

                &:hover {
                    display: none;
                    background: theme("colors.main-color") !important;
                }
            }
        }
    }
</style>
