<template>
    <div>
        <h1>{{hi}}</h1>
        <h2>{{id}}</h2>
    </div>
</template>
<script>
export default {
    props: {
        id: null
    },
    data() {
        return {
            hi: 'hey-o'
        }
    }
}
</script>
<style scoped>

</style>