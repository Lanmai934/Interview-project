<template>
  <div class="component-props">
    <a-form-model layout="vertical">
      <a-form-model-item label="标签名">
        <a-input :value="currentComponent.label" @input="updateComponent('label', $event)" />
      </a-form-model-item>

      <!-- 通用属性 -->
      <template v-if="currentComponent.options">
        <a-form-model-item label="占位提示" v-if="hasPlaceholder">
          <a-input 
            :value="currentComponent.options.placeholder" 
            @input="updateComponentOption('placeholder', $event)"
          />
        </a-form-model-item>

        <a-form-model-item label="默认值">
          <a-input 
            v-if="!hasOptions" 
            :value="currentComponent.options.defaultValue"
            @input="updateComponentOption('defaultValue', $event)"
          />
          <a-select 
            v-else 
            :value="currentComponent.options.defaultValue"
            :mode="currentComponent.type === 'checkbox' ? 'multiple' : ''"
            @change="updateComponentOption('defaultValue', $event)"
          >
            <a-select-option 
              v-for="item in currentComponent.options.options" 
              :key="item.value" 
              :value="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-form-model-item label="禁用">
          <a-switch 
            :checked="currentComponent.options.disabled"
            @change="updateComponentOption('disabled', $event)"
          />
        </a-form-model-item>

        <!-- 选项配置 -->
        <template v-if="hasOptions">
          <a-divider>选项配置</a-divider>
          <a-form-model-item 
            v-for="(item, index) in currentComponent.options.options"
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
        <a-form-model-item
          v-for="(rule, index) in currentComponent.rules"
          :key="index"
        >
          <a-input-group compact>
            <a-select
              style="width: 30%"
              :value="rule.type"
              @change="updateRule(index, 'type', $event)"
            >
              <a-select-option value="required">必填</a-select-option>
              <a-select-option value="pattern">正则</a-select-option>
            </a-select>
            <a-input
              v-if="rule.type === 'pattern'"
              style="width: 50%"
              :value="rule.pattern"
              placeholder="正则表达式"
              @input="updateRule(index, 'pattern', $event)"
            />
            <a-input
              style="width: 50%"
              :value="rule.message"
              placeholder="错误提示"
              @input="updateRule(index, 'message', $event)"
            />
            <a-button
              type="link"
              style="width: 20%"
              @click="removeRule(index)"
              danger
            >
              删除
            </a-button>
          </a-input-group>
        </a-form-model-item>
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
  computed: {
    hasPlaceholder() {
      return ['input', 'select', 'date'].includes(this.currentComponent.type)
    },
    hasOptions() {
      return ['select', 'radio', 'checkbox'].includes(this.currentComponent.type)
    }
  },
  methods: {
    emitUpdate(newComponent) {
      this.$emit('update:component', newComponent)
    },
    
    updateComponent(key, value) {
      const newComponent = cloneDeep(this.currentComponent)
      newComponent[key] = value
      this.emitUpdate(newComponent)
    },
    
    updateComponentOption(key, value) {
      const newComponent = cloneDeep(this.currentComponent)
      newComponent.options[key] = value
      this.emitUpdate(newComponent)
    },
    
    addOption() {
      const newComponent = cloneDeep(this.currentComponent)
      newComponent.options.options.push({
        label: '新选项',
        value: ''
      })
      this.emitUpdate(newComponent)
    },
    
    removeOption(index) {
      const newComponent = cloneDeep(this.currentComponent)
      newComponent.options.options.splice(index, 1)
      this.emitUpdate(newComponent)
    },
    
    updateOption(index, key, value) {
      const newComponent = cloneDeep(this.currentComponent)
      newComponent.options.options[index][key] = value
      this.emitUpdate(newComponent)
    },
    
    addRule() {
      const newComponent = cloneDeep(this.currentComponent)
      if (!newComponent.rules) {
        newComponent.rules = []
      }
      newComponent.rules.push({
        type: 'required',
        message: ''
      })
      this.emitUpdate(newComponent)
    },
    
    removeRule(index) {
      const newComponent = cloneDeep(this.currentComponent)
      newComponent.rules.splice(index, 1)
      this.emitUpdate(newComponent)
    },
    
    updateRule(index, key, value) {
      const newComponent = cloneDeep(this.currentComponent)
      newComponent.rules[index][key] = value
      this.emitUpdate(newComponent)
    }
  }
}
</script>

<style lang="less" scoped>
.component-props {
  padding: 16px;
}
</style>