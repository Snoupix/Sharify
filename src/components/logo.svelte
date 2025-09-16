<script lang="ts">
	import { goto } from "$app/navigation";

	const { class_extension = "", animate = true, top_left = false } = $props();

	let show_badge = $state(!animate);
</script>

<div class:top-left={top_left} class:pad-tr={!top_left && show_badge}>
	<button
		type="button"
		onclick={async () => {
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			await goto("/");
		}}
		onanimationend={() => (show_badge = true)}
		data-cy="home-btn"
		class:neon={animate}
		class={`${class_extension}`}>Sharify</button>
	<!-- TODO: Display badge inline when top right -->
	<span class:show={top_left || show_badge} class:middle={!top_left}>alpha</span>
</div>

<style lang="postcss">
	@reference "$/app.css";

	div {
		@apply relative p-0 transition-all duration-1000;

		&.pad-tr {
			@apply pt-6 pr-10;
		}

		&.top-left {
			@apply fixed top-0 left-0 flex flex-row items-start justify-center gap-4 px-8 py-4;
		}

		button {
			@apply z-50 cursor-pointer font-kaushan text-2xl font-bold text-main transition-all duration-300 md:text-3xl xl:text-5xl;

			&:hover {
				text-shadow: var(--shadow-around) var(--color-main);
			}
		}

		span {
			@apply rounded-full border-2 border-main px-1 py-1 font-montserrat text-[10px] font-extrabold uppercase;
			@apply hidden opacity-0 transition-opacity delay-200 duration-1000;

			&.show {
				@apply block opacity-100;
			}

			&.middle {
				@apply absolute top-0 right-0 z-2 mb-6 block;
			}
		}
	}

	.neon {
		animation: 5s neonFlicker 3s ease-in;
	}

	@keyframes neonFlicker {
		/* fully lit */
		5%,
		18%,
		22%,
		25%,
		53%,
		57%,
		95% {
			opacity: 1;
			text-shadow:
				0 0 8px var(--color-main),
				0 0 12px var(--color-main),
				0 0 20px var(--color-main);
		}
		/* dimmed – looks like a weak pulse */
		20%,
		24%,
		55%,
		60% {
			opacity: 0.4;
			text-shadow:
				0 0 2px var(--color-main),
				0 0 4px var(--color-main),
				0 0 6px var(--color-main);
		}
		/* completely off – a brief blackout */
		30%,
		35%,
		40% {
			opacity: 0.1;
			text-shadow: none;
		}
	}
</style>
