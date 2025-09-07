<script lang="ts">
	export let class_extended = "";
	export let type: "button" | "submit" | "reset" | null = "button";
	export let title = "";
</script>

<!-- prettier-ignore -->
<button
    class={
        `bg-bg-color border-main-color-hover hover:shadow-main-color hover:border-bg-color custom_btn w-32 rounded-3xl
        border-[3px] border-solid py-1 text-center
        font-content text-base decoration-0 transition-all duration-300
        hover:font-bold hover:shadow-around
        xl:w-52 xl:text-2xl ${class_extended}`
    }
    {type}
    {title}
    on:click
>
	<slot />
</button>
