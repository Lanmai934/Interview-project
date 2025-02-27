import BaseTable from './BaseTable'
import BaseForm from './BaseForm'
import BaseModal from './BaseModal'

const components = [
  BaseTable,
  BaseForm,
  BaseModal
]

const install = function(Vue) {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

export default {
  install,
  BaseTable,
  BaseForm,
  BaseModal
} 