const translations = {
    en: {
        title: 'Markdown and HTML Converter',
        subtitle: 'Specially designed for Wordpress publishing, HTML page generation and more',
        md2html: 'Markdown to HTML',
        html2md: 'HTML to Markdown',
        removeCitations: 'Remove Citations (From Perplexity.ai)',
        inputTitle: 'Markdown Input',
        outputTitle: 'HTML Output',
        clearInput: 'Clear Input',
        clearOutput: 'Clear Output',
        inputPlaceholder: 'Enter your content here...',
        convert: 'Convert',
        copy: 'Copy Output',
        copySuccess: 'Content copied to clipboard!',
        copyError: 'Copy failed, please copy manually'
    },
    zh: {
        title: 'Markdown 和 HTML 双向转换',
        subtitle: '特别用于 Wordpress 内容发表、HTML 网页生成等场景',
        md2html: 'Markdown 转 HTML',
        html2md: 'HTML 转 Markdown',
        removeCitations: '去除引文(来自 Perplexity.ai)',
        inputTitle: 'Markdown 输入',
        outputTitle: 'HTML 输出',
        clearInput: '清空输入',
        clearOutput: '清空输出',
        inputPlaceholder: '在这里输入内容...',
        convert: '转换',
        copy: '复制输出',
        copySuccess: '内容已复制到剪贴板！',
        copyError: '复制失败，请手动复制'
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

// 检查系统主题偏好
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon();
}

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = translations[currentLang][key];
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

    if (currentMode === 'md2html') {
        inputTitle.textContent = translations[currentLang].inputTitle;
        outputTitle.textContent = translations[currentLang].outputTitle;
        inputArea.placeholder = translations[currentLang].inputPlaceholder;
        citationControl.style.display = 'flex';
    } else {
        inputTitle.textContent = 'HTML 输入';
        outputTitle.textContent = 'Markdown 输出';
        inputArea.placeholder = translations[currentLang].inputPlaceholder;
        citationControl.style.display = 'none';
    }

    inputArea.value = '';
    document.getElementById('output-area').innerHTML = '';
}

function convert() {
    let input = document.getElementById('input-area').value;
    const outputArea = document.getElementById('output-area');
    const removeCitationsChecked = document.getElementById('remove-citations').checked;

    if (currentMode === 'md2html') {
        if (removeCitationsChecked) {
            input = removeCitations(input);
        }
        outputArea.textContent = marked.parse(input);
    } else {
        outputArea.textContent = turndownService.turndown(input);
    }
}

function copyOutput() {
    const outputArea = document.getElementById('output-area');
    const content = outputArea.textContent;

    navigator.clipboard.writeText(content)
        .then(() => alert(translations[currentLang].copySuccess))
        .catch(err => alert(translations[currentLang].copyError));
}

function clearInput() {
    document.getElementById('input-area').value = '';
    convert();
}

function clearOutput() {
    document.getElementById('output-area').innerHTML = '';
}

document.getElementById('input-area').addEventListener('input', convert);

// 初始化语言和主题
updateLanguage();
updateThemeIcon();