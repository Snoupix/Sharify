<script>
	import { page } from '$app/stores';
</script>

<section>
    <h1>{$page.status}: {$page.error?.message ?? "Unknown error"}</h1>
</section>
