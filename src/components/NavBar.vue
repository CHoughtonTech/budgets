<template>
    <div id="nav" class="nav">
        <nav>
            <router-link class="nav-link" :to="{ name: 'budget-dashboard' }">Home</router-link>
            <router-link class="nav-link" :to="{ name: 'bills' }">Bills</router-link>
        </nav>
    </div>
</template>

<script>
export default {};
</script>
<style>
.nav {
    overflow:hidden;
    position:fixed;
    top:0;
    width: 100%;
    min-width: 500px;
    background-color: teal;
    color: white;
    margin: 0;
    z-index: 1;
}
.nav-link {
  float: left;
  display: block;
  color: #f2f2f2;
  text-align: center;
  padding: 15px 15px;
  text-decoration: none;
  font-size: 17px;
}
.nav-link:hover {
    background-color:#09dbdb;
    color: teal;
}
.router-link-exact-active {
    background-color: #67dada;
    color:gray;
    font-style: italic;
}

</style>