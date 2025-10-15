<script lang="ts">
	import { Button } from "bits-ui";

	import type { Snippet } from "svelte";
	import type { ClassValue, MouseEventHandler } from "svelte/elements";

	let {
		class_extended = "",
		type = "button",
		title = "",
		onclick = () => {},
		children,
		disabled = false,
	}: {
		class_extended?: ClassValue;
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
        `custom_btn w-32 cursor-pointer rounded-3xl border-3 border-solid
        border-main-hover bg-bg py-1 text-center font-content text-base
        decoration-0 transition-all duration-300 hover:border-bg hover:font-bold
        hover:shadow-around hover:shadow-main
        xl:w-52 xl:text-2xl ${class_extended}`
    }
    {type}
    {title}
    {onclick}
    {disabled}
>
	{@render children?.()}
</Button.Root>
