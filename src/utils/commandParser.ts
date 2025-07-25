export interface ParsedCommand {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}

/**
 * 解析 curl 命令，提取 { url, method, headers, body }
 */
export const parseCurlCommand = (command: string): ParsedCommand => {
  const tokens = command.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];

  let url = '';
  let method = '';
  let body = '';
  let hasData = false;
  const headers: Record<string, string> = {};

  const strip = (s: string) => s.replace(/^["']|["']$/g, '');

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    if (t === '-X' || t === '--request') {
      method = strip(tokens[++i]).toUpperCase();
      continue;
    }

    if (t === '-H' || t === '--header') {
      const hdr = strip(tokens[++i]);
      const idx = hdr.indexOf(':');
      if (idx > -1) {
        const key = hdr.slice(0, idx).trim();
        const val = hdr.slice(idx + 1).trim();
        headers[key] = val;
      }
      continue;
    }

    if (['-d','--data','--data-raw','--data-binary','--data-urlencode'].includes(t)) {
      hasData = true;
      body = strip(tokens[++i]);
      continue;
    }

    if (t === '--url') {
      url = strip(tokens[++i]);
      continue;
    }

    if (!t.startsWith('-') && /^https?:\/\//.test(strip(t))) {
      url = strip(t);
      continue;
    }
  }

  if (!method) {
    method = hasData ? 'POST' : 'GET';
  }

  return { url, method, headers, body };
};

/**
 * 解析 fetch 命令，提取 { url, method, headers, body }
 */
export const parseFetchCommand = (command: string): ParsedCommand => {
  const urlMatch = command.match(/fetch\s*\(\s*(['"`])([\s\S]*?)\1/);
  if (!urlMatch) {
    throw new Error('无法解析 URL');
  }
  const url = urlMatch[2];

  const optsMatch = command.match(/fetch\s*\(\s*['"`][\s\S]*?['"`]\s*,\s*({[\s\S]*})\s*\)/);
  let method = 'GET';
  let headers: Record<string, string> = {};
  let body = '';

  if (optsMatch) {
    const optsLiteral = optsMatch[1];
    let opts;
    try {
      /* eslint-disable no-eval */
      opts = eval('(' + optsLiteral + ')');
      /* eslint-enable no-eval */
    } catch (e) {
      console.warn('eval 解析 options 失败，将跳过详细解析：', e);
    }

    if (opts && typeof opts === 'object') {
      if (opts.method) {
        method = String(opts.method).toUpperCase();
      }
      if (opts.headers) {
        if (typeof Headers !== 'undefined' && opts.headers instanceof Headers) {
          opts.headers.forEach((val: string, key: string) => {
            headers[key] = val;
          });
        } else if (typeof opts.headers === 'object') {
          headers = { ...opts.headers as Record<string, string> };
        }
      }
      if (opts.body != null) {
        body = opts.body;
      }
    }
  }
  return { url, method, headers, body };
};

/**
 * 解析命令（自动检测类型）
 */
export const parseCommand = (command: string): ParsedCommand => {
  const trimmed = command.trim();
  if (trimmed.startsWith('curl')) {
    return parseCurlCommand(trimmed);
  } else if (trimmed.startsWith('fetch')) {
    return parseFetchCommand(trimmed);
  } else {
    throw new Error('仅支持curl或fetch命令');
  }
}; 