<template>
  <a-modal
    v-model="visible"
    :title="title"
    :width="width"
    :maskClosable="false"
    @ok="handleOk"
    @cancel="handleCancel"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot></slot>
    <template v-if="$slots.footer" slot="footer">
      <slot name="footer"></slot>
    </template>
  </a-modal>
</template>

<script>
export default {
  name: 'BaseModal',
  inheritAttrs: false,
  props: {
    // 是否显示
    value: {
      type: Boolean,
      default: false
    },
    // 标题
    title: {
      type: String,
      default: ''
    },
    // 宽度
    width: {
      type: [Number, String],
      default: 520
    }
  },
  data() {
    return {
      visible: this.value
    }
  },
  watch: {
    value(val) {
      this.visible = val
    },
    visible(val) {
      this.$emit('input', val)
    }
  },
  methods: {
    handleOk() {
      this.$emit('ok')
    },
    handleCancel() {
      this.$emit('cancel')
      this.visible = false
    }
  }
}
</script> 