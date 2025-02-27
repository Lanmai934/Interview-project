<template>
  <a-form-model
    ref="formRef"
    :model="innerFormData"
    :rules="rules"
    :label-col="labelCol"
    :wrapper-col="wrapperCol"
  >
    <template v-for="(field, index) in fields">
      <a-form-model-item
        :key="index"
        :label="field.label"
        :prop="field.prop"
      >
        <!-- 输入框 -->
        <a-input
          v-if="field.type === 'input'"
          v-model="innerFormData[field.prop]"
          v-bind="field.props"
        />
        
        <!-- 选择器 -->
        <a-select
          v-else-if="field.type === 'select'"
          v-model="innerFormData[field.prop]"
          v-bind="field.props"
        >
          <a-select-option
            v-for="option in field.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </a-select-option>
        </a-select>

        <!-- 开关 -->
        <a-switch
          v-else-if="field.type === 'switch'"
          v-model="innerFormData[field.prop]"
          v-bind="field.props"
        />

        <!-- 自定义插槽 -->
        <slot
          v-else
          :name="field.prop"
          :field="field"
          :form-data="innerFormData"
        ></slot>
      </a-form-model-item>
    </template>

    <a-form-model-item
      v-if="showFooter"
      :wrapper-col="{ span: wrapperCol.span, offset: labelCol.span }"
    >
      <slot name="footer">
        <a-button type="primary" @click="handleSubmit">确定</a-button>
        <a-button style="margin-left: 10px" @click="handleReset">重置</a-button>
      </slot>
    </a-form-model-item>
  </a-form-model>
</template>

<script>
export default {
  name: 'BaseForm',
  props: {
    // 表单字段配置
    fields: {
      type: Array,
      required: true
    },
    // 表单数据
    formData: {
      type: Object,
      default: () => ({})
    },
    // 表单验证规则
    rules: {
      type: Object,
      default: () => ({})
    },
    // 标签布局
    labelCol: {
      type: Object,
      default: () => ({ span: 4 })
    },
    // 内容布局
    wrapperCol: {
      type: Object,
      default: () => ({ span: 20 })
    },
    // 是否显示底部按钮
    showFooter: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      innerFormData: { ...this.formData }
    }
  },
  watch: {
    formData: {
      handler(val) {
        this.innerFormData = { ...val }
      },
      deep: true
    }
  },
  methods: {
    // 提交表单
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (valid) {
          this.$emit('submit', this.innerFormData)
        }
      })
    },
    // 重置表单
    handleReset() {
      this.$refs.formRef.resetFields()
      this.$emit('reset')
    },
    // 验证表单
    validate(callback) {
      return this.$refs.formRef.validate(callback)
    },
    // 重置指定字段
    clearValidate(props) {
      this.$refs.formRef.clearValidate(props)
    }
  }
}
</script> 