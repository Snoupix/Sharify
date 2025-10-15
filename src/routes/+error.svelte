<script>
	import { page } from "$app/state";
</script>

<section>
	<h1>{page.status}: {page.error?.message ?? "Unknown error"}</h1>
</section>
