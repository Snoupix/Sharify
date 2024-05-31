<script lang="ts">
    import { Select as SelectPrimitive } from "bits-ui";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import { cn } from "$/utils.js";

    type $$Props = SelectPrimitive.TriggerProps;
    type $$Events = SelectPrimitive.TriggerEvents;

    let className: $$Props["class"] = undefined;
    export { className as class };
</script>

<SelectPrimitive.Trigger
    class={cn(
        "custom_btn bg-main-color-hover flex h-10 w-full items-center justify-evenly rounded-md px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className,
    )}
    {...$$restProps}
    let:builder
    on:click
    on:keydown>
    <slot {builder} />
    <div>
        <ChevronDown class="stroke-main-content h-4 w-4 opacity-80" />
    </div>
</SelectPrimitive.Trigger>
