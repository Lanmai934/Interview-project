<template>
    <div>
        <el-button @click="expandAll" type="primary">展开所有</el-button>
        <el-button @click="collapseAll" type="primary">收起所有</el-button>
        <el-button @click="printSelections" type="success">打印所有选中</el-button>

        <RecursiveTable ref="recursiveTable" :data="tableData" :columns="columns" :fetch-children="fetchChildren"
            :path="[]" @selection-change="handleSelectionChange" />
    </div>
</template>

<script>
import RecursiveTable from '@/components/RecursiveTable/index.vue'; // 路径根据实际改

export default {
    name: 'RecursiveTableWrapper',
    components: { RecursiveTable },
    data() {
        return {
            tableData: [
                { id: 1, name: '节点1' },
                { id: 2, name: '节点2' }
            ],
            columns: [
                { prop: 'name', label: '名称' },
                { prop: 'desc', label: '描述', width: 200 }
            ],
            allSelections: {} // { pathKey: [selectedRows], ... }
        };
    },
    methods: {
        fetchChildren(row) {
            // 模拟异步接口调用加载子节点
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve([
                        { id: `${row.id}-1`, name: `子节点 ${row.id}-1` },
                        { id: `${row.id}-2`, name: `子节点 ${row.id}-2` }
                    ]);
                }, 500);
            });
        },
        handleSelectionChange({ path, selected }) {
            const key = path.length ? path.join('>') : 'root';
            this.$set(this.allSelections, key, selected);
            // console.log('当前所有选中', this.allSelections);
        },
        expandAll() {
            this.$refs.recursiveTable.expandAll();
        },
        collapseAll() {
            this.$refs.recursiveTable.collapseAll();
        },
        printSelections() {
            const allSelected = Object.values(this.allSelections).flat();
            console.log('所有选中项:', allSelected);
            this.$message.success(`共选中 ${allSelected.length} 条`);
        }
    }
};
</script>
