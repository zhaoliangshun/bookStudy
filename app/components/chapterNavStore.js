// =============================================================
// 全局章节导航状态（模块级单例）
// -------------------------------------------------------------
// 用于 FloatingChapterNav 浮动按钮获取当前页面的章节列表与回调。
// 每个教程页面的 Sidebar 在挂载/更新时通过 register() 注册章节数据，
// 卸载时通过 unregister() 清除。
// 通过订阅-发布模式通知浮动组件刷新。
// =============================================================

let _state = {
  chapters: [],
  activeId: null,
  onSelect: null,
};

const _listeners = new Set();

function _emit() {
  _listeners.forEach((fn) => fn(_state));
}

export const chapterNavStore = {
  getState() {
    return _state;
  },
  register(chapters, activeId, onSelect) {
    _state = { chapters: chapters || [], activeId: activeId || null, onSelect: onSelect || null };
    _emit();
  },
  updateActive(activeId) {
    if (_state.activeId === activeId) return;
    _state = { ..._state, activeId };
    _emit();
  },
  unregister() {
    _state = { chapters: [], activeId: null, onSelect: null };
    _emit();
  },
  subscribe(fn) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
