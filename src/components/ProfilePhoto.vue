<script>
    import { defineComponent } from 'vue';
    import { Cropper, Preview } from 'vue-advanced-cropper';
    import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
    import ox from '@/assets/small-ox.jpg';
    import 'vue-advanced-cropper/dist/style.css';

    export default defineComponent({
    components: {
        Cropper,
        Preview,
    },
    props: {
        userId: undefined,
    },
    data() {
        return {
            image: {
                src: ox,
                type: 'image/jpg',
            },
            storage: null,
            result: {
                coordinates: null,
                image: null,
            }
        };
    },
    computed: {
        hasSelectedImage() {
            return this.image.src !== ox;
        }
    },
    methods: {
        onChange({coordinates, image}) {
            this.result = {
                coordinates,
                image
            };
        },
        cancelImageUpload() {
            this.image = {
                src: ox,
                type: 'image/jpg',
            };
            URL.revokeObjectURL(this.image.src);
            this.$emit('cancel-image-upload');
        },
        cropImage() {
            const result = this.$refs.cropper?.getResult();
            if (!result || result === null) return;
            result.canvas.toBlob((blob) => {
                uploadBytes(this.storage, blob)
                    .then(() => {
                        getDownloadURL(this.storage).then((url) => {
                            this.$emit('upload-image-success', url);
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }, this.image.type);
        },
        uploadImage(event) {
            /// Reference to the DOM input element
            const { files } = event.target;
            // Ensure that you have a file before attempting to read it
            if (files && files[0]) {
                // 1. Revoke the object URL, to allow the garbage collector to destroy the uploaded before file
                if (this.image.src) {
                    URL.revokeObjectURL(this.image.src);
                }
                // 2. Create the blob link to the file to optimize performance:
                const blob = URL.createObjectURL(files[0]);

                // 3. Update the image. The type will be derived from the extension and it can lead to an incorrect result:
                this.image = {
                    src: blob,
                    type: files[0].type,
                };
            }
        },
    },
    mounted() {
        const storageBucket = getStorage();
        if (this.userId)
            this.storage = ref(storageBucket, `${this.userId}/ProfilePhoto`);
    },
    unmounted() {
        // Revoke the object URL, to allow the garbage collector to destroy the uploaded before file
        if (this.image.src) {
            URL.revokeObjectURL(this.image.src);
        }
    },
    });
</script>
<template>
    <div :class="$style['main-content']">
        <h4>Update Profile Photo</h4>
        <cropper ref="cropper" :class="$style['cropper']" :src="image.src" :debounce="false" :canvas="{maxHeight: 512,maxWidth: 512}" :stencil-props="{ scalable: true, aspectRatio: 1/1 }" :image-restriction="stencil" @change="onChange"/>
        <div :class="$style['button-wrapper']">
            <button @click="$refs.file.click()">
                <input
                style="display:none;"
                type="file"
                ref="file"
                @change="uploadImage($event)"
                accept="image/*"
                />
                Select
            </button>
            <button :class="!hasSelectedImage && $style['button-disabled']" @click="cropImage()" :disabled="!hasSelectedImage">Upload</button>
            <button @click="cancelImageUpload()">Cancel</button>
        </div>
        <h4>Preview</h4>
        <preview 
            :width="128"
            :height="128"
            :image="result.image"
            :coordinates="result.coordinates"
            :class="$style['preview']"
        />
  </div>
</template>
<style lang="scss" module>
.main-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    color: #2c3e50;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
.cropper {
    max-height: 500px;
    max-width: calc(100vw - 60px);
}
.button-wrapper {
    display: flex;
    justify-content: center;
}
.preview {
    border-radius: $border-radius-very-strong;
}
.button-disabled {
    background-color: $light-gray;
    cursor: not-allowed;
    color: $dark-gray;
    border-color:$dark-gray;
    --icon-stroke: #{$dark-gray};
    &:hover {
        background-color: $gray;
        cursor: not-allowed;
        color: $dark-gray;
        border-color:$dark-gray;
    }
}
</style>