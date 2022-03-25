<script>
    import { defineComponent } from 'vue';
    import { Cropper, Preview } from 'vue-advanced-cropper';
    import { getStorage, ref, uploadBytes } from 'firebase/storage';
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
                    .then((result) => {
                        const urlPath = result.metadata.fullPath.replace('/', '%2F');
                        const userPhoto = `https://firebasestorage.googleapis.com/v0/b/${result.metadata.bucket}/o/${urlPath}?alt=media`;
                        this.$emit('upload-image-success', userPhoto);
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
    <div id="profilePhoto">
        <h4 class="is-flex is-justify-content-center">Update Profile Photo</h4>
        <cropper ref="cropper" class="cropper" :src="image.src" :debounce="false" :stencil-props="{ scalable: true, aspectRatio: 1/1 }" :image-restriction="stencil" @change="onChange"/>
        <div class="button-wrapper">
            <button class="button" @click="$refs.file.click()">
                <input
                style="display:none;"
                type="file"
                ref="file"
                @change="uploadImage($event)"
                accept="image/*"
                />
                Upload File
            </button>
            <button :class="hasSelectedImage ? 'button' : 'button-disabled'" @click="cropImage()" :disabled="!hasSelectedImage">Set Photo</button>
            <button class="button" style="width:25%" @click="cancelImageUpload()">Cancel</button>
        </div>
        <div class="is-flex is-justify-content-center">
            <h4>Preview</h4>
        </div>
        <div class="is-flex is-justify-content-center">
            <preview 
                :width="128"
                :height="128"
                :image="result.image"
                :coordinates="result.coordinates"
                style="border-radius:50%"
            />
        </div>
  </div>
</template>
<style scoped>
#profilePhoto {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.cropper {
  max-height: 500px;
}

.button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 17px;
}

h4 {
    color: #C15EF2;
}

.button {
  color: whitesmoke;
  font-size: 16px;
  padding: 10px 20px;
  width: 100%;
  background: #411159;
  cursor: pointer;
  transition: background 0.5s;
  border: 1px solid #C15EF2;
  border-radius: 25px;
}
.button-disabled {
    font-size: 16px;
    padding: 10px 20px;
    width: 100%;
    transition: background 0.5s;
    border: 1px solid #C15EF2;
    border-radius: 25px;
    background-color: grey;
    cursor: not-allowed;
    color:crimson;
    border-color:lightcoral;
}
</style>