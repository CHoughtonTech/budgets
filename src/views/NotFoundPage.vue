<script>
import { defineComponent } from 'vue';
export default defineComponent({
    data() {
        return {
            width: 0,
        }
    },
    computed: {
        currentWidth() {
            return `${this.width}%`
        }
    },
    mounted() {
        this.startProgress();
    },
    methods: {
        incrementWidth() {
            this.width += 1;
        },
        startProgress() {
            let wideningInterval = setInterval(() => { this.incrementWidth(); }, 100);
            setTimeout(() => { clearInterval(wideningInterval) }, 10000);
            setTimeout(() => { this.$router.push('/'); }, 10500)
        }
    }
});
</script>
<template>
    <div class="not-found-view">
        <h1 class="is-flex is-justify-content-center">Oops...</h1>
        <h3 class="is-flex is-justify-content-center">There's nothing here genius!</h3>
        <hr>
        <h1 class="is-flex is-justify-content-center">( ● ___ ● )</h1>
        <br>
        <h4 class="is-flex is-justify-content-center">Redirecting...</h4>
        <div class="progressBar">
            <div :style="`width:${currentWidth}`" class="myProgress"></div>
        </div>
    </div>
</template>
<style scoped>
.not-found-view {
    min-width: 400px;
    width: 25%;
}
.progressBar {
    width: 100%;
    border: solid #C15EF2 2px;
    border-radius: 25px;
}
.myProgress {
    background-color: #C15EF2;
    border: solid #C15EF2 2px;
    border-radius: 25px;
    transition: 0.2s;
    height: 30px;
}
h2 {
    color: #C15EF2;
}
h4 {
    color: whitesmoke;
    font-style: italic;
}
.or-statement {
    color: whitesmoke;
    font-size: 72px;
    font-style: italic;
    font-weight: bolder;
}
</style>