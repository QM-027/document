<template>
  <div id="write" class="v-md-preview" v-html="renderedHtml"></div>
</template>

<script>
import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-sql';

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const renderer = {
  code({ text, lang }) {
    const language = (lang || '').split(' ')[0] || '';
    let highlighted = escapeHtml(text);
    if (language && Prism.languages[language]) {
      try {
        highlighted = Prism.highlight(text, Prism.languages[language], language);
      } catch (e) { /* fallback */ }
    }
    return `<pre class="md-fences" data-lang="${language}"><code class="language-${language}">${highlighted}</code></pre>\n`;
  },
  heading({ text, depth }) {
    const cleanText = String(text).replace(/<[^>]+>/g, '');
    const id = cleanText.replace(/[^\w一-龥]+/g, '-').replace(/^-|-$/g, '');
    return `<h${depth} id="${id}">${text}</h${depth}>\n`;
  },
  image({ href, title, text }) {
    const t = title ? ` title="${title}"` : '';
    return `<img src="${href}" alt="${text}"${t} />\n`;
  },
  listitem({ text, task, checked }) {
    if (task) {
      const cls = checked ? 'task-list-done' : 'task-list-not-done';
      return `<li class="md-task-list-item ${cls}"><input type="checkbox" ${checked ? 'checked' : ''} disabled />${text}</li>\n`;
    }
    return `<li>${text}</li>\n`;
  },
  link({ href, title, text }) {
    const t = title ? ` title="${title}"` : '';
    return `<a href="${href}"${t}>${text}</a>`;
  },
  strong({ text }) {
    return `<strong>${text}</strong>`;
  },
  em({ text }) {
    return `<em>${text}</em>`;
  }
};

// 自定义扩展以更好地支持中文加粗
const chineseBoldExtension = {
  name: 'chineseBold',
  level: 'inline',
  start(src) {
    // 查找可能的加粗开始位置
    const match = src.match(/\*\*/)
    return match ? match.index : -1
  },
  tokenizer(src) {
    // 匹配中文加粗，支持中英文混合
    const match = src.match(/^\*\*([\s\S]+?)\*\*(?!\*)/)
    if (match) {
      return {
        type: 'strong',
        raw: match[0],
        text: match[1].trim()
      }
    }
    return false
  }
}

// 自定义 hooks 来处理加粗文本
const hooks = {
  preprocess(src) {
    // 在预处理阶段，将 **文本** 替换为 HTML 标签
    return src.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([\s\S]+?)\*/g, '<em>$1</em>')
  }
}

marked.use({
  renderer,
  gfm: true,
  breaks: false,
  extensions: [chineseBoldExtension],
  hooks
});

export default {
  name: 'MarkdownPreview',
  props: {
    text: { type: String, default: '' }
  },
  computed: {
    renderedHtml() {
      if (!this.text) return '';
      const result = marked(this.text);
      console.log('[MarkdownPreview] Input:', this.text.substring(0, 100));
      console.log('[MarkdownPreview] Output:', result.substring(0, 200));
      return result;
    }
  }
};
</script>
