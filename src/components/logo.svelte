<script lang="ts">
    import { goto } from "$app/navigation";

    const { class_extension = "", animate = true, top_left = false } = $props();

    let show_badge = $state(!animate);
</script>

<div class:top-left={top_left} class:pad-tr={!top_left && show_badge}>
    <button
        type="button"
        onclick={async () => await goto("/")}
        onanimationend={() => show_badge = true}
        data-cy="home-btn"
        class:neon={animate}
        class={`${class_extension}`}
    >Sharify</button>
    <!-- TODO: Display badge inline when top right -->
    <span
        class:show={top_left || show_badge}
        class:middle={!top_left}>alpha</span>
</div>

<style lang="postcss">
    @reference "$/app.css";

    div {
        @apply relative transition-all duration-1000 p-0;

        &.pad-tr {
            @apply pt-6 pr-10;
        }

        &.top-left {
            @apply fixed left-0 top-0 px-8 py-4 flex flex-row justify-center items-start gap-4;
        }

        button {
            @apply cursor-pointer z-50 text-main font-kaushan font-bold text-2xl md:text-3xl xl:text-5xl transition-all duration-300;

            &:hover {
                text-shadow: var(--shadow-around) var(--color-main);
            }
        }

        span {
            @apply rounded-full border-2 border-main text-[10px] uppercase font-montserrat font-extrabold px-1 py-1;
            @apply hidden transition-opacity duration-1000 delay-200 opacity-0;

            &.show {
                @apply block opacity-100;
            }

            &.middle {
                @apply block absolute mb-6 top-0 right-0 z-2;
            }
        }
    }

    .neon {
      animation: 5s neonFlicker 3s ease-in;
    }

    @keyframes neonFlicker {
      /* fully lit */
      5%, 18%, 22%, 25%, 53%, 57%, 95% {
        opacity: 1;
        text-shadow:
          0 0 8px   var(--color-main),
          0 0 12px  var(--color-main),
          0 0 20px  var(--color-main);
      }
      /* dimmed – looks like a weak pulse */
      20%, 24%, 55%, 60% {
        opacity: 0.4;
        text-shadow:
          0 0 2px   var(--color-main),
          0 0 4px   var(--color-main),
          0 0 6px   var(--color-main);
      }
      /* completely off – a brief blackout */
      30%, 35%, 40% {
        opacity: 0.1;
        text-shadow: none;
      }
    }
</style>
