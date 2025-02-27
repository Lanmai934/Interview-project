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
            <component
              :is="getComponentName(item.type)"
              v-bind="getComponentProps(item)"
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
      },
      
      handleDrop(e) {
        const component = JSON.parse(e.dataTransfer.getData('component'))
        this.formItems.push(cloneDeep(component))
      },
      
      selectComponent(index) {
        this.currentIndex = index
      },
      
      removeComponent(index) {
        this.formItems.splice(index, 1)
        if (this.currentIndex === index) {
          this.currentIndex = -1
        }
      },
      
      moveComponent(index, direction) {
        const newIndex = index + direction
        const temp = this.formItems[index]
        this.$set(this.formItems, index, this.formItems[newIndex])
        this.$set(this.formItems, newIndex, temp)
        this.currentIndex = newIndex
      },
      
      getComponentName(type) {
        return `a-${type}`
      },
      
      getComponentProps(item) {
        return {
          ...item.options,
          placeholder: item.options.placeholder || `请输入${item.label}`
        }
      },
      
      updateComponent(component) {
        this.$set(this.formItems, this.currentIndex, component)
      },
      
      getFormConfig() {
        return {
          formItems: cloneDeep(this.formItems)
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
        
        &.active {
          border-color: #1890ff;
        }
        
        .form-item-actions {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          display: none;
          
          .anticon {
            margin-left: 8px;
            cursor: pointer;
            
            &:hover {
              color: #1890ff;
            }
          }
        }
        
        &:hover .form-item-actions {
          display: block;
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
  </style>