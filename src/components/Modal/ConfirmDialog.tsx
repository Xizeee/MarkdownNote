import { useEffect } from 'react';

interface ConfirmDialogProps {
  /** 弹窗标题 */
  title?: string;
  /** 提示信息 */
  message: string;
  /** 确认按钮文字 */
  confirmText?: string;
  /** 取消按钮文字 */
  cancelText?: string;
  /** 确认回调 */
  onConfirm: () => void;
  /** 取消/关闭回调 */
  onCancel: () => void;
}

// 自定义确认弹窗：替代 window.confirm，提供与主题一致的 UI
export function ConfirmDialog({
  title = '请确认',
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  // ESC 关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900"
        onClick={e => e.stopPropagation()}
      >
        <h3
          id="confirm-dialog-title"
          className="text-base font-semibold text-gray-800 dark:text-gray-100"
        >
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-600"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
