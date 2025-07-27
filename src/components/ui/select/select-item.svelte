<script lang="ts">
    import Check from "lucide-svelte/icons/check";
    import { Select as SelectPrimitive } from "bits-ui";
    import { cn } from "$/utils.js";

    type $$Props = SelectPrimitive.ItemProps & { check_mark?: boolean; title?: string };
    type $$Events = SelectPrimitive.ItemEvents;

    let className: $$Props["class"] = undefined;
    export let value: $$Props["value"];
    export let label: $$Props["label"] = undefined;
    export let disabled: $$Props["disabled"] = undefined;
    export let check_mark: $$Props["check_mark"] = undefined;
    export let title: $$Props["title"] = undefined;
    export { className as class };
</script>

<SelectPrimitive.Item
    {value}
    {disabled}
    {label}
    {title}
    class={cn(
        "cursor-pointer relative flex w-full select-none items-center rounded-sm py-1.5 pl-8 pr-2 outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50 text-base text-main-content",
        className,
    )}
    {...$$restProps}
    on:click
    on:keydown
    on:focusin
    on:focusout
    on:pointerleave
    on:pointermove>
    {#if check_mark}
        <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center text-base text-main-content">
            <SelectPrimitive.ItemIndicator>
                <Check class="stroke-main-content h-4 w-4" />
            </SelectPrimitive.ItemIndicator>
        </span>
    {/if}
    <slot>
        {label || value}
    </slot>
</SelectPrimitive.Item>
