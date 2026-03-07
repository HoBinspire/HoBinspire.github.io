// 构建脚本：将 data.json 内联到 HTML 中
// 使用方法: node build.js

const fs = require('fs');
const path = require('path');

// 读取 data.json
const dataPath = path.join(__dirname, 'data.json');
const htmlPath = path.join(__dirname, 'index.html');
const outputPath = path.join(__dirname, 'index.html');

try {
    // 读取 data.json
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // 读取 index.html
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // 移除所有旧的内联数据脚本（更精确的匹配）
    // 匹配包含 window.siteData 的整个 script 标签
    html = html.replace(
        /<script>[\s\S]*?\/\/\s*内联数据[\s\S]*?window\.siteData\s*=[\s\S]*?<\/script>/g,
        ''
    );
    
    // 移除所有旧的数据加载脚本
    html = html.replace(
        /<script>[\s\S]*?\/\/\s*使用内联数据[\s\S]*?<\/script>/g,
        ''
    );
    
    // 清理多余的空行
    html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // 创建新的内联数据脚本
    const inlineScript = `
    <script>
        // 内联数据（由 build.js 自动生成）
        window.siteData = ${JSON.stringify(data, null, 2)};
    </script>`;
    
    // 在 </head> 之前插入内联数据
    if (html.includes('</head>')) {
        html = html.replace('</head>', inlineScript + '\n    </head>');
    } else {
        // 如果没有 </head>，在最后一个 </link> 之后插入
        const lastLinkIndex = html.lastIndexOf('</link>');
        if (lastLinkIndex !== -1) {
            html = html.substring(0, lastLinkIndex + 7) + inlineScript + html.substring(lastLinkIndex + 7);
        }
    }
    
    // 创建数据加载脚本
    const dataLoaderScript = `
    <script>
        // 使用内联数据
        (function() {
            if (window.siteData) {
                // 等待 script.js 加载完成并渲染
                function initData() {
                    if (typeof renderAll === 'function') {
                        // 直接设置数据并渲染
                        siteData = window.siteData;
                        renderAll();
                        return true;
                    }
                    return false;
                }
                
                // 尝试立即执行
                if (!initData()) {
                    // 如果失败，等待 DOM 和脚本加载
                    var attempts = 0;
                    var maxAttempts = 50;
                    var checkInterval = setInterval(function() {
                        attempts++;
                        if (initData() || attempts >= maxAttempts) {
                            clearInterval(checkInterval);
                        }
                    }, 50);
                    
                    // 也监听 DOMContentLoaded
                    if (document.readyState === 'loading') {
                        document.addEventListener('DOMContentLoaded', function() {
                            if (initData()) {
                                clearInterval(checkInterval);
                            }
                        });
                    }
                }
            }
        })();
    </script>`;
    
    // 在 script.js 之后添加数据加载脚本
    if (html.includes('<script src="script.js"></script>')) {
        html = html.replace(
            '<script src="script.js"></script>',
            '<script src="script.js"></script>' + dataLoaderScript
        );
    } else {
        // 如果没有找到，在 </body> 之前添加
        html = html.replace('</body>', dataLoaderScript + '\n</body>');
    }
    
    // 写入文件
    fs.writeFileSync(outputPath, html, 'utf8');
    
    console.log('✅ 构建成功！data.json 已内联到 index.html');
    console.log('📦 现在可以直接部署到 GitHub Pages');
    console.log(`📊 数据大小: ${JSON.stringify(data).length} 字符`);
    console.log(`📝 个人信息: ${data.profile.name} - ${data.profile.affiliation}`);
    
} catch (error) {
    console.error('❌ 构建失败:', error.message);
    console.error(error.stack);
    process.exit(1);
}
