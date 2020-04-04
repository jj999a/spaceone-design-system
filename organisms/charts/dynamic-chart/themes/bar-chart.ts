import { black, gray } from '@/styles/colors';
import {
    ChartOptionsType,
    ChartSettingsType, ChartThemeGroupType, defaultPlugins, defaultThemeProps,
    DefaultThemePropsType, tooltips,
} from '@/components/organisms/charts/dynamic-chart/DynamicChart.toolset';


/** *************** default ****************** */
export interface BarDefaultThemePropsType extends DefaultThemePropsType {
    stacked: boolean;
    minBarLength: number;
}

export const barDefaultThemeProps = {
    ...defaultThemeProps,
    stacked: false,
    minBarLength: 50,
} as BarDefaultThemePropsType;


const defaultSettings: ChartSettingsType<BarDefaultThemePropsType> = themeProps => ({
    // barThickness: 8,
    borderWidth: 0,
    minBarLength: themeProps.minBarLength,
    categoryPercentage: 0.5,
    barPercentage: 0.7,
});

const defaultOptions: ChartOptionsType<BarDefaultThemePropsType> = themeProps => ({
    maintainAspectRatio: false,
    legend: {
        display: false,
    },
    scales: {
        yAxes: [{
            stacked: themeProps.stacked,
            gridLines: {
                drawTicks: false,
                drawBorder: false,
                color: gray[100],
                zeroLineColor: gray[100],
            },
            ticks: {
                padding: 10,
                fontColor: black,
            },
        }],
        xAxes: [{
            stacked: themeProps.stacked,
            gridLines: {
                drawTicks: false,
                drawBorder: false,
                color: gray[100],
                zeroLineColor: gray[100],

            },
            ticks: {
                display: false,
            },
        }],
    },
    responsive: true,
    tooltips,
});

export type BarTheme = ChartThemeGroupType<
    BarDefaultThemePropsType>

export default {
    default: {
        settings: defaultSettings,
        options: defaultOptions,
        plugins: defaultPlugins,
    },
} as BarTheme;