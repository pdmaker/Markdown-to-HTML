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
}

function toggleLanguage() {
    const newLang = currentLang === 'zh' ? 'en' : 'zh';
    const newPath = newLang === 'en' ? '/en' : '/';
    window.history.pushState({}, '', newPath);
    currentLang = newLang;
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    updatePageLanguage();
    switchMode();
}

const turndownService = new TurndownService();
let currentMode = 'md2html';

function removeCitations(text) {
    return text.replace(/^Citations:\s*(\n\[\d+\].*)*$/m, '').trim();
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

    inputArea.value = '';
    document.getElementById('output-area').innerHTML = '';
}

function convert() {
    let input = document.getElementById('input-area').value;
    const previewArea = document.getElementById('preview-area');
    const rawArea = document.getElementById('raw-area');
    const removeCitationsChecked = document.getElementById('remove-citations').checked;

    if (currentMode === 'md2html') {
        if (removeCitationsChecked) {
            input = removeCitations(input);
        }
        const htmlOutput = marked.parse(input);
        previewArea.innerHTML = htmlOutput;
        rawArea.textContent = htmlOutput;
    } else {
        const markdownOutput = turndownService.turndown(input);
        previewArea.textContent = markdownOutput;
        rawArea.textContent = markdownOutput;
    }
    
    // 更新按钮状态
    updateButtonStates();
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
}

function clearOutput() {
    document.getElementById('preview-area').innerHTML = '';
    document.getElementById('raw-area').textContent = '';
    // 更新按钮状态
    updateButtonStates();
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

// 添加按钮状态控制函数
function updateButtonStates() {
    const rawArea = document.getElementById('raw-area');
    const copyButton = document.querySelector('button[onclick="copyOutput()"]');
    const downloadButton = document.querySelector('button[onclick="downloadHtml()"]');
    
    const isEmpty = !rawArea.textContent.trim();
    copyButton.disabled = isEmpty;
    downloadButton.disabled = isEmpty;
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

// 导出这些函数以供模块化使用
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