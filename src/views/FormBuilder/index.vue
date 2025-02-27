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
            v-bind="item.options"
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
      
      // 处理表单规则
      this.formConfig.formItems.forEach((item, index) => {
        const prop = item.prop || `field${index}`
        if (item.rules && item.rules.length) {
          this.formRules[prop] = item.rules.map(rule => {
            if (rule.type === 'required') {
              return {
                required: true,
                message: rule.message || `${item.label}不能为空`
              }
            }
            if (rule.type === 'pattern') {
              return {
                pattern: new RegExp(rule.pattern),
                message: rule.message
              }
            }
            return rule
          })
        }
      })
      
      this.previewVisible = true
    },
    handleSave() {
      const config = this.$refs.formDesigner.getFormConfig()
      console.log('Form config:', config)
      this.$message.success('保存成功')
    },
    handleTest() {
      this.$refs.previewForm.validate(valid => {
        if (valid) {
          console.log('Form data:', this.formData)
          this.$message.success('验证通过')
        }
      })
    },
    getComponentName(type) {
      return `a-${type}`
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