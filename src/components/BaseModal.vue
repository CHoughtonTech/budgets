<script>
import { defineComponent } from 'vue';
export default defineComponent({
	props: {
        showModal: {
			type: Boolean,
			default: false,
		}
    },
	data() {
		return {
			showModals: false,
		}
	}
})
</script>
<template>
    <transition name="modal">
      <div :class="$style['modal-mask']">
        <div :class="$style['modal-container']">
            <div :class="$style['modal-header']">
                <slot name="header">
                </slot>
            </div>
            <div :class="$style['modal-body']">
                <slot name="body">
                </slot>
            </div>
            <div :class="$style['modal-footer']">
                <slot name="footer">
                    <button
                      @click="$emit('close')"
                    >
                      OK
                    </button>
                </slot>
            </div>
        </div>
      </div>
    </transition>
</template>
<style lang="scss" module>
.modal-mask {
	position: fixed;
	z-index: 9998;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	transition: opacity 0.3s ease;
}
.modal-container {
	margin: 25px;
	background: $primary-bg-color;
	border-radius: $border-radius-medium;
	box-shadow: 0 2px 8px $secondary-bg-color;
	transition: all 0.5s ease;
	min-width: calc(100vw - 10%);
	overflow-y: auto;
	&::-webkit-scrollbar {
		display: none;
	}
}
.modal-header {
	padding: 10px 20px;
	background: $dark-purple;
}
.modal-body {
	padding: 10px 20px;
}
.modal-footer {
	padding: 10px 20px;
	display: flex;
	justify-content: center;
}
</style>