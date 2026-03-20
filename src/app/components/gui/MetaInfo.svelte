<script>
    export let subTitle;
    export let title = "ReXart";
</script>

<svelte:head>
    <title>{subTitle ? `${subTitle} - ${title}` : title}</title>
</svelte:head>