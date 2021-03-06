/* eslint-disable camelcase */
import { toRefs, reactive } from '@vue/composition-api';
import { action } from '@storybook/addon-actions';
import casual, { arrayOf } from '@/util/casual';
import { withKnobs } from '@storybook/addon-knobs';
import PQuerySearch from './PQuerySearch.vue';

export default {
    title: 'Inputs/Search/Query Search',
    component: PQuerySearch,
    decorators: [withKnobs],
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/wq4wSowBcADBuUrMEZLz6i/SpaceONE-Console-Design?node-id=5952%3A20040',
        },
    },
};

export const querySearch = () => ({
    components: { PQuerySearch },
    template: `
        <div style="width: 80vw;">
            <PQuerySearch v-model="value"
                          :keyItemSets="keyItemSets"
                          :valueHandlerMap="valueHandlerMap"
                          @search="onSearch"
            ></PQuerySearch>
            <pre class="mt-8">{{queries}}</pre>
        </div>`,
    setup(props, context) {
        const keyItemSets = [{
            title: 'Key',
            items: [
                {
                    label: 'Project ID', name: 'project_id',
                }, {
                    label: 'Project Name', name: 'name',
                }, {
                    label: 'Project Group ID', name: 'project_group_id',
                },
            ],
        }];

        const valueItems = {
            project_id: arrayOf(10, () => casual.make_id('project')),
            name: arrayOf(10, () => casual.word),
            project_group_id: arrayOf(10, () => casual.make_id('pg')),
        };

        const valueHandlerMap = {};
        keyItemSets[0].items.forEach((k) => {
            const items = valueItems[k.name];
            valueHandlerMap[k.name] = inputText => ({
                results: items.reduce((result, d) => {
                    if (d.includes(inputText)) result.push({ label: d, name: d });
                    return result;
                }, []),
                totalCount: items.length,
            });
        });


        const state = reactive({
            value: '',
            keyItemSets,
            valueHandlerMap,
            queries: [] as any,
        });

        return {
            ...toRefs(state),
            onSearch(query) {
                state.queries.push(query);
                action('search')(query);
            },
        };
    },
});


export const defaultHandlers = () => ({
    components: { PQuerySearch },
    template: `
        <div style="width: 80vw;">
            <p class="my-8">
                If no value handler map is given, the default handler is run.
                The default handler operates differently for each data type.
            </p>
            <PQuerySearch v-model="value"
                          :keyItemSets="keyItemSets"
                          @search="onSearch"
            ></PQuerySearch>
            <pre class="mt-8">{{queries}}</pre>
        </div>`,
    setup(props, context) {
        const keyItemSets = [{
            title: 'Key',
            items: [{
                label: 'Boolean',
                name: 'boolean',
                dataType: 'boolean',
            }, {
                label: 'String',
                name: 'string',
                dataType: 'string',
            }, {
                label: 'Integer',
                name: 'integer',
                dataType: 'integer',
            }, {
                label: 'Float',
                name: 'float',
                dataType: 'float',
            }, {
                label: 'Datetime',
                name: 'datetime',
                dataType: 'datetime',
            }],
        }];

        const state = reactive({
            value: '',
            keyItemSets,
            queries: [] as any,
        });

        return {
            ...toRefs(state),
            onSearch(query) {
                state.queries.push(query);
                action('search')(query);
            },
        };
    },
});
