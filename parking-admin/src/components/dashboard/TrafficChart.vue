<template>
  <div ref="chartRef" class="traffic-chart"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      hours: [],
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
      borderColor: 'rgba(64, 158, 255, 0.3)',
      textStyle: {
        color: '#fff'
      },
      formatter: (params) => {
        const data = params[0]
        return `${data.name}<br/>车流: <span style="color: #409EFF; font-weight: bold">${data.value}</span> 辆`
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
      boundaryGap: false,
      data: props.data.hours || [],
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
        fontSize: 12
      }
    },
    series: [
      {
        name: '车流',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        sampling: 'average',
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          width: 3,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#409EFF' },
              { offset: 1, color: '#67C23A' }
            ]
          }
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.4)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ]
          }
        },
        data: props.data.values || [],
        animationDuration: 2000,
        animationEasing: 'cubicOut'
      }
    ]
  }

  chart.setOption(option)
}

const updateChart = () => {
  if (!chart) return

  chart.setOption({
    xAxis: {
      data: props.data.hours || []
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
.traffic-chart {
  width: 100%;
  height: 280px;
}
</style>
