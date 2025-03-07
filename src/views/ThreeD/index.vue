<template>
  <div class="three-container" ref="threeContainer">
    <!-- 控制面板 -->
    <div class="control-panel">
      <a-card title="场景控制" :bordered="false">
        <a-form-model layout="vertical">
          <a-form-model-item label="旋转速度">
            <a-slider v-model="controls.rotationSpeed" :min="0" :max="0.1" :step="0.001" />
          </a-form-model-item>
          <a-form-model-item label="颜色">
            <a-radio-group v-model="controls.color">
              <a-radio value="red">红色</a-radio>
              <a-radio value="green">绿色</a-radio>
              <a-radio value="blue">蓝色</a-radio>
            </a-radio-group>
          </a-form-model-item>
          <a-form-model-item label="形状">
            <a-select v-model="controls.shape">
              <a-select-option value="cube">立方体</a-select-option>
              <a-select-option value="sphere">球体</a-select-option>
              <a-select-option value="torus">圆环</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-form-model>
      </a-card>
    </div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default {
  name: 'ThreeD',
  data() {
    return {
      scene: null,
      camera: null,
      renderer: null,
      mesh: null,
      controls: {
        rotationSpeed: 0.01,
        color: 'red',
        shape: 'cube'
      },
      animationFrameId: null
    }
  },
  watch: {
    'controls.color'(newColor) {
      if (this.mesh) {
        this.mesh.material.color.setStyle(newColor)
      }
    },
    'controls.shape'(newShape) {
      this.updateShape(newShape)
    }
  },
  mounted() {
    this.initThree()
    this.animate()
    window.addEventListener('resize', this.onWindowResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onWindowResize)
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    // 清理 Three.js 资源
    this.dispose()
  },
  methods: {
    initThree() {
      const container = this.$refs.threeContainer
      const width = container.clientWidth
      const height = container.clientHeight

      // 创建场景
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0xf0f0f0)

      // 创建相机
      this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
      this.camera.position.z = 5

      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setSize(width, height)
      container.appendChild(this.renderer.domElement)

      // 添加轨道控制器
      const orbitControls = new OrbitControls(this.camera, this.renderer.domElement)
      orbitControls.enableDamping = true

      // 添加光源
      const ambientLight = new THREE.AmbientLight(0x404040)
      this.scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(1, 1, 1)
      this.scene.add(directionalLight)

      // 创建初始几何体
      this.updateShape(this.controls.shape)

      // 添加坐标轴辅助
      const axesHelper = new THREE.AxesHelper(5)
      this.scene.add(axesHelper)
    },

    updateShape(shape) {
      // 移除旧的网格
      if (this.mesh) {
        this.scene.remove(this.mesh)
        this.mesh.geometry.dispose()
        this.mesh.material.dispose()
      }

      // 创建几何体
      let geometry
      switch (shape) {
        case 'sphere':
          geometry = new THREE.SphereGeometry(1, 32, 32)
          break
        case 'torus':
          geometry = new THREE.TorusGeometry(1, 0.4, 16, 100)
          break
        case 'cube':
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1)
      }

      // 创建材质
      const material = new THREE.MeshPhongMaterial({
        color: this.controls.color,
        flatShading: true
      })

      // 创建网格
      this.mesh = new THREE.Mesh(geometry, material)
      this.scene.add(this.mesh)
    },

    animate() {
      this.animationFrameId = requestAnimationFrame(this.animate)

      if (this.mesh) {
        this.mesh.rotation.x += this.controls.rotationSpeed
        this.mesh.rotation.y += this.controls.rotationSpeed
      }

      this.renderer.render(this.scene, this.camera)
    },

    onWindowResize() {
      const container = this.$refs.threeContainer
      const width = container.clientWidth
      const height = container.clientHeight

      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
    },

    dispose() {
      // 清理场景
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose()
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })

      // 清理渲染器
      this.renderer.dispose()
      this.renderer.domElement.remove()
    }
  }
}
</script>

<style lang="less" scoped>
.three-container {
  width: 100%;
  height: 100vh;
  position: relative;

  .control-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 300px;
    z-index: 100;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}
</style> 