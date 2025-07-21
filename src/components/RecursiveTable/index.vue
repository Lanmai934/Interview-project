<template>
    <el-table :data="localData" ref="table" :row-key="row => row.id" border @selection-change="onSelectionChange"
        @expand-change="onExpandChange" style="width: 100%; margin-left: 20px">
        <el-table-column type="selection" width="50" />

        <el-table-column v-for="col in columns" :key="col.prop" :prop="col.prop" :label="col.label"
            :width="col.width" />

        <el-table-column type="expand">
            <template slot-scope="{ row }">
                <RecursiveTable v-if="row.children && row.children.length" :data="row.children" :columns="columns"
                    :fetch-children="fetchChildren" :path="[...path, row.id]"
                    @selection-change="$emit('selection-change', $event)" ref="children" />
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
import RecursiveTable from './index.vue'; // 路径根据实际情况调整

export default {
    name: 'RecursiveTable',
    components: { RecursiveTable },
    props: {
        data: { type: Array, required: true },
        columns: { type: Array, required: true },
        fetchChildren: { type: Function, required: true },
        path: { type: Array, default: () => [] }
    },
    data() {
        return {
            localData: []
        };
    },
    watch: {
        data: {
            immediate: true,
            handler(val) {
                this.localData = val;
            }
        }
    },
    methods: {
        async onExpandChange(row) {
            if (!row.children) {
                const children = await this.fetchChildren(row);
                this.$set(row, 'children', children || []);
            }
        },
        onSelectionChange(selection) {
            this.$emit('selection-change', {
                path: this.path,
                selected: selection
            });
        },
        expandAll() {
            this.localData.forEach(row => {
                this.$refs.table.toggleRowExpansion(row, true);
                if (row.children?.length) {
                    this.$nextTick(() => {
                        this.$refs.children?.forEach(child => child.expandAll?.());
                    });
                }
            });
        },
        collapseAll() {
            this.localData.forEach(row => {
                this.$refs.table.toggleRowExpansion(row, false);
                if (row.children?.length) {
                    this.$nextTick(() => {
                        this.$refs.children?.forEach(child => child.collapseAll?.());
                    });
                }
            });
        }
    }
};
</script>
