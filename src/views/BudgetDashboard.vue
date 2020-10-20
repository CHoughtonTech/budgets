<template>
    <div>
        <h1>This is the dashboard</h1>
        <h5>(Trison thinks this is ridiculous)</h5>
        <img src="https://media4.giphy.com/media/c12vYfKIs2WRi/giphy.gif?cid=ecf05e47uec1diav716os5zfs4wuz7js8uwxlg68yxol542t&rid=giphy.gif" />
    </div>
</template>

<script>
export default {
    created(){
        console.log("Made it to the Budget-Dashboard: ", new Date().toLocaleDateString());
    }
}
</script>