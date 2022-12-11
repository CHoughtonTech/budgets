<script>
import { defineComponent } from 'vue';
import BaseIcon from '@/components/BaseIcon.vue';
import DatePicker from 'vue3-date-time-picker';
import 'vue3-date-time-picker/dist/main.css';

export default defineComponent({
    components: {
        DatePicker,
        BaseIcon,
    },
    data: () => ({
        datePickerDate: new Date().toLocaleDateString(),
        format: 'M/d/yyyy',
    }),
});
</script>
<template>
    <div :class="$style['kitchen-layout']">
        <div :class="$style['kitchen-content']">
            <h2>Kitchen Sink</h2>
            <hr>
            <pre>Headings</pre>
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
            <h4>Heading 4</h4>
            <h5>Heading 5</h5>
            <h6>Heading 6</h6>
            <pre>Text</pre>
            Here's some sample text
            <i>Here's some sample italic text</i>
            <b>Here's some sample bold text</b>
            <span>Here's some text in a span tag</span>
            <div>Here's some text in a div tag</div>
            <p>Here's some text in a paragraph tag</p>
            <div class="context -success">Here's some success text</div>
            <div class="context -info">Here's some info text</div>
            <div class="context -warning">Here's some warning text</div>
            <div class="context -error">Here's some error text</div>
            <pre>Links</pre>
            <a href="#">Generic Link</a>
            <router-link :to="{ name: 'kitchen-sink' }">Active Router Link</router-link>
            <router-link :to="{ name: 'budget-dashboard'}">Inactive Router Link</router-link>
            <pre>Form Inputs</pre>
            <label for="ks-text">Text</label>
            <input id="ks-text" type="text" />
            <label for="ks-password">Password</label>
            <input id="ks-password" type="password" />
            <label for="ks-select">Select</label>
            <select name="ks-select-field" id="ks-select">
                <option :value="null" hidden selected></option>
                <option value="option-1">Opt 1</option>
                <option value="option-2">Opt 2</option>
            </select>
            <label for="ks-date-picker">Date</label>
            <DatePicker id="ks-date-picker" :class="$style['override-picker']" v-model="datePickerDate" :format="format" :enableTimePicker="false" :autoApply="true"></DatePicker>
            <div :class="$style['input-wrapper']">
                <label for="ks-checkbox">Is awesome?</label>
                <input id="ks-checkbox" type="checkbox" />
            </div>
            <div :class="$style['input-wrapper']">
                <label for="ks-radio-1">1</label>
                <input id="ks-radio-1" type="radio" name="ks-example-radio" value="1" />
                <label for="ks-radio-2">2</label>
                <input id="ks-radio-2" type="radio" name="ks-example-radio" value="2" />
                <label for="ks-radio-3">3</label>
                <input id="ks-radio-3" type="radio" name="ks-example-radio" value="3" checked/>
                <label for="ks-radio-4">4</label>
                <input id="ks-radio-4" type="radio" name="ks-example-radio" value="4" />
                <label for="ks-radio-5">5</label>
                <input id="ks-radio-5" type="radio" name="ks-example-radio" value="5" />
            </div>
            <button>Active</button>
            <button disabled>Disabled</button>
            <div>
                <pre>Icons</pre>
                <BaseIcon name="check"></BaseIcon>
            </div>
        </div>
    </div>
</template>
<style lang="scss" module>
.kitchen-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;
    padding: 20px;
}
.override-picker {
    --dp-icon-color: #{$purple};
}
.kitchen-content {
    display: flex;
    flex-direction: column;
    width: 75%;
    gap: 10px;
}
.input-wrapper {
    display: flex;
    justify-content: flex-start;
    gap: 10px;
}
</style>