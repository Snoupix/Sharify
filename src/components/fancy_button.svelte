<script lang="ts">
	import { Button } from "bits-ui";

	import type { Snippet } from "svelte";
	import type { MouseEventHandler } from "svelte/elements";

	let {
		class_extended = "",
		type = "button",
		title = "",
		onclick = () => {},
        children,
        disabled = false,
	}: {
		class_extended?: string;
		type?: "button" | "submit" | "reset" | null;
		title?: string;
		onclick?: MouseEventHandler<HTMLButtonElement> | undefined;
        children?: Snippet | undefined;
        disabled?: boolean;
	} = $props();
</script>

<!-- prettier-ignore -->
<Button.Root
    class={
        `bg-bg border-main-hover hover:shadow-main hover:border-bg w-32 rounded-3xl
        border-3 border-solid py-1 text-center cursor-pointer custom_btn
        font-content text-base decoration-0 transition-all duration-300
        hover:font-bold hover:shadow-around
        xl:w-52 xl:text-2xl ${class_extended}`
    }
    {type}
    {title}
    {onclick}
    {disabled}
>
	{@render children?.()}
</Button.Root>
