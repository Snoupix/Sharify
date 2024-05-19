<script lang="ts">
	export let class_extended = "";
    export let type: "button" | "submit" | "reset" | null = "button";
</script>

<button class={`${class_extended}`} {type} on:click>
	<slot />
</button>

<style lang="postcss">
	button {
		@apply font-content text-base w-32 xl:text-2xl xl:w-52 duration-300 bg-bg-color border-solid border-[3px] border-main-color-hover rounded-3xl py-1 decoration-0 text-center hover:shadow-around hover:shadow-main-color hover:border-bg-color hover:font-bold;
	}
</style>
