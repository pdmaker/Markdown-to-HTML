import i18n from './i18n.js';

let currentLang = 'zh';

// 检查是否在英文路径
if (window.location.pathname.includes('/en')) {
    currentLang = 'en';
    document.documentElement.lang = 'en';
} else {
    document.documentElement.lang = 'zh-CN';
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('.theme-icon');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeIcon.textContent = isDark ? '☀️' : '🌙';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
}

// 检查系统主题偏好并设置初始主题
function initializeTheme() {
    // 先检查本地存储是否有保存的主题设置
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon();
        return;
    }
    
    // 如果没有保存的设置，则检查系统偏好
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', initialTheme);
    localStorage.setItem('theme', initialTheme);
    updateThemeIcon();
}

// 翻译函数
function translateElement(element) {
    const key = element.getAttribute('data-i18n');
    if (!key) return;
    
    const translation = i18n[currentLang][key];
    if (!translation) return;
    
    // 如果元素有 placeholder 属性，直接设置文本
    if (element.hasAttribute('data-i18n-placeholder')) {
        element.placeholder = translation;
        return;
    }
    
    // 对于其他元素，支持 HTML 内容
    element.innerHTML = translation;
}

// 更新页面上所有需要翻译的元素
function updatePageLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(translateElement);
    document.title = i18n[currentLang].docTitle;
    
    // 更新语言切换按钮文本
    const langSwitchBtn = document.querySelector('.lang-switch');
    langSwitchBtn.textContent = i18n[currentLang].langSwitchText;
}

function toggleLanguage() {
    const newLang = currentLang === 'zh' ? 'en' : 'zh';
    const newPath = newLang === 'en' ? '/en' : '/';
    window.history.pushState({}, '', newPath);
    currentLang = newLang;
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    
    // 保存当前输入框的内容
    const currentInput = document.getElementById('input-area').value;
    
    // 更新页面语言
    updatePageLanguage();
    
    // 更新语言切换按钮文本
    const langSwitchBtn = document.querySelector('.lang-switch');
    langSwitchBtn.textContent = i18n[currentLang].langSwitchText;
    
    // 恢复输入框的内容
    document.getElementById('input-area').value = currentInput;
    
    // 更新模式选择
    switchMode();
    
    // 如果输入框有内容，重新执行转换
    if (currentInput.trim()) {
        convert();
    }
}

const turndownService = new TurndownService();
let currentMode = 'md2html';

function removeCitations(markdown) {
    let processed = markdown;
    
    // 移除 Citations: 标题及其下方的引文列表
    processed = processed.replace(/Citations:\s*(\n\[\d+\].*)*$/gm, '');
    
    // 移除文本中的引文标记
    processed = processed.replace(/\[[\d,\s]+\](?:\[\d+\])?/g, '');
    
    // 移除 Perplexity 特有的 ***** 格式（包括可能的空格）
    processed = processed.replace(/\*{4,}\s*([^\n]+)/g, '$1'); // 添加 \s* 来匹配可选的空格
    
    // 移除空行
    processed = processed.replace(/^\s*[\r\n]/gm, '\n');
    
    // 移除多余的空行（超过两个连续空行变成两个）
    processed = processed.replace(/\n{3,}/g, '\n\n');
    
    return processed.trim();
}

function switchMode() {
    currentMode = document.getElementById('convert-mode').value;
    const citationControl = document.getElementById('citation-control');
    const inputTitle = document.getElementById('input-title');
    const outputTitle = document.getElementById('output-title');
    const inputArea = document.getElementById('input-area');
    const previewArea = document.getElementById('preview-area');

    if (currentMode === 'md2html') {
        inputTitle.textContent = i18n[currentLang].inputTitle;
        outputTitle.textContent = i18n[currentLang].outputTitle;
        inputArea.placeholder = i18n[currentLang].inputPlaceholder;
        citationControl.style.display = 'flex';
        previewArea.style.display = 'block';
    } else {
        inputTitle.textContent = 'HTML 输入';
        outputTitle.textContent = 'Markdown 输出';
        inputArea.placeholder = i18n[currentLang].inputPlaceholder;
        citationControl.style.display = 'none';
        previewArea.style.display = 'none';
    }

    // 如果有内容，重新执行转换
    if (inputArea.value.trim()) {
        convert();
    }
}

function convert() {
    const input = document.getElementById('input-area').value;
    const mode = document.getElementById('convert-mode').value;
    const removeCitationsEnabled = document.getElementById('remove-citations').checked;
    
    let processedInput = input;
    
    // 如果启用了去除引文选项，先处理引文
    if (removeCitationsEnabled) {
        processedInput = removeCitations(processedInput);
    }
    
    let output = '';
    if (mode === 'md2html') {
        output = marked.parse(processedInput);
    } else {
        const turndownService = new TurndownService();
        output = turndownService.turndown(processedInput);
    }
    
    const rawArea = document.getElementById('raw-area');
    rawArea.textContent = output;
    
    const previewArea = document.getElementById('preview-area');
    previewArea.innerHTML = output;
    
    // 更新按钮状态
    updateButtonStates();
    
    showToast(i18n[currentLang].convertSuccess);
}

function copyOutput() {
    const rawArea = document.getElementById('raw-area');
    const content = rawArea.textContent;

    navigator.clipboard.writeText(content)
        .then(() => showToast(i18n[currentLang].copySuccess))
        .catch(() => showToast(i18n[currentLang].copyError));
}

function clearInput() {
    document.getElementById('input-area').value = '';
    convert();
    // 更新按钮状态
    updateButtonStates();
    // 添加清空提示
    showToast(i18n[currentLang].clearSuccess);
}

function clearOutput() {
    document.getElementById('preview-area').innerHTML = '';
    document.getElementById('raw-area').textContent = '';
    // 更新按钮状态
    updateButtonStates();
    // 添加清空提示
    showToast(i18n[currentLang].clearSuccess);
}

document.getElementById('input-area').addEventListener('input', convert);

// 初始化语言和主题
updatePageLanguage();
updateThemeIcon();
initializeTheme();

function switchTab(tab) {
    const previewArea = document.getElementById('preview-area');
    const rawArea = document.getElementById('raw-area');
    const buttons = document.querySelectorAll('.tab-btn');
    
    buttons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (tab === 'preview') {
        previewArea.classList.add('active');
        rawArea.classList.remove('active');
        buttons[0].classList.add('active');
    } else {
        previewArea.classList.remove('active');
        rawArea.classList.add('active');
        buttons[1].classList.add('active');
    }
}

function togglePreview() {
    const previewArea = document.getElementById('preview-area');
    const rawArea = document.getElementById('raw-area');
    const previewBtn = document.querySelector('.preview-btn');
    
    const isPreviewMode = previewArea.classList.contains('active');
    
    if (isPreviewMode) {
        previewArea.classList.remove('active');
        rawArea.classList.add('active');
        previewBtn.classList.remove('active');
        previewBtn.textContent = i18n[currentLang].preview;
    } else {
        previewArea.classList.add('active');
        rawArea.classList.remove('active');
        previewBtn.classList.add('active');
        previewBtn.textContent = i18n[currentLang].rawHtml;
    }
}

// 添加 Toast 显示函数
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// 为输出区域添加点击复制功能
function initializeOutputCopy() {
    const outputWrapper = document.getElementById('output-wrapper');
    outputWrapper.addEventListener('click', (e) => {
        if (e.target.closest('.output')) {
            const rawArea = document.getElementById('raw-area');
            const content = rawArea.textContent;
            
            navigator.clipboard.writeText(content)
                .then(() => showToast(i18n[currentLang].copySuccess))
                .catch(() => showToast(i18n[currentLang].copyError));
        }
    });
}

// 在文件末尾初始化
initializeOutputCopy();

// 添加下载 HTML 功能
function downloadHtml() {
    const rawArea = document.getElementById('raw-area');
    const content = rawArea.textContent;
    
    // 创建完整的 HTML 文档
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated HTML</title>
    <style>
        body {
            max-width: 800px;
            margin: 2rem auto;
            padding: 0 1rem;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
        }
        pre {
            background: #f5f5f5;
            padding: 1rem;
            border-radius: 4px;
            overflow-x: auto;
        }
        code {
            background: #f5f5f5;
            padding: 0.2em 0.4em;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;

    // 创建 Blob 对象
    const blob = new Blob([fullHtml], { type: 'text/html' });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.html';
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    
    // 清理
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    // 显示提示
    showToast(i18n[currentLang].copySuccess);
}

// 修改按钮状态更新函数
function updateButtonStates() {
    const rawArea = document.getElementById('raw-area');
    const copyButton = document.querySelector('.output-buttons button[data-i18n="copy"]');
    const downloadButton = document.querySelector('.output-buttons button[data-i18n="download"]');
    
    // 检查输出区域是否有内容
    const hasContent = rawArea.textContent.trim().length > 0;
    
    // 根据内容状态启用/禁用按钮
    if (copyButton) copyButton.disabled = !hasContent;
    if (downloadButton) downloadButton.disabled = !hasContent;
}

// 初始化时调用一次
updateButtonStates();

// 确保在 DOM 加载完成后初始化主题
document.addEventListener('DOMContentLoaded', initializeTheme);

// 将函数直接挂载到 window 对象上，确保全局可用
window.toggleTheme = toggleTheme;
window.toggleLanguage = toggleLanguage;
window.switchMode = switchMode;
window.convert = convert;
window.copyOutput = copyOutput;
window.clearInput = clearInput;
window.clearOutput = clearOutput;
window.togglePreview = togglePreview;
window.downloadHtml = downloadHtml;

// 导些函数以供模块化使用
export {
    toggleTheme,
    toggleLanguage,
    switchMode,
    convert,
    copyOutput,
    clearInput,
    clearOutput,
    togglePreview,
    downloadHtml
};

// 在文件开头添加这个函数
function initializeWithDefaultContent() {
    // 获取输入内容
    const input = document.getElementById('input-area').value;
    if (input.trim()) {
        // 如果有默认内容，静默执行转换，不显示 Toast
        const mode = document.getElementById('convert-mode').value;
        const removeCitationsEnabled = document.getElementById('remove-citations').checked;
        
        let processedInput = input;
        
        if (removeCitationsEnabled) {
            processedInput = removeCitations(processedInput);
        }
        
        let output = '';
        if (mode === 'md2html') {
            output = marked.parse(processedInput);
        } else {
            const turndownService = new TurndownService();
            output = turndownService.turndown(processedInput);
        }
        
        const rawArea = document.getElementById('raw-area');
        rawArea.textContent = output;
        
        const previewArea = document.getElementById('preview-area');
        previewArea.innerHTML = output;
        
        // 更新按钮状态
        updateButtonStates();
    }
}

// 在 DOMContentLoaded 事件中调用初始化函数
document.addEventListener('DOMContentLoaded', () => {
    initializeWithDefaultContent();
    updatePageLanguage(); // 确保语言切换按钮文本被正确设置
});