/**
 * Load a full HTML document and merge it into the current page.
 * Requires HTTP(S) (e.g. local dev server); file:// will block fetch.
 */
async function importHtml(src) {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`${src} (${response.status})`);
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');

  if (doc.documentElement.lang) {
    document.documentElement.lang = doc.documentElement.lang;
  }

  const title = doc.querySelector('title');
  if (title) {
    document.title = title.textContent;
  }

  doc.head.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    document.head.appendChild(node.cloneNode(true));
  });

  const scripts = [...doc.body.querySelectorAll('script')];
  scripts.forEach((s) => s.remove());

  document.body.className = doc.body.className;
  document.body.innerHTML = doc.body.innerHTML;

  for (const oldScript of scripts) {
    const script = document.createElement('script');
    [...oldScript.attributes].forEach((attr) => {
      script.setAttribute(attr.name, attr.value);
    });
    if (!oldScript.src) {
      script.textContent = oldScript.textContent;
    }
    document.body.appendChild(script);
  }
}

//HTML 파일 경로
const src =
  document.currentScript?.dataset?.src ?? 'WeBlock_landing_v1.html';

importHtml(src).catch((err) => {
  document.body.innerHTML = `
    <main style="font-family: system-ui, sans-serif; max-width: 32rem; margin: 4rem auto; padding: 0 1.5rem; line-height: 1.6;">
      <h1 style="font-size: 1.25rem; margin-bottom: 0.75rem;">페이지를 불러오지 못했습니다</h1>
      <p style="color: #555;">${src} — ${err.message}</p>
      <p style="color: #555; margin-top: 1rem; font-size: 0.9rem;">
        정적 파일은 <code>file://</code>에서 fetch가 차단됩니다.
        <code>npx serve .</code> 등으로 로컬 서버를 띄운 뒤 다시 열어 주세요.
      </p>
    </main>`;
});
