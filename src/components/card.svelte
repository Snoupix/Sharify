<script lang="ts">
    import * as HoverCard from "$/components/ui/hover-card";
</script>

<HoverCard.Root>
    <HoverCard.Trigger>
        <slot name="trigger" />
    </HoverCard.Trigger>
    <HoverCard.Content class="bg-secondary-color border-main-color">
        <slot name="content" />
    </HoverCard.Content>
</HoverCard.Root>
