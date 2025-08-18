<script lang="ts">
    export let class_extension = "";
</script>

<a href="/" data-cy="home-btn" class={class_extension}>Sharify</a>

<style lang="postcss">
    @reference "$/app.css";

    a {
        @apply z-50 text-main font-kaushan font-bold text-2xl md:text-3xl xl:text-5xl;

        &:hover {
            transition: all 0.3s;
            text-shadow: var(--shadow-around) var(--color-main);
        }
    }
</style>
