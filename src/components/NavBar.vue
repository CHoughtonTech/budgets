<template>
    <div id="nav" class="nav">
        <nav>
            <router-link :to="{ name: 'budget-dashboard' }">Dashboard</router-link> /
            <router-link :to="{ name: 'bills' }">Bills</router-link>
        </nav>
    </div>
</template>

<script>
export default {};
</script>