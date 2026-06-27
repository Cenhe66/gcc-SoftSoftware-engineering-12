/**
 * SVG 转 PNG 批量转换脚本
 * 用于将 tabBar 的 SVG 图标转换为 PNG 格式
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 配置
const CONFIG = {
  inputDir: './parking-miniapp/static/icons',
  outputDir: './parking-miniapp/static/icons',
  size: 81,  // 微信小程序 tabBar 图标推荐尺寸
  svgFiles: [
    'home-active.svg',
    'reservation-active.svg',
    'record-active.svg',
    'user-active.svg'
  ]
};

// 转换函数
async function convertSvgToPng(svgFile) {
  const inputPath = path.join(CONFIG.inputDir, svgFile);
  const outputFile = svgFile.replace('.svg', '.png');
  const outputPath = path.join(CONFIG.outputDir, outputFile);

  try {
    await sharp(inputPath)
      .resize(CONFIG.size, CONFIG.size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ 转换成功: ${svgFile} -> ${outputFile}`);
    return true;
  } catch (error) {
    console.error(`❌ 转换失败: ${svgFile}`, error.message);
    return false;
  }
}

// 执行批量转换
async function main() {
  console.log('开始转换 SVG 到 PNG...');
  console.log(`目标尺寸: ${CONFIG.size}x${CONFIG.size}px`);
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const svgFile of CONFIG.svgFiles) {
    const inputPath = path.join(CONFIG.inputDir, svgFile);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️ 文件不存在: ${svgFile}`);
      failCount++;
      continue;
    }

    const success = await convertSvgToPng(svgFile);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('');
  console.log('转换完成!');
  console.log(`成功: ${successCount} 个`);
  console.log(`失败: ${failCount} 个`);
}

main();