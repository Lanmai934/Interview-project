<template>
  <div class="gis-container">
    <!-- 地图容器 -->
    <div id="map" ref="mapContainer"></div>
    
    <!-- 控制面板 -->
    <div class="control-panel">
      <a-card title="地图控制" :bordered="false">
        <a-tabs>
          <!-- 基础功能 Tab -->
          <a-tab-pane key="basic" tab="基础功能">
            <a-form-model layout="vertical">
              <!-- 底图切换 -->
              <a-form-model-item label="底图类型">
                <a-radio-group v-model="mapControls.baseMap" @change="changeBaseMap">
                  <a-radio value="OSM">OpenStreetMap</a-radio>
                  <a-radio value="Satellite">卫星影像</a-radio>
                </a-radio-group>
              </a-form-model-item>
              
              <!-- 图层控制 -->
              <a-form-model-item label="图层显示">
                <a-checkbox-group v-model="mapControls.layers" @change="toggleLayers">
                  <a-checkbox value="points">点图层</a-checkbox>
                  <a-checkbox value="lines">线图层</a-checkbox>
                  <a-checkbox value="polygons">面图层</a-checkbox>
                </a-checkbox-group>
              </a-form-model-item>
              
              <!-- 工具控制 -->
              <a-form-model-item label="工具">
                <a-button-group>
                  <a-button @click="enableDraw('Point')">
                    <a-icon type="environment" />绘制点
                  </a-button>
                  <a-button @click="enableDraw('LineString')">
                    <a-icon type="minus" />绘制线
                  </a-button>
                  <a-button @click="enableDraw('Polygon')">
                    <a-icon type="border" />绘制面
                  </a-button>
                </a-button-group>
              </a-form-model-item>
              
              <!-- 测量工具 -->
              <a-form-model-item label="测量工具">
                <a-button-group>
                  <a-button @click="enableMeasure('distance')">
                    <a-icon type="line" />距离测量
                  </a-button>
                  <a-button @click="enableMeasure('area')">
                    <a-icon type="block" />面积测量
                  </a-button>
                </a-button-group>
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>

          <!-- 分析工具 Tab -->
          <a-tab-pane key="analysis" tab="分析工具">
            <a-form-model layout="vertical">
              <a-form-model-item label="空间分析">
                <a-button-group>
                  <a-button @click="enableBuffer">缓冲区分析</a-button>
                  <a-button @click="enableIntersect">相交分析</a-button>
                  <a-button @click="enableUnion">合并分析</a-button>
                </a-button-group>
              </a-form-model-item>

              <a-form-model-item label="热力图">
                <a-switch v-model="showHeatmap" @change="toggleHeatmap" />
                <a-slider v-model="heatmapRadius" :min="1" :max="50" @change="updateHeatmap" />
              </a-form-model-item>

              <a-form-model-item label="路径规划">
                <a-input-group compact>
                  <a-input style="width: 45%" v-model="routeStart" placeholder="起点" />
                  <a-input style="width: 45%" v-model="routeEnd" placeholder="终点" />
                  <a-button type="primary" @click="calculateRoute">规划</a-button>
                </a-input-group>
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>

          <!-- 数据工具 Tab -->
          <a-tab-pane key="data" tab="数据工具">
            <a-form-model layout="vertical">
              <a-form-model-item label="数据导入">
                <a-upload
                  name="file"
                  :before-upload="handleFileUpload"
                  accept=".geojson,.csv,.kml"
                >
                  <a-button>
                    <a-icon type="upload" /> 选择文件
                  </a-button>
                </a-upload>
              </a-form-model-item>

              <a-form-model-item label="数据导出">
                <a-button-group>
                  <a-button @click="exportData('geojson')">GeoJSON</a-button>
                  <a-button @click="exportData('kml')">KML</a-button>
                </a-button-group>
              </a-form-model-item>

              <a-form-model-item label="地理编码">
                <a-input-search
                  v-model="geocodeAddress"
                  placeholder="输入地址"
                  @search="performGeocode"
                  enterButton
                />
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </div>
</template>

<script>
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import XYZ from 'ol/source/XYZ'
import { Draw } from 'ol/interaction'
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style'
import { transform, fromLonLat } from 'ol/proj'
import * as turf from '@turf/turf'
import Feature from 'ol/Feature'
import LineString from 'ol/geom/LineString'
import Point from 'ol/geom/Point'
import Polygon from 'ol/geom/Polygon'
import { GeoJSON } from 'ol/format'
import { KML } from 'ol/format'
import HeatmapLayer from 'ol/layer/Heatmap'
import polyline from '@mapbox/polyline'
import { initWasm, getWasmModule } from '@/utils/wasm-loader'

export default {
  name: 'WebGIS',
  data() {
    return {
      map: null,
      mapControls: {
        baseMap: 'OSM',
        layers: ['points'],
        currentTool: null
      },
      vectorSource: null,
      vectorLayer: null,
      draw: null,
      showHeatmap: false,
      heatmapRadius: 20,
      heatmapLayer: null,
      routeStart: '',
      routeEnd: '',
      geocodeAddress: '',
      bufferDistance: 1000,
      analysisLayer: null,
      wasmReady: false
    }
  },
  async mounted() {
    this.initMap()
    this.initVectorLayers()
    this.wasmReady = await initWasm()
  },
  beforeDestroy() {
    if (this.map) {
      this.map.setTarget(null)
    }
  },
  methods: {
    initMap() {
      // 创建地图
      this.map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View({
          center: transform([116.397428, 39.90923], 'EPSG:4326', 'EPSG:3857'),
          zoom: 12
        })
      })
    },
    
    initVectorLayers() {
      // 创建矢量图层
      this.vectorSource = new VectorSource()
      this.vectorLayer = new VectorLayer({
        source: this.vectorSource,
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new Stroke({
            color: '#ffcc33',
            width: 2
          }),
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: '#ffcc33'
            })
          })
        })
      })
      
      this.map.addLayer(this.vectorLayer)
    },
    
    changeBaseMap(e) {
      const layers = this.map.getLayers()
      const baseLayer = layers.getArray()[0]
      
      if (e.target.value === 'Satellite') {
        // 切换到卫星影像图
        baseLayer.setSource(
          new XYZ({
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          })
        )
      } else {
        // 切换回 OSM
        baseLayer.setSource(new OSM())
      }
    },
    
    toggleLayers(checkedValues) {
      // 这里可以根据选中的值显示/隐藏对应图层
      console.log('Checked layers:', checkedValues)
    },
    
    enableDraw(type) {
      // 移除已有的绘制工具
      if (this.draw) {
        this.map.removeInteraction(this.draw)
      }
      
      // 创建新的绘制工具
      this.draw = new Draw({
        source: this.vectorSource,
        type: type
      })
      
      this.map.addInteraction(this.draw)
      
      // 监听绘制完成事件
      this.draw.on('drawend', (event) => {
        console.log('Feature drawn:', event.feature)
      })
    },
    
    enableMeasure(type) {
      if (this.draw) {
        this.map.removeInteraction(this.draw)
      }
      
      this.draw = new Draw({
        source: this.vectorSource,
        type: type === 'distance' ? 'LineString' : 'Polygon',
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new Stroke({
            color: '#ff0000',
            width: 2
          }),
          image: new CircleStyle({
            radius: 5,
            stroke: new Stroke({
              color: '#ff0000'
            }),
            fill: new Fill({
              color: '#ff0000'
            })
          })
        })
      })
      
      this.map.addInteraction(this.draw)
      
      this.draw.on('drawend', async (event) => {
        const feature = event.feature
        const geometry = feature.getGeometry()
        const coordinates = geometry.getCoordinates()
        
        let measurement
        if (type === 'distance') {
          measurement = await this.measureDistanceWasm(coordinates)
          measurement = measurement ? `${(measurement / 1000).toFixed(2)} km` : '计算失败'
        } else {
          measurement = await this.measureAreaWasm(coordinates[0])
          measurement = measurement ? `${(measurement / 1000000).toFixed(2)} km²` : '计算失败'
        }
        
        this.$message.info(`测量结果: ${measurement}`)
      })
    },
    
    formatLength(line) {
      const length = line.getLength()
      if (length > 1000) {
        return Math.round((length / 1000) * 100) / 100 + ' km'
      } else {
        return Math.round(length * 100) / 100 + ' m'
      }
    },
    
    formatArea(polygon) {
      const area = polygon.getArea()
      if (area > 1000000) {
        return Math.round((area / 1000000) * 100) / 100 + ' km²'
      } else {
        return Math.round(area * 100) / 100 + ' m²'
      }
    },

    // 缓冲区分析
    async enableBuffer() {
      this.$confirm({
        title: '缓冲区分析',
        content: h => (
          <div>
            <a-input-number 
              value={this.bufferDistance} 
              onChange={val => this.bufferDistance = val}
              min={100}
              max={5000}
              step={100}
            />
            <span style="margin-left: 8px">米</span>
          </div>
        ),
        onOk: () => {
          if (this.draw) {
            this.map.removeInteraction(this.draw)
          }
          this.draw = new Draw({
            source: this.vectorSource,
            type: 'Point'
          })
          this.draw.on('drawend', (evt) => {
            const feature = evt.feature
            const geometry = feature.getGeometry()
            const coord = transform(geometry.getCoordinates(), 'EPSG:3857', 'EPSG:4326')
            
            try {
              const point = turf.point(coord)
              const buffered = turf.buffer(point, this.bufferDistance / 1000)
              
              // 转换回 EPSG:3857 并添加到地图
              const bufferCoords = buffered.geometry.coordinates[0].map(coord =>
                transform(coord, 'EPSG:4326', 'EPSG:3857')
              )
              
              const bufferFeature = new Feature({
                geometry: new Polygon([bufferCoords])
              })
              
              bufferFeature.setStyle(new Style({
                fill: new Fill({
                  color: 'rgba(0, 0, 255, 0.2)'
                }),
                stroke: new Stroke({
                  color: '#0000ff',
                  width: 2
                })
              }))
              
              this.vectorSource.addFeature(bufferFeature)
              this.$message.success('缓冲区分析完成')
            } catch (error) {
              console.error('Buffer analysis failed:', error)
              this.$message.error('缓冲区分析失败')
            }
          })
          this.map.addInteraction(this.draw)
        }
      })
    },

    // 热力图功能
    toggleHeatmap(checked) {
      if (checked) {
        // 创建热力图层
        const points = this.vectorSource.getFeatures()
          .filter(f => f.getGeometry().getType() === 'Point')
          .map(f => ({
            x: f.getGeometry().getCoordinates()[0],
            y: f.getGeometry().getCoordinates()[1],
            value: 1
          }))

        this.heatmapLayer = new HeatmapLayer({
          source: new VectorSource({
            features: points
          }),
          blur: 15,
          radius: this.heatmapRadius
        })
        this.map.addLayer(this.heatmapLayer)
      } else {
        if (this.heatmapLayer) {
          this.map.removeLayer(this.heatmapLayer)
        }
      }
    },

    // 路径规划
    async calculateRoute() {
      try {
        const [start, end] = await Promise.all([
          this.getGeocode(this.routeStart),
          this.getGeocode(this.routeEnd)
        ])

        // 使用 OSRM 进行路径规划
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full`
        )
        const data = await response.json()

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0]
          const geometry = polyline.decode(route.geometry)
          this.addRouteToMap(geometry)
        }
      } catch (error) {
        this.$message.error('路径规划失败')
      }
    },

    // 数据导入
    handleFileUpload(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target.result
        if (file.name.endsWith('.geojson')) {
          this.importGeoJSON(JSON.parse(content))
        } else if (file.name.endsWith('.csv')) {
          this.importCSV(content)
        }
      }
      reader.readAsText(file)
      return false
    },

    // 导出数据
    exportData(format) {
      const features = this.vectorSource.getFeatures()
      if (format === 'geojson') {
        const geojson = new GeoJSON().writeFeaturesObject(features)
        this.downloadFile(JSON.stringify(geojson), 'export.geojson', 'application/json')
      } else if (format === 'kml') {
        const kml = new KML().writeFeatures(features)
        this.downloadFile(kml, 'export.kml', 'application/vnd.google-earth.kml+xml')
      }
    },

    // 地理编码
    async performGeocode() {
      try {
        const result = await this.getGeocode(this.geocodeAddress)
        if (result) {
          this.map.getView().animate({
            center: transform([result.lon, result.lat], 'EPSG:4326', 'EPSG:3857'),
            zoom: 15
          })
          // 添加标记
          this.addMarker([result.lon, result.lat])
        }
      } catch (error) {
        this.$message.error('地理编码失败')
      }
    },

    // 辅助方法
    addGeoJSON(geojson) {
      const format = new GeoJSON()
      const features = format.readFeatures(geojson, {
        featureProjection: 'EPSG:3857'
      })
      this.vectorSource.addFeatures(features)
    },

    addRouteToMap(coordinates) {
      const feature = new Feature({
        geometry: new LineString(coordinates.map(coord => 
          transform([coord[1], coord[0]], 'EPSG:4326', 'EPSG:3857')
        ))
      })
      this.vectorSource.addFeature(feature)
    },

    downloadFile(content, filename, type) {
      const blob = new Blob([content], { type })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },

    async getGeocode(address) {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      )
      const data = await response.json()
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        }
      }
      throw new Error('地址未找到')
    },

    // 使用 WebAssembly 计算距离
    async measureDistanceWasm(coordinates) {
      if (!this.wasmReady) {
        return this.formatLength(coordinates)  // 降级到 JavaScript 实现
      }

      try {
        const wasm = getWasmModule()
        const points = coordinates.map(coord => ({
          x: coord[0],
          y: coord[1]
        }))

        let totalDistance = 0
        for (let i = 1; i < points.length; i++) {
          totalDistance += wasm.GisOps.calculate_distance(
            points[i - 1],
            points[i]
          )
        }

        return totalDistance
      } catch (error) {
        console.error('WebAssembly distance calculation failed:', error)
        return this.formatLength(coordinates)  // 降级到 JavaScript 实现
      }
    },

    // 使用 WebAssembly 计算面积
    async measureAreaWasm(coordinates) {
      if (!this.wasmReady) {
        return this.formatArea(coordinates)  // 降级到 JavaScript 实现
      }

      try {
        const wasm = getWasmModule()
        const points = coordinates.map(coord => ({
          x: coord[0],
          y: coord[1]
        }))

        return wasm.GisOps.calculate_area(points)
      } catch (error) {
        console.error('WebAssembly area calculation failed:', error)
        return this.formatArea(coordinates)  // 降级到 JavaScript 实现
      }
    },

    // 相交分析
    enableIntersect() {
      if (this.draw) {
        this.map.removeInteraction(this.draw)
      }
      
      let firstPolygon = null
      
      this.draw = new Draw({
        source: this.vectorSource,
        type: 'Polygon'
      })
      
      this.draw.on('drawend', (evt) => {
        const feature = evt.feature
        const geometry = feature.getGeometry()
        const coords = geometry.getCoordinates()[0].map(coord => 
          transform(coord, 'EPSG:3857', 'EPSG:4326')
        )
        
        if (!firstPolygon) {
          firstPolygon = turf.polygon([coords])
          this.$message.info('请绘制第二个多边形')
        } else {
          try {
            const secondPolygon = turf.polygon([coords])
            const intersection = turf.intersect(firstPolygon, secondPolygon)
            
            if (intersection) {
              // 转换回 EPSG:3857 并添加到地图
              const intersectCoords = intersection.geometry.coordinates[0].map(coord =>
                transform(coord, 'EPSG:4326', 'EPSG:3857')
              )
              
              const intersectFeature = new Feature({
                geometry: new Polygon([intersectCoords])
              })
              
              intersectFeature.setStyle(new Style({
                fill: new Fill({
                  color: 'rgba(255, 0, 0, 0.2)'
                }),
                stroke: new Stroke({
                  color: '#ff0000',
                  width: 2
                })
              }))
              
              this.vectorSource.addFeature(intersectFeature)
              this.$message.success('相交分析完成')
            } else {
              this.$message.warning('没有相交区域')
            }
            
            firstPolygon = null
          } catch (error) {
            console.error('Intersection analysis failed:', error)
            this.$message.error('相交分析失败')
            firstPolygon = null
          }
        }
      })
      
      this.map.addInteraction(this.draw)
    },

    // 合并分析
    enableUnion() {
      if (this.draw) {
        this.map.removeInteraction(this.draw)
      }
      
      let polygons = []
      
      this.draw = new Draw({
        source: this.vectorSource,
        type: 'Polygon'
      })
      
      this.draw.on('drawend', (evt) => {
        const feature = evt.feature
        const geometry = feature.getGeometry()
        const coords = geometry.getCoordinates()[0].map(coord => 
          transform(coord, 'EPSG:3857', 'EPSG:4326')
        )
        
        polygons.push(turf.polygon([coords]))
        
        if (polygons.length === 2) {
          try {
            const union = turf.union(polygons[0], polygons[1])
            
            // 转换回 EPSG:3857 并添加到地图
            const unionCoords = union.geometry.coordinates[0].map(coord =>
              transform(coord, 'EPSG:4326', 'EPSG:3857')
            )
            
            const unionFeature = new Feature({
              geometry: new Polygon([unionCoords])
            })
            
            unionFeature.setStyle(new Style({
              fill: new Fill({
                color: 'rgba(0, 255, 0, 0.2)'
              }),
              stroke: new Stroke({
                color: '#00ff00',
                width: 2
              })
            }))
            
            this.vectorSource.addFeature(unionFeature)
            this.$message.success('合并分析完成')
            polygons = []
          } catch (error) {
            console.error('Union analysis failed:', error)
            this.$message.error('合并分析失败')
            polygons = []
          }
        } else {
          this.$message.info('请绘制第二个多边形')
        }
      })
      
      this.map.addInteraction(this.draw)
    },

    addMarker(coordinates) {
      const feature = new Feature({
        geometry: new Point(fromLonLat(coordinates))
      })
      feature.setStyle(new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: '#ff0000'
          }),
          stroke: new Stroke({
            color: '#ffffff',
            width: 2
          })
        })
      }))
      this.vectorSource.addFeature(feature)
    }
  }
}
</script>

<style lang="less" scoped>
.gis-container {
  width: 100%;
  height: 100vh;
  position: relative;
  
  #map {
    width: 100%;
    height: 100%;
  }
  
  .control-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 350px;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

.ant-form-model-item {
  margin-bottom: 12px;
}
</style> 