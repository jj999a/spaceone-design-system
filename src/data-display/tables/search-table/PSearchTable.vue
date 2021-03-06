<template>
    <p-toolbox-table class="p-search-table"
                     :fields="fields"
                     :items="items"
                     :loading="loading"
                     :all-page="allPage"
                     :sort-by="proxyState.sortBy"
                     :sort-desc="proxyState.sortDesc"
                     :select-index="proxyState.selectIndex"
                     :this-page="proxyState.thisPage"
                     :page-size="proxyState.pageSize"
                     :excel-visible="excelVisible"
                     :page-size-visible="pageSizeVisible"
                     use-cursor-loading
                     :setting-visible="false"
                     sortable
                     :selectable="selectable"
                     :multi-select="multiSelect"
                     @changePageSize="onChangePageSize"
                     @changePageNumber="onChangePageNumber"
                     @changeSort="onChangeSort"
                     @select="onSelect"
                     @clickRefresh="emitChange()"
                     @clickExcel="emitExport()"
                     @rowLeftClick="byPassEvent('rowLeftClick', ...arguments)"
    >
        <template v-if="searchable && !$scopedSlots['toolbox-left']" #toolbox-left="scope">
            <div class="left-toolbox-item w-1/2 2xs:hidden lg:block">
                <p-search v-model="proxyState.searchText"
                          @search="onSearch"
                          @delete="onSearch()"
                />
            </div>
        </template>
        <template v-if="searchable && !$scopedSlots['toolbox-bottom']" #toolbox-bottom="scope">
            <div class="flex-1 2xs:block lg:hidden mt-4"
                 :class="{'mb-4':$scopedSlots['toolbox-bottom']}"
            >
                <p-search v-model="proxyState.searchText"
                          @search="onSearch"
                          @delete="onSearch()"
                />
            </div>
        </template>

        <template v-for="(_, slot, i) of $scopedSlots" v-slot:[slot]="scope">
            <template v-if="slot === 'toolbox-left'">
                <slot name="toolbox-left" v-bind="scope" />
                <div v-if="searchable" :key="i" class="left-toolbox-item w-1/2 2xs:hidden lg:block">
                    <p-search v-model="proxyState.searchText"
                              @search="onSearch"
                              @delete="onSearch()"
                    />
                </div>
            </template>
            <div v-else-if="slot === 'toolbox-bottom'" :key="i" class="flex-1 2xs:block lg:hidden mt-4"
                 :class="{'mb-4':$scopedSlots['toolbox-bottom']}"
            >
                <p-search v-if="searchable" v-model="proxyState.searchText"
                          @search="onSearch"
                          @delete="onSearch()"
                />
                <slot name="toolbox-bottom" v-bind="scope" />
            </div>
            <slot v-else :name="slot" v-bind="scope" />
        </template>
    </p-toolbox-table>
</template>

<script lang="ts">
import PSearch from '@/inputs/search/search/PSearch.vue';
import PToolboxTable from '@/data-display/tables/toolbox-table/PToolboxTable.vue';
import {
    ComponentRenderProxy,
    computed, getCurrentInstance, reactive, toRefs, UnwrapRef, watch,
} from '@vue/composition-api';
import { forEach } from 'lodash';
import { Options, SearchTableProps } from '@/data-display/tables/search-table/type';
import { makeOptionalProxy } from '@/util/composition-helpers';


export default {
    name: 'PSearchTable',
    components: { PToolboxTable, PSearch },
    props: {
        fields: {
            type: Array,
            default: () => ([]),
        },
        items: {
            type: Array,
            default: () => ([]),
        },
        loading: {
            type: Boolean,
            default: false,
        },
        sortBy: {
            type: String,
            default: undefined,
        },
        sortDesc: {
            type: Boolean,
            default: undefined,
        },
        selectIndex: {
            type: Array,
            default: undefined,
        },
        thisPage: {
            type: Number,
            default: undefined,
        },
        pageSize: {
            type: Number,
            default: undefined,
        },
        totalCount: {
            type: Number,
            default: 0,
        },
        searchText: {
            type: String,
            default: undefined,
        },
        selectable: {
            type: Boolean,
            default: true,
        },
        multiSelect: {
            type: Boolean,
            default: true,
        },
        excelVisible: {
            type: Boolean,
            default: true,
        },
        pageSizeVisible: {
            type: Boolean,
            default: true,
        },
        colCopy: {
            type: Boolean,
            default: false,
        },
        searchable: {
            type: Boolean,
            default: true,
        },
    },
    setup(props: SearchTableProps, { emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        const proxyState = reactive({
            selectIndex: makeOptionalProxy<number[]>('selectIndex', vm, [], ['select']),
            sortBy: makeOptionalProxy<string>('sortBy', vm, ''),
            sortDesc: makeOptionalProxy<boolean>('sortDesc', vm, true),
            thisPage: makeOptionalProxy<number>('thisPage', vm, 1),
            pageSize: makeOptionalProxy<number>('pageSize', vm, 15),
            searchText: makeOptionalProxy<string>('searchText', vm, ''),
        });

        const state = reactive({
            allPage: computed(() => Math.ceil(props.totalCount / proxyState.pageSize) || 1),
            excludeSlotNames: ['toolbox-left', 'toolbox-bottom'],
        });

        watch(() => props.selectIndex, (aft, bef) => {
            /**
             * 1. props 가 주어지지 않았을 때: 로컬 변수 사용. 판별: undefined
             * 2. props 가 주어졌으나, 위에서 바꿔주는 처리를 해주고 있는지 모를 때:
             *      로컬 변수 사용. props 값에 변경이 일어나면, 이를 로컬 변수에 적용.
             *      판별: undefined 도 아니고, sync 도 없을 때.
             * 3. 위에서 event 를 받아서 바꿔주는 처리를 해줄 때: props 값 사용. 판별: sync
             */
        });

        /** Event emitter */
        const emitSelect = (selectIndex) => {
            proxyState.selectIndex = [...selectIndex];
        };

        const emitChange = (options: Partial<Options> = {}) => {
            emitSelect([]);

            if (options.searchText !== undefined || proxyState.thisPage > state.allPage) {
                options.thisPage = 1;
                proxyState.thisPage = 1;
            }

            // check if each option value is 'undefined' to escape auto type casting
            emit('change', {
                sortBy: options.sortBy === undefined ? proxyState.sortBy : options.sortBy,
                sortDesc: options.sortDesc === undefined ? proxyState.sortDesc : options.sortDesc,
                thisPage: options.thisPage === undefined ? proxyState.thisPage : options.thisPage,
                pageSize: options.pageSize === undefined ? proxyState.pageSize : options.pageSize,
                searchText: options.searchText === undefined ? proxyState.searchText : options.searchText,
            } as Options, options);
        };

        const byPassEvent = (name, item, index, mouseEvent) => {
            emit(name, item, index, mouseEvent);
        };

        const emitExport = () => {
            emit('export');
        };

        /** Table event listeners */
        const onChangePageSize = (pageSize: number) => {
            proxyState.pageSize = pageSize;
            emitChange({ pageSize });
        };

        const onChangePageNumber = (thisPage: number) => {
            proxyState.thisPage = thisPage;
            emitChange({ thisPage });
        };

        const onChangeSort = (sortBy: string, sortDesc: boolean) => {
            proxyState.sortDesc = sortDesc;
            proxyState.sortBy = sortBy;
            emitChange({ sortBy, sortDesc });
        };

        const onSelect = (selectIndex: number[]) => {
            emitSelect(selectIndex);
        };

        const onSearch = async (val?: string) => {
            proxyState.searchText = val || '';
            emitChange({ searchText: val || '' });
        };

        emit('init', {
            sortBy: proxyState.sortBy,
            sortDesc: proxyState.sortDesc,
            thisPage: proxyState.thisPage,
            pageSize: proxyState.pageSize,
            searchText: proxyState.searchText,
        });

        return {
            ...toRefs(state),
            proxyState,
            emitChange,
            emitExport,
            onChangePageSize,
            onChangePageNumber,
            onChangeSort,
            onSelect,
            onSearch,
            byPassEvent,
        };
    },
};
</script>

<style lang="postcss">
.p-search-table {
    .left-toolbox-item {
        &:last-child {
            flex-grow: 1;
        }
    }
    >>> .toolbox {
        .toolbox-bottom {
            @apply mt-0;
        }
    }
}
</style>
