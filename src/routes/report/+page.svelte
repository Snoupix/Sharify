<script lang="ts">
	import { Select } from "bits-ui";
	import { Bug, Check, ChevronDown } from "lucide-svelte";
	import { toast } from "svelte-sonner";

	import { PUBLIC_SERVER_ADDR_DEV } from "$env/static/public";
	import Button from "$/components/button.svelte";
	import { custom_promise } from "$/lib/utils";

	const types = {
		Feedback: "Feedback",
		BugReport: "Bug Report",
	} as const;

	let is_sending = $state(false);
	let content = $state("");
	let type: keyof typeof types = $state("Feedback");

	async function send_webhook() {
		is_sending = true;

		const { promise, resolve_ref: resolve, reject_ref: reject } = custom_promise();

		toast.promise(promise, {
			success: "Report sent, thank you ! :)",
			error: (err) => err as string,
		});

		const res = await fetch(`${PUBLIC_SERVER_ADDR_DEV}/v1/webhook`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ wh_type: type, content }),
		});

		is_sending = false;

		if (res.status >= 200 && res.status < 300) {
			content = "";
			return resolve(null);
		}

		console.error(res);

		const err = await res.text();

		reject(err);
	}
</script>

<section>
	<form onsubmit={send_webhook}>
		<h1><Bug class="h-10 w-10" /> Report page</h1>

		<div class="flex w-full flex-row items-center justify-start gap-5">
			<Select.Root type="single" bind:value={type}>
				<Select.Trigger>
					<span
						class="flex cursor-pointer flex-row items-center justify-center gap-2 rounded-xl border border-main px-4 py-2"
						>Report type <ChevronDown /></span>
				</Select.Trigger>
				<Select.Portal>
					<Select.Content
						sideOffset={6}
						class="z-12 flex flex-col items-center justify-start gap-2 overflow-x-hidden rounded-xl border border-main bg-bg">
						<Select.Viewport class="p-1">
							{#each Object.entries(types) as [k, v] (k)}
								<Select.Item
									class="flex cursor-pointer flex-row items-center justify-center gap-2 px-4 py-2 hover:scale-105"
									value={k}>
									{#if type === k}
										<Check />
									{/if}
									{v}
								</Select.Item>
							{/each}
						</Select.Viewport>
					</Select.Content>
				</Select.Portal>
			</Select.Root>

			<h3>{types[type]}</h3>
		</div>

		<textarea
			bind:value={content}
			disabled={is_sending}
			placeholder="Report content... (supports Markdown rendering on the recieving side)"
			name="content"></textarea>

		<div class="flex w-full flex-row items-center justify-end">
			<Button disabled={is_sending || content.length === 0} type="submit">Send</Button>
		</div>
	</form>
</section>

<style lang="postcss">
	@reference "$/app.css";

	section {
		@apply flex h-full w-full items-center justify-center py-24;

		form {
			@apply flex w-2/6 flex-col items-center justify-stretch gap-8 rounded-xl border border-main p-4;

			> * {
				@apply w-full;
			}

			h1 {
				@apply flex w-full flex-row items-center justify-start gap-2 pb-4 font-kaushan text-3xl font-bold;
			}

			div h3 {
				@apply text-lg font-bold;
			}

			textarea {
				@apply resize-y rounded-xl border border-main p-2 outline-none placeholder:text-left;
			}
		}
	}
</style>
