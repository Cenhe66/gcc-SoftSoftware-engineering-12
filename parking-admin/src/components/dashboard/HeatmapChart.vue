<template>
  <div ref="chartRef" class="heatmap-chart"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  yLabels: {
    type: Array,
    default: () => ['F2', 'F1', 'B1', 'B2', 'B3']
  }
})

const chartRef = ref(null)
let chart = null

const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']

const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)

  const option = {
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(10, 25, 41, 0.9)',
      borderColor: 'rgba(230, 162, 60, 0.3)',
      textStyle: {
        color: '#fff'
      },
      formatter: (params) => {
          const yLabel = props.yLabels[params.value[1]] || ''
          return `${yLabel} ${hours[params.value[0]]}<br/>进场数: <span style="color: #E6A23C; font-weight: bold">${params.value[2]}</span>`
        }
    },
    grid: {
      left: '8%',
      right: '5%',
      bottom: '10%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 11
      }
    },
    yAxis: {
      type: 'category',
      data: props.yLabels,
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      textStyle: {
        color: 'rgba(255, 255, 255, 0.6)'
      },
      inRange: {
        color: ['#1e3a5f', '#2e5c8a', '#409EFF', '#E6A23C', '#F56C6C']
      }
    },
    series: [
      {
        name: '使用率',
        type: 'heatmap',
        data: props.data || [],
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 4,
          borderColor: 'rgba(10, 25, 41, 0.5)',
          borderWidth: 2
        },
        animationDuration: 1000,
        animationEasing: 'cubicOut'
      }
    ]
  }

  chart.setOption(option)
}

const updateChart = () => {
  if (!chart) return

  chart.setOption({
    series: [
      {
        data: props.data || []
      }
    ]
  })
}

const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})

watch(() => props.data, updateChart, { deep: true })
</script>

<style scoped lang="scss">
.heatmap-chart {
  width: 100%;
  height: 230px;
}
</style>
