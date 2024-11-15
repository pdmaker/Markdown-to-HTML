const translations = {
    en: {
        title: 'Markdown and HTML Converter',
        subtitle: 'Specially designed for Wordpress publishing, HTML page generation and more',
        md2html: 'Markdown to HTML',
        html2md: 'HTML to Markdown',
        removeCitations: 'Remove Citations (From <a href="https://perplexity.ai/pro?referral_code=6AU5QB68" class="perplexity-link" target="_blank" rel="noopener">Perplexity.ai</a>)',
        inputTitle: 'Markdown Input',
        outputTitle: 'HTML Output',
        clearInput: 'Clear Input',
        clearOutput: 'Clear Output',
        inputPlaceholder: 'Enter your content here...',
        convert: 'Convert',
        copy: 'Copy Output',
        copySuccess: 'Content copied to clipboard!',
        copyError: 'Copy failed, please copy manually',
        preview: 'Preview HTML',
        togglePreview: 'Hide Preview',
        showPreview: 'Show Preview',
        rawHtml: 'Show HTML',
        download: 'Download HTML'
    },
    zh: {
        title: 'Markdown 和 HTML 双向转换',
        subtitle: '特别用于 Wordpress 内容发表、HTML 网页生成等场景',
        md2html: 'Markdown 转 HTML',
        html2md: 'HTML 转 Markdown',
        removeCitations: '去除引文(来自 <a href="https://perplexity.ai/pro?referral_code=6AU5QB68" class="perplexity-link" target="_blank" rel="noopener">Perplexity.ai</a>)',
        inputTitle: 'Markdown 输入',
        outputTitle: 'HTML 输出',
        clearInput: '清空输入',
        clearOutput: '清空输出',
        inputPlaceholder: '在这里输入内容...',
        convert: '转换',
        copy: '复制输出',
        copySuccess: '内容已复制到剪贴板！',
        copyError: '复制失败，请手动复制',
        preview: '预览 HTML',
        togglePreview: '隐藏预览',
        showPreview: '显示预览',
        rawHtml: '显示 HTML',
        download: '下载 HTML'
    }
};

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
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    updateThemeIcon();
}

// 检查系统主题偏好并设置初始主题
function initializeTheme() {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', initialTheme);
    updateThemeIcon();
}

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key === 'removeCitations') {
            element.innerHTML = translations[currentLang][key];
        } else {
            element.textContent = translations[currentLang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = translations[currentLang][key];
    });

    document.querySelector('.lang-switch').textContent = currentLang === 'zh' ? 'English' : '中文';
    document.title = currentLang === 'zh' ? 'MD2HTML - Markdown 转换工具' : 'MD2HTML - Markdown Converter';
}

function toggleLanguage() {
    const newLang = currentLang === 'zh' ? 'en' : 'zh';
    const newPath = newLang === 'en' ? '/en' : '/';
    window.history.pushState({}, '', newPath);
    currentLang = newLang;
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    updateLanguage();
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
        inputTitle.textContent = translations[currentLang].inputTitle;
        outputTitle.textContent = translations[currentLang].outputTitle;
        inputArea.placeholder = translations[currentLang].inputPlaceholder;
        citationControl.style.display = 'flex';
        previewArea.style.display = 'block';
    } else {
        inputTitle.textContent = 'HTML 输入';
        outputTitle.textContent = 'Markdown 输出';
        inputArea.placeholder = translations[currentLang].inputPlaceholder;
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
}

function copyOutput() {
    const rawArea = document.getElementById('raw-area');
    const content = rawArea.textContent;

    navigator.clipboard.writeText(content)
        .then(() => showToast(translations[currentLang].copySuccess))
        .catch(() => showToast(translations[currentLang].copyError));
}

function clearInput() {
    document.getElementById('input-area').value = '';
    convert();
}

function clearOutput() {
    document.getElementById('preview-area').innerHTML = '';
    document.getElementById('raw-area').textContent = '';
}

document.getElementById('input-area').addEventListener('input', convert);

// 初始化语言和主题
updateLanguage();
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
        previewBtn.textContent = translations[currentLang].preview;
    } else {
        previewArea.classList.add('active');
        rawArea.classList.remove('active');
        previewBtn.classList.add('active');
        previewBtn.textContent = translations[currentLang].rawHtml;
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
                .then(() => showToast(translations[currentLang].copySuccess))
                .catch(() => showToast(translations[currentLang].copyError));
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
    showToast(translations[currentLang].copySuccess);
}