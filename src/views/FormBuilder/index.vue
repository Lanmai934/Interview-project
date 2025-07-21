<template>
  <div class="form-builder">
    <div class="form-builder-header">
      <a-space>
        <a-button type="primary" @click="handlePreview">
          <a-icon type="eye" />预览
        </a-button>
        <a-button type="primary" @click="handleSave">
          <a-icon type="save" />保存
        </a-button>
      </a-space>
    </div>
    <div class="form-builder-content">
      <form-designer ref="formDesigner" />
    </div>

    <!-- 预览弹窗 -->
    <a-modal
      v-model="previewVisible"
      title="表单预览"
      width="800px"
      :footer="null"
    >
      <a-form-model
        ref="previewForm"
        :model="formData"
        :rules="formRules"
      >
        <a-form-model-item
          v-for="(item, index) in formConfig.formItems"
          :key="index"
          :label="item.label"
          :prop="item.prop || `field${index}`"
        >
          <component
            :is="getComponentName(item.type)"
            v-model="formData[item.prop || `field${index}`]"
            v-bind="getPreviewProps(item)"
          />
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" @click="handleTest">
            测试提交
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import FormDesigner from '@/components/FormDesigner'

export default {
  name: 'FormBuilder',
  components: {
    FormDesigner
  },
  data() {
    return {
      previewVisible: false,
      formConfig: {},
      formData: {},
      formRules: {}
    }
  },
  methods: {
    handlePreview() {
      this.formConfig = this.$refs.formDesigner.getFormConfig()
      this.formData = {}
      this.formRules = {}
      
      // 优化验证规则处理
      this.formConfig.formItems.forEach((item, index) => {
        const prop = item.prop || `field${index}`
        // 初始化表单数据，使用默认值
        this.formData[prop] = this.getInitialValue(item)
        
        // 处理验证规则
        if (item.rules && Array.isArray(item.rules) && item.rules.length > 0) {
          this.formRules[prop] = item.rules.map(rule => {
            switch(rule.type) {
              case 'required':
                return {
                  required: true,
                  message: rule.message || `${item.label}不能为空`,
                  trigger: rule.trigger || ['blur', 'change']
                }
              case 'pattern':
                try {
                  return {
                    pattern: new RegExp(rule.pattern),
                    message: rule.message || '格式不正确',
                    trigger: rule.trigger || 'blur'
                  }
                } catch (e) {
                  console.error('正则表达式格式错误:', rule.pattern)
                  return null
                }
              case 'length':
                return {
                  min: rule.min,
                  max: rule.max,
                  message: rule.message || `长度应在 ${rule.min || 0} 到 ${rule.max || 'n'} 之间`,
                  trigger: rule.trigger || 'blur'
                }
              case 'validator':
                return {
                  validator: (rule, value, callback) => {
                    try {
                      if (!rule.script) {
                        callback()
                        return
                      }
                      const fn = new Function('value', 'callback', rule.script)
                      fn(value, callback)
                    } catch (error) {
                      console.error('自定义验证执行错误:', error)
                      callback(new Error(rule.message || '验证失败'))
                    }
                  },
                  trigger: rule.trigger || 'blur'
                }
              default:
                return rule
            }
          }).filter(Boolean)
        }
      })
      
      this.previewVisible = true
      this.$nextTick(() => {
        if (this.$refs.previewForm) {
          this.$refs.previewForm.clearValidate()
        }
      })
    },
    handleSave() {
      const config = this.$refs.formDesigner.getFormConfig()
      console.log('Form config:', config)
      this.$message.success('保存成功')
    },
    handleTest() {
      if (!this.$refs.previewForm) return
      
      this.$refs.previewForm.validate(valid => {
        if (valid) {
          console.log('验证通过，表单数据:', this.formData)
          this.$message.success('验证通过')
        } else {
          this.$message.error('表单验证失败，请检查输入')
        }
      })
    },
    getComponentName(type) {
      const componentMap = {
        'input': 'a-input',
        'textarea': 'a-textarea',
        'number': 'a-input-number',
        'select': 'a-select',
        'radio': 'a-radio-group',
        'checkbox': 'a-checkbox-group',
        'date': 'a-date-picker',
        'time': 'a-time-picker',
        'switch': 'a-switch'
      }
      return componentMap[type] || `a-${type}`
    },
    getInitialValue(item) {
      if (item.options?.defaultValue !== undefined) {
        return item.options.defaultValue
      }
      
      switch(item.type) {
        case 'switch':
          return false
        case 'checkbox':
          return []
        case 'number':
          return undefined
        default:
          return ''
      }
    },
    getPreviewProps(item) {
      const props = {
        ...item.options,
        placeholder: item.options.placeholder || `请输入${item.label}`
      }
      
      switch(item.type) {
        case 'select':
        case 'radio':
        case 'checkbox':
          props.options = Array.isArray(item.options.options) ? item.options.options : []
          break
        case 'number':
          props.min = item.options.min !== undefined ? Number(item.options.min) : undefined
          props.max = item.options.max !== undefined ? Number(item.options.max) : undefined
          props.step = item.options.step ? Number(item.options.step) : 1
          props.precision = item.options.precision ? Number(item.options.precision) : 0
          break
        case 'input':
        case 'textarea':
          if (item.rules) {
            const lengthRule = item.rules.find(r => r.type === 'length')
            if (lengthRule) {
              props.maxLength = lengthRule.max
              props.showCount = true
            }
          }
          props.allowClear = item.options.allowClear !== false
          break
      }
      
      return props
    }
  }
}
</script>

<style lang="less" scoped>
.form-builder {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;

  &-header {
    padding: 16px;
    border-bottom: 1px solid #d9d9d9;
  }

  &-content {
    flex: 1;
    overflow: hidden;
  }
}
</style>