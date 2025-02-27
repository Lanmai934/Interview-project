export const basicComponents = [
  {
    type: 'input',
    icon: 'edit',
    label: '输入框',
    options: {
      type: 'text',
      width: '100%',
      defaultValue: '',
      placeholder: '请输入',
      disabled: false
    },
    rules: []
  },
  {
    type: 'select',
    icon: 'bars',
    label: '下拉选择',
    options: {
      width: '100%',
      defaultValue: undefined,
      multiple: false,
      disabled: false,
      clearable: false,
      placeholder: '请选择',
      options: [
        {
          value: '1',
          label: '选项1'
        },
        {
          value: '2',
          label: '选项2'
        }
      ]
    },
    rules: []
  },
  {
    type: 'radio',
    icon: 'check-circle',
    label: '单选框组',
    options: {
      disabled: false,
      defaultValue: undefined,
      options: [
        {
          value: '1',
          label: '选项1'
        },
        {
          value: '2',
          label: '选项2'
        }
      ]
    },
    rules: []
  },
  {
    type: 'checkbox',
    icon: 'check-square',
    label: '多选框组',
    options: {
      disabled: false,
      defaultValue: [],
      options: [
        {
          value: '1',
          label: '选项1'
        },
        {
          value: '2',
          label: '选项2'
        }
      ]
    },
    rules: []
  },
  {
    type: 'date',
    icon: 'calendar',
    label: '日期选择',
    options: {
      width: '100%',
      defaultValue: '',
      disabled: false,
      clearable: false,
      placeholder: '请选择日期'
    },
    rules: []
  }
]