<template>
    <div class="form-designer">
      <!-- 左侧组件列表 -->
      <div class="components-list">
        <div
          v-for="item in basicComponents"
          :key="item.type"
          class="component-item"
          draggable
          @dragstart="handleDragStart($event, item)"
        >
          <a-icon :type="item.icon" />
          <span>{{ item.label }}</span>
        </div>
      </div>
  
      <!-- 中间设计区域 -->
      <div 
        class="design-area"
        @dragover.prevent
        @drop="handleDrop"
      >
        <template v-if="formItems.length">
          <div
            v-for="(item, index) in formItems"
            :key="index"
            class="form-item"
            :class="{ active: currentIndex === index }"
            @click="selectComponent(index)"
          >
            <div class="form-item-label">{{ item.label }}</div>
            <component
              :is="getComponentName(item.type)"
              :value="getDisplayValue(item)"
              v-bind="getComponentProps(item)"
              @input="value => handlePreviewValueChange(index, value)"
              @change="value => handlePreviewValueChange(index, value)"
            />
            <div class="form-item-actions">
              <a-icon type="delete" @click.stop="removeComponent(index)" />
              <a-icon 
                type="arrow-up" 
                v-if="index > 0"
                @click.stop="moveComponent(index, -1)" 
              />
              <a-icon 
                type="arrow-down"
                v-if="index < formItems.length - 1"
                @click.stop="moveComponent(index, 1)"
              />
            </div>
          </div>
        </template>
        <div v-else class="empty-tip">
          从左侧拖拽组件到这里
        </div>
      </div>
  
      <!-- 右侧属性面板 -->
      <div class="props-panel">
        <template v-if="currentComponent">
          <component-props
            :current-component="currentComponent"
            @update:component="updateComponent"
          />
        </template>
        <div v-else class="empty-tip">
          点击组件编辑属性
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { basicComponents } from './config/components'
  import ComponentProps from './ComponentProps'
  import { cloneDeep } from 'lodash'
  
  export default {
    name: 'FormDesigner',
    
    components: {
      ComponentProps
    },
    
    data() {
      return {
        basicComponents,
        formItems: [],
        currentIndex: -1
      }
    },
    
    computed: {
      currentComponent() {
        return this.currentIndex >= 0 ? this.formItems[this.currentIndex] : null
      }
    },
    
    methods: {
      handleDragStart(e, component) {
        e.dataTransfer.setData('component', JSON.stringify(component))
        e.target.style.opacity = '0.5'
        e.target.addEventListener('dragend', () => {
          e.target.style.opacity = '1'
        }, { once: true })
      },
      
      handleDrop(e) {
        e.preventDefault()
        const component = JSON.parse(e.dataTransfer.getData('component'))
        
        const rect = e.currentTarget.getBoundingClientRect()
        const y = e.clientY - rect.top
        const items = this.$el.querySelectorAll('.form-item')
        let index = this.formItems.length
        
        for (let i = 0; i < items.length; i++) {
          const itemRect = items[i].getBoundingClientRect()
          if (y < itemRect.top + itemRect.height / 2) {
            index = i
            break
          }
        }
        
        const timestamp = new Date().getTime()
        const newComponent = {
          ...cloneDeep(component),
          prop: `field_${timestamp}`,
          options: {
            ...component.options,
            defaultValue: '',
            placeholder: `请输入${component.label}`
          },
          rules: []
        }
        
        switch(newComponent.type) {
          case 'switch':
            newComponent.options.defaultValue = false
            break
          case 'checkbox':
            newComponent.options.defaultValue = []
            break
          case 'number':
            newComponent.options.defaultValue = undefined
            break
          default:
            newComponent.options.defaultValue = ''
        }
        
        this.formItems.splice(index, 0, newComponent)
        this.currentIndex = index
      },
      
      selectComponent(index) {
        this.currentIndex = index
      },
      
      removeComponent(index) {
        this.$confirm({
          title: '确认删除',
          content: '是否确认删除该组件？',
          onOk: () => {
            this.formItems.splice(index, 1)
            if (this.currentIndex === index) {
              this.currentIndex = -1
            } else if (this.currentIndex > index) {
              this.currentIndex--
            }
          }
        })
      },
      
      moveComponent(index, direction) {
        const newIndex = index + direction
        if (newIndex < 0 || newIndex >= this.formItems.length) return
        
        const temp = this.formItems[index]
        this.$set(this.formItems, index, this.formItems[newIndex])
        this.$set(this.formItems, newIndex, temp)
        this.currentIndex = newIndex
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
      
      getDisplayValue(item) {
        const value = item.options.defaultValue
        switch(item.type) {
          case 'number':
            return value === undefined || value === '' || value === null ? undefined : Number(value)
          case 'checkbox':
            return Array.isArray(value) ? value : []
          case 'switch':
            return Boolean(value)
          case 'input':
          case 'textarea':
          case 'select':
          case 'radio':
            return value === undefined || value === null ? '' : String(value)
          default:
            return value
        }
      },
      
      getComponentProps(item) {
        const props = {
          ...item.options,
          placeholder: item.options.placeholder || `请输入${item.label}`,
          allowClear: true
        }
        
        delete props.defaultValue
        
        switch(item.type) {
          case 'select':
          case 'radio':
          case 'checkbox':
            props.options = Array.isArray(item.options.options) ? item.options.options : []
            if (item.type === 'select') {
              props.allowClear = true
            }
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
                props.showCount = lengthRule.max !== undefined
              }
            }
            props.allowClear = true
            break
        }
        
        return props
      },
      
      updateComponent(component) {
        if (component.rules) {
          component.rules = component.rules.map(rule => {
            if (!rule.type) {
              rule.type = 'required'
            }
            
            if (!rule.trigger) {
              rule.trigger = ['blur', 'change']
            }
            
            switch (rule.type) {
              case 'required':
                if (!rule.message) {
                  rule.message = `${component.label}不能为空`
                }
                break
              case 'pattern':
                if (!rule.message) {
                  rule.message = '格式不正确'
                }
                try {
                  new RegExp(rule.pattern)
                } catch (e) {
                  rule.pattern = ''
                }
                break
              case 'length':
                rule.min = rule.min !== undefined ? Number(rule.min) : 0
                rule.max = rule.max !== undefined ? Number(rule.max) : undefined
                if (!rule.message) {
                  rule.message = `长度应在 ${rule.min} 到 ${rule.max || 'n'} 之间`
                }
                break
              case 'validator':
                if (!rule.message) {
                  rule.message = '验证失败'
                }
                if (!rule.script) {
                  rule.script = ''
                }
                break
            }
            
            return rule
          })
        }
        
        this.$set(this.formItems, this.currentIndex, component)
      },
      
      handlePreviewValueChange(index, value) {
        const item = this.formItems[index]
        if (item) {
          let processedValue = value
          
          // 处理事件对象
          if (value && value.target && value.target.value !== undefined) {
            processedValue = value.target.value
          }
          
          switch(item.type) {
            case 'number':
              processedValue = processedValue === '' || processedValue === null || processedValue === undefined 
                ? undefined 
                : Number(processedValue)
              break
            case 'checkbox':
              processedValue = Array.isArray(processedValue) ? processedValue : []
              break
            case 'switch':
              processedValue = Boolean(processedValue)
              break
            case 'input':
            case 'textarea':
            case 'select':
            case 'radio':
              processedValue = processedValue === undefined || processedValue === null 
                ? '' 
                : String(processedValue)
              break
          }
          
          this.$set(item.options, 'defaultValue', processedValue)
        }
      },
      
      getFormConfig() {
        return {
          formItems: cloneDeep(this.formItems.map(item => {
            if (item.rules) {
              item.rules = item.rules.filter(rule => {
                if (rule.type === 'pattern' && rule.pattern) {
                  try {
                    new RegExp(rule.pattern)
                    return true
                  } catch (e) {
                    return false
                  }
                }
                return true
              })
            }
            return item
          }))
        }
      }
    }
  }
  </script>
  
  <style lang="less" scoped>
  .form-designer {
    display: flex;
    height: 100%;
    border: 1px solid #d9d9d9;
    
    .components-list {
      width: 250px;
      border-right: 1px solid #d9d9d9;
      padding: 16px;
      
      .component-item {
        padding: 8px 16px;
        margin-bottom: 8px;
        border: 1px dashed #d9d9d9;
        cursor: move;
        display: flex;
        align-items: center;
        
        .anticon {
          margin-right: 8px;
        }
        
        &:hover {
          border-color: #1890ff;
          color: #1890ff;
        }
      }
    }
    
    .design-area {
      flex: 1;
      padding: 16px;
      background: #f0f2f5;
      overflow-y: auto;
      
      .form-item {
        background: #fff;
        padding: 16px;
        margin-bottom: 8px;
        position: relative;
        border: 1px solid transparent;
        display: flex;
        flex-wrap: wrap;
        align-items: center;

        &.active {
          border-color: #1890ff;
        }
        
        .form-item-label {
          width: 100%;
          margin-bottom: 8px;
          color: rgba(0, 0, 0, 0.85);
          font-size: 14px;
        }
        
        :deep(.ant-input),
        :deep(.ant-input-number),
        :deep(.ant-select),
        :deep(.ant-radio-group),
        :deep(.ant-checkbox-group),
        :deep(.ant-picker) {
          width: 80%;
        }
        
        .form-item-actions {
          width: 20%;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          padding-left: 8px;

          .anticon {
            margin-left: 8px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.3s;

            &:hover {
              color: #1890ff;
            }
          }
        }
        
        &:hover .form-item-actions .anticon {
          opacity: 1;
        }
      }
    }
    
    .props-panel {
      width: 300px;
      border-left: 1px solid #d9d9d9;
      background: #fff;
      overflow-y: auto;
    }
    
    .empty-tip {
      color: #999;
      text-align: center;
      padding: 32px 16px;
    }
  }
  
  .ant-select {
    &.rule-type-select {
      width: 100px !important;
    }
  }
  
  :deep(.ant-select) {
    width: 80%;
  }
  </style>