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
    <div :class="$style['page-layout']">
        <h1>Oops...</h1>
        <h3>There's nothing here genius!</h3>
        <hr>
        <h1>( ● ___ ● )</h1>
        <h4>Redirecting...</h4>
        <div :class="$style['progressBar']">
            <div :style="`width:${currentWidth}`" :class="$style['myProgress']"></div>
        </div>
    </div>
</template>
<style lang="scss" module>
.page-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    hr {
        width: 100%;
    }
    h4 {
        font-style: italic;
    }
}
.progressBar {
    width: 100%;
    border: solid $light-purple 2px;
    border-radius: 25px;
    background: $dark-purple;
}
.myProgress {
    background-color: $light-purple;
    border: solid $light-purple 2px;
    border-radius: 25px;
    transition: 0.2s;
    height: 30px;
}
</style>