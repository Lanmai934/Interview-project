<template>
  <div class="component-props">
    <a-form-model layout="vertical">
      <a-form-model-item label="标签名">
        <a-input v-model="componentData.label" @change="handleLabelChange" />
      </a-form-model-item>

      <!-- 通用属性 -->
      <template v-if="componentData.options">
        <a-form-model-item label="占位提示" v-if="hasPlaceholder">
          <a-input 
            v-model="componentData.options.placeholder"
            @change="handleOptionChange('placeholder')"
          />
        </a-form-model-item>

        <a-form-model-item label="默认值">
          <template v-if="!hasOptions">
            <a-input 
              v-if="componentData.type === 'input' || componentData.type === 'textarea'"
              :value="componentData.options.defaultValue"
              allow-clear
              placeholder="请输入默认值"
              @input="handleInputChange"
              @change="handleInputChange"
            />
            <a-input-number 
              v-else-if="componentData.type === 'number'"
              :value="componentData.options.defaultValue"
              :min="componentData.options.min"
              :max="componentData.options.max"
              :precision="componentData.options.precision || 0"
              @change="handleNumberChange"
            />
            <a-switch
              v-else-if="componentData.type === 'switch'"
              :checked="!!componentData.options.defaultValue"
              @change="handleSwitchChange"
            />
          </template>
          <a-select 
            v-else 
            class="full-width"
            :value="componentData.options.defaultValue"
            :mode="componentData.type === 'checkbox' ? 'multiple' : undefined"
            allow-clear
            placeholder="请选择默认值"
            @change="handleSelectChange"
          >
            <a-select-option 
              v-for="item in componentData.options.options" 
              :key="item.value" 
              :value="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-form-model-item label="禁用">
          <a-switch 
            :checked="componentData.options.disabled"
            @change="handleOptionChange('disabled')"
          />
        </a-form-model-item>

        <!-- 选项配置 -->
        <template v-if="hasOptions">
          <a-divider>选项配置</a-divider>
          <a-form-model-item 
            v-for="(item, index) in componentData.options.options"
            :key="index"
            :label="`选项${index + 1}`"
          >
            <a-input-group compact>
              <a-input
                style="width: 40%"
                :value="item.label"
                placeholder="选项名"
                @input="updateOption(index, 'label', $event)"
              />
              <a-input
                style="width: 40%"
                :value="item.value"
                placeholder="选项值"
                @input="updateOption(index, 'value', $event)"
              />
              <a-button
                type="link"
                style="width: 20%"
                @click="removeOption(index)"
                danger
              >
                删除
              </a-button>
            </a-input-group>
          </a-form-model-item>
          <a-button block type="dashed" @click="addOption">
            <a-icon type="plus" />添加选项
          </a-button>
        </template>

        <!-- 验证规则 -->
        <a-divider>验证规则</a-divider>
        <template v-if="componentData.rules">
          <a-form-model-item
            v-for="(rule, index) in componentData.rules"
            :key="index"
          >
            <a-input-group compact>
              <a-select
                style="width: 100px"
                v-model="rule.type"
                @change="value => updateRule(index, 'type', value)"
              >
                <a-select-option value="required">必填</a-select-option>
                <a-select-option value="pattern">正则</a-select-option>
                <a-select-option value="length">长度</a-select-option>
                <a-select-option value="validator">自定义</a-select-option>
              </a-select>
              
              <template v-if="rule.type === 'pattern'">
                <a-input
                  style="width: calc(100% - 220px)"
                  v-model="rule.pattern"
                  placeholder="正则表达式"
                  @change="() => updateRule(index, 'pattern', rule.pattern)"
                />
              </template>
              
              <template v-else-if="rule.type === 'length'">
                <a-input-number
                  style="width: 70px"
                  v-model="rule.min"
                  placeholder="最小"
                  :min="0"
                  @change="value => updateRule(index, 'min', value)"
                />
                <a-input-number
                  style="width: 70px"
                  v-model="rule.max"
                  placeholder="最大"
                  :min="rule.min || 0"
                  @change="value => updateRule(index, 'max', value)"
                />
              </template>
              
              <template v-else-if="rule.type === 'validator'">
                <a-input
                  style="width: calc(100% - 220px)"
                  v-model="rule.script"
                  placeholder="验证脚本"
                  @change="() => updateRule(index, 'script', rule.script)"
                />
              </template>
              
              <a-input
                :style="{
                  width: rule.type === 'required' 
                    ? 'calc(100% - 180px)' 
                    : rule.type === 'length'
                    ? 'calc(100% - 320px)'
                    : 'calc(100% - 220px)'
                }"
                v-model="rule.message"
                placeholder="错误提示"
                @change="() => updateRule(index, 'message', rule.message)"
              />
              <a-button
                type="link"
                style="width: 80px"
                @click="removeRule(index)"
                danger
              >
                删除
              </a-button>
            </a-input-group>
          </a-form-model-item>
        </template>
        <a-button block type="dashed" @click="addRule">
          <a-icon type="plus" />添加规则
        </a-button>
      </template>
    </a-form-model>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash'

export default {
  name: 'ComponentProps',
  props: {
    currentComponent: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      componentData: cloneDeep(this.currentComponent)
    }
  },
  watch: {
    currentComponent: {
      handler(val) {
        this.componentData = cloneDeep(val)
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    hasPlaceholder() {
      return ['input', 'textarea', 'select', 'date'].includes(this.componentData.type)
    },
    hasOptions() {
      return ['select', 'radio', 'checkbox'].includes(this.componentData.type)
    }
  },
  methods: {
    handleLabelChange() {
      this.emitUpdate()
    },
    
    handleInputChange(e) {
      const value = typeof e === 'string' ? e : (e.target ? e.target.value : '')
      this.$set(this.componentData.options, 'defaultValue', value)
      this.emitUpdate()
    },

    handleNumberChange(value) {
      this.$set(this.componentData.options, 'defaultValue', value)
      this.emitUpdate()
    },

    handleSwitchChange(value) {
      this.$set(this.componentData.options, 'defaultValue', value)
      this.emitUpdate()
    },

    handleSelectChange(value) {
      this.$set(this.componentData.options, 'defaultValue', value)
      this.emitUpdate()
    },
    
    updateDefaultValue(value) {
      let processedValue = value
      
      switch(this.componentData.type) {
        case 'number':
          processedValue = value === '' || value === null || value === undefined ? undefined : Number(value)
          break
        case 'checkbox':
          processedValue = Array.isArray(value) ? value : []
          break
        case 'switch':
          processedValue = Boolean(value)
          break
        case 'input':
        case 'textarea':
        case 'select':
        case 'radio':
          processedValue = value === undefined || value === null ? '' : String(value)
          break
      }
      
      this.$set(this.componentData.options, 'defaultValue', processedValue)
      this.emitUpdate()
    },
    
    handleOptionChange(key, value) {
      if (key === 'defaultValue') {
        this.updateDefaultValue(value)
      } else {
        if (value !== undefined) {
          this.$set(this.componentData.options, key, value)
        }
        this.emitUpdate()
      }
    },
    
    emitUpdate() {
      this.$emit('update:component', cloneDeep(this.componentData))
    },
    
    addOption() {
      if (!this.componentData.options.options) {
        this.$set(this.componentData.options, 'options', [])
      }
      this.componentData.options.options.push({
        label: '新选项',
        value: `option_${Date.now()}`
      })
      this.emitUpdate()
    },
    
    removeOption(index) {
      this.componentData.options.options.splice(index, 1)
      // 如果删除的是已选中的值，清空默认值
      const defaultValue = this.componentData.options.defaultValue
      if (this.componentData.type === 'checkbox') {
        if (Array.isArray(defaultValue)) {
          this.componentData.options.defaultValue = defaultValue.filter(
            v => this.componentData.options.options.some(opt => opt.value === v)
          )
        }
      } else {
        if (!this.componentData.options.options.some(opt => opt.value === defaultValue)) {
          this.componentData.options.defaultValue = ''
        }
      }
      this.emitUpdate()
    },
    
    updateOption(index, key, value) {
      this.componentData.options.options[index][key] = value
      this.emitUpdate()
    },
    
    addRule() {
      if (!this.componentData.rules) {
        this.$set(this.componentData, 'rules', [])
      }
      
      const newRule = {
        type: 'required',
        message: `${this.componentData.label}不能为空`,
        trigger: ['blur', 'change']
      }
      
      this.componentData.rules.push(newRule)
      this.emitUpdate()
    },
    
    removeRule(index) {
      this.componentData.rules.splice(index, 1)
      this.emitUpdate()
    },
    
    updateRule(index, key, value) {
      const rule = this.componentData.rules[index]
      
      // 根据规则类型设置默认值
      if (key === 'type') {
        const newRule = {
          type: value,
          trigger: ['blur', 'change']
        }
        
        switch (value) {
          case 'required':
            newRule.message = `${this.componentData.label}不能为空`
            break
          case 'pattern':
            newRule.pattern = ''
            newRule.message = '格式不正确'
            break
          case 'length':
            newRule.min = 0
            newRule.max = undefined
            newRule.message = '长度不符合要求'
            break
          case 'validator':
            newRule.script = ''
            newRule.message = '验证失败'
            break
        }
        
        this.$set(this.componentData.rules, index, { ...rule, ...newRule })
      } else {
        this.$set(rule, key, value)
      }
      
      this.emitUpdate()
    }
  }
}
</script>

<style lang="less" scoped>
.component-props {
  padding: 16px;

  :deep(.ant-select) {
    width: 100%;
  }

  :deep(.ant-input-group.ant-input-group-compact) {
    display: flex;
    width: 100%;
    
    .ant-select {
      &.rule-type-select {
        width: 100px !important;
      }
    }
    
    .ant-input {
      flex: 1;
    }
    
    .ant-input-number {
      margin-right: 2px;
      
      &:last-of-type {
        margin-right: 8px;
      }
    }
    
    .ant-btn {
      flex: none;
    }
  }

  :deep(.ant-form-item) {
    .ant-select,
    .ant-input-number {
      width: 100%;
    }
  }
}
</style>