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
  }
};

marked.use({ renderer, gfm: true, breaks: false });

export default {
  name: 'MarkdownPreview',
  props: {
    text: { type: String, default: '' }
  },
  computed: {
    renderedHtml() {
      if (!this.text) return '';
      return marked(this.text);
    }
  }
};
</script>
