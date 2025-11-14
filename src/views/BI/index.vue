<template>
  <div class="bi-container">
    <el-button type="primary" @click="createSheet">新建表格</el-button>
     <div id="univer-container" style="width:100%;height:600px;"></div>
  </div>
</template>

<script>
import { Univer } from '@univerjs/core'
import { UniverUIPlugin } from '@univerjs/ui'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'

import '@univerjs/ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
export default {
  name: 'BusinessIntelligence',
  data() {
    return {
      metrics: {
        revenue: 1289342,
        revenueTrend: 12.4,
        orders: 5421,
        orderTrend: -3.1,
        newUsers: 812,
        userTrend: 6.8,
        conversionRate: 3.45,
        conversionTrend: 0.7
      },
      columns: [
        { title: '产品', dataIndex: 'name', key: 'name' },
        { title: '销售额(¥)', dataIndex: 'sales', key: 'sales' },
        { title: '订单数', dataIndex: 'orders', key: 'orders' },
        { title: '转化率(%)', dataIndex: 'conversion', key: 'conversion' }
      ],
      topProducts: [
        { id: 1, name: '旗舰手机 X', sales: 324523, orders: 1213, conversion: 4.2 },
        { id: 2, name: '智能手表 Pro', sales: 215432, orders: 842, conversion: 3.9 },
        { id: 3, name: '降噪耳机 S', sales: 189432, orders: 731, conversion: 3.5 },
        { id: 4, name: '运动相机 Go', sales: 152398, orders: 612, conversion: 3.1 }
      ],
       univer: null,
       sheetsPlugin:null
    }
  },
    mounted() {
      this.initUniver()
    },
    beforeDestroy() {
    // 销毁实例防止内存泄漏
    if (this.univer) {
      this.univer.dispose()
      this.univer = null
    }
  },
  methods: {
    initUniver(){
       // 初始化 Univer 实例
    this.univer = new Univer({
      container: 'univer-container', // 容器 id
      locale: 'zhCN',
       plugins: [
          UniverUIPlugin,
          UniverSheetsPlugin,
          UniverSheetsUIPlugin
        ]
    })
    console.log("init", this.univer)
   this.sheetsPlugin = new UniverSheetsPlugin();
       console.log("sheetsPlugin",this.sheetsPlugin)

    if (!this.sheetsPlugin) {
        console.error('获取 sheets 插件失败');
        return;
      }
    this.sheetsPlugin.createWorkbook({
      id: 'wb-01',
      name: 'DemoSheet',
      sheetOrder: ['sheet1'],
      sheets: {
        sheet1: {
          id: 'sheet1',
          name: 'Sheet1',
          cellData: {
            0: { 0: { v: 'Hello Univer 0.10.14!' } }
          }
        }
      }
    });
    },
    createSheet(){
      console.log("pppppwww",this.sheetsPlugin)
       if (!this.sheetsPlugin) return;
      this.sheetsPlugin.createSheet({ name: `新建-${Date.now()}` });
    },
    formatNumber(n) {
      return n.toLocaleString()
    },
    trendClass(val) {
      if (val > 0) return 'trend-up'
      if (val < 0) return 'trend-down'
      return 'trend-flat'
    }
  }
}
</script>

<style lang="less" scoped>
.bi-container {
  padding: 16px;
  height: 900px;
  overflow: scroll;
  .chart-placeholder {
    height: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    color: #999;
    border: 1px dashed #e8e8e8;
  }
}

.kpi {
  .kpi-title {
    font-size: 12px;
    color: #888;
  }
  .kpi-value {
    margin-top: 6px;
    font-size: 20px;
    font-weight: 600;
  }
  .kpi-trend {
    margin-top: 4px;
    font-size: 12px;
  }
  .trend-up { color: #52c41a; }
  .trend-down { color: #f5222d; }
  .trend-flat { color: #888; }
}
</style>