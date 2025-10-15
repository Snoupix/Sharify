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
        `custom_btn rounded-md bg-secondary px-4 py-2
        text-center font-content text-base !text-main-content
        decoration-0 transition-all duration-300 not-disabled:cursor-pointer hover:shadow-main
        xl:text-lg ${class_extended}`
    }
    {type}
    {title}
    {onclick}
    {disabled}
>
	{@render children?.()}
</Button.Root>
