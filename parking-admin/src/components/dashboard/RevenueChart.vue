<template>
  <div ref="chartRef" class="revenue-chart"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      dates: [],
      values: []
    })
  }
})

const chartRef = ref(null)
let chart = null

const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 25, 41, 0.9)',
      borderColor: 'rgba(103, 194, 58, 0.3)',
      textStyle: {
        color: '#fff'
      },
      formatter: (params) => {
        const data = params[0]
        return `${data.name}<br/>收益: <span style="color: #67C23A; font-weight: bold">¥${data.value.toLocaleString()}</span>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.dates || [],
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)'
        }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        formatter: (value) => {
          return value >= 1000 ? (value / 1000) + 'k' : value
        }
      }
    },
    series: [
      {
        name: '收益',
        type: 'bar',
        barWidth: '50%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#67C23A' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.3)' }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#85ce61' },
                { offset: 1, color: 'rgba(133, 206, 97, 0.5)' }
              ]
            }
          }
        },
        data: props.data.values || [],
        animationDuration: 1500,
        animationEasing: 'elasticOut',
        animationDelay: (idx) => idx * 100
      }
    ]
  }

  chart.setOption(option)
}

const updateChart = () => {
  if (!chart) return

  chart.setOption({
    xAxis: {
      data: props.data.dates || []
    },
    series: [
      {
        data: props.data.values || []
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
.revenue-chart {
  width: 100%;
  height: 280px;
}
</style>
