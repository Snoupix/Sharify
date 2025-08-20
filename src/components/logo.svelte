<script lang="ts">
    const { class_extension = "", animate = true } = $props();
</script>

<a href="/" data-cy="home-btn" class={`${animate && "neon "}${class_extension}`}>Sharify</a>

<style lang="postcss">
    @reference "$/app.css";

    a {
        @apply z-50 text-main font-kaushan font-bold text-2xl md:text-3xl xl:text-5xl transition-all duration-300;

        &:hover {
            text-shadow: var(--shadow-around) var(--color-main);
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
