<script lang="ts">
    export let class_extension = "";
</script>

<a href="/" data-cy="home-btn" class={class_extension}>Sharify</a>

<style lang="postcss">
    a {
        @apply z-50 text-main-color font-kaushan font-bold text-2xl md:text-3xl xl:text-5xl;

        &:hover {
            transition: all 0.3s;
            text-shadow: theme("boxShadow.around") theme("colors.main-color");
        }
    }
</style>
