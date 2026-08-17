import { useEffect, useRef, useState } from 'react';

interface ImageInsertDialogProps {
  /** 插入回调，参数为完整的图片 Markdown（![alt](src)） */
  onInsert: (markdown: string) => void;
  /** 取消/关闭回调 */
  onCancel: () => void;
}

// 本地图片大小上限：2MB（base64 嵌入后约 2.7MB，避免撑爆 LocalStorage 5MB 配额）
const MAX_FILE_SIZE = 2 * 1024 * 1024;

type Mode = 'file' | 'url';

// 把文件读成 data URL（base64）
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// 图片插入弹窗：支持本地上传（base64 嵌入）与网络链接两种方式
export function ImageInsertDialog({ onInsert, onCancel }: ImageInsertDialogProps) {
  const [mode, setMode] = useState<Mode>('file');
  const [dataUrl, setDataUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ESC 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError('');
    if (!f.type.startsWith('image/')) {
      setError('请选择图片文件（PNG / JPG / GIF / WebP 等）');
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError(`图片过大（${(f.size / 1024 / 1024).toFixed(1)}MB），请选择小于 2MB 的图片`);
      e.target.value = '';
      return;
    }
    setLoading(true);
    try {
      const result = await fileToDataUrl(f);
      setDataUrl(result);
      setFileName(f.name);
      setFileSize(f.size);
      if (!alt) {
        setAlt(f.name.replace(/\.[^.]+$/, ''));
      }
    } catch {
      setError('读取图片失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    const src = mode === 'file' ? dataUrl : url.trim();
    if (!src) {
      setError(mode === 'file' ? '请先选择图片' : '请输入图片链接');
      return;
    }
    const altText = alt.trim() || '图片';
    onInsert(`![${altText}](${src})`);
  };

  const canInsert = mode === 'file' ? !!dataUrl && !loading : !!url.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-dialog-title"
    >
      <div
        className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900"
        onClick={e => e.stopPropagation()}
      >
        <h3
          id="image-dialog-title"
          className="text-base font-semibold text-gray-800 dark:text-gray-100"
        >
          插入图片
        </h3>

        {/* 模式切换 */}
        <div className="mt-3 flex gap-1 border-b border-gray-200 dark:border-gray-700">
          {(['file', 'url'] as Mode[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError('');
              }}
              className={`-mb-px border-b-2 px-3 py-1.5 text-sm transition ${
                mode === m
                  ? 'border-brand-500 font-medium text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {m === 'file' ? '本地上传' : '网络链接'}
            </button>
          ))}
        </div>

        <div className="mt-3">
          {mode === 'file' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {loading ? '读取中...' : '选择图片'}
              </button>
              {dataUrl && (
                <div className="mt-3">
                  <img
                    src={dataUrl}
                    alt={alt || fileName}
                    className="max-h-40 rounded border border-gray-200 object-contain dark:border-gray-700"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {fileName} · {(fileSize / 1024).toFixed(0)}KB
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">图片链接</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-700 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
              />
              {url && (
                <img
                  src={url}
                  alt={alt}
                  className="mt-2 max-h-40 rounded border border-gray-200 object-contain dark:border-gray-700"
                  onError={() => setError('图片加载失败，请检查链接')}
                />
              )}
            </div>
          )}

          {/* alt 文本 */}
          <div className="mt-3">
            <label className="text-xs text-gray-500 dark:text-gray-400">替代文本（可选）</label>
            <input
              type="text"
              value={alt}
              onChange={e => setAlt(e.target.value)}
              placeholder="图片描述（图片加载失败时显示）"
              className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-700 outline-none transition focus:border-brand-400 focus:ring-1 focus:ring-brand-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={!canInsert}
            className="rounded-md bg-brand-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            插入
          </button>
        </div>
      </div>
    </div>
  );
}
