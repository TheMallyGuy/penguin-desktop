(() => {
  // node_modules/@tauri-apps/api/external/tslib/tslib.es6.js
  function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f)
      throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
      throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  }
  function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m")
      throw new TypeError("Private method is not writable");
    if (kind === "a" && !f)
      throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
      throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
  }

  // node_modules/@tauri-apps/api/core.js
  var _Channel_onmessage;
  var _Channel_nextMessageIndex;
  var _Channel_pendingMessages;
  var _Channel_messageEndIndex;
  var _Resource_rid;
  var SERIALIZE_TO_IPC_FN = "__TAURI_TO_IPC_KEY__";
  function transformCallback(callback, once = false) {
    return window.__TAURI_INTERNALS__.transformCallback(callback, once);
  }

  class Channel {
    constructor(onmessage) {
      _Channel_onmessage.set(this, undefined);
      _Channel_nextMessageIndex.set(this, 0);
      _Channel_pendingMessages.set(this, []);
      _Channel_messageEndIndex.set(this, undefined);
      __classPrivateFieldSet(this, _Channel_onmessage, onmessage || (() => {}), "f");
      this.id = transformCallback((rawMessage) => {
        const index = rawMessage.index;
        if ("end" in rawMessage) {
          if (index == __classPrivateFieldGet(this, _Channel_nextMessageIndex, "f")) {
            this.cleanupCallback();
          } else {
            __classPrivateFieldSet(this, _Channel_messageEndIndex, index, "f");
          }
          return;
        }
        const message = rawMessage.message;
        if (index == __classPrivateFieldGet(this, _Channel_nextMessageIndex, "f")) {
          __classPrivateFieldGet(this, _Channel_onmessage, "f").call(this, message);
          __classPrivateFieldSet(this, _Channel_nextMessageIndex, __classPrivateFieldGet(this, _Channel_nextMessageIndex, "f") + 1, "f");
          while (__classPrivateFieldGet(this, _Channel_nextMessageIndex, "f") in __classPrivateFieldGet(this, _Channel_pendingMessages, "f")) {
            const message2 = __classPrivateFieldGet(this, _Channel_pendingMessages, "f")[__classPrivateFieldGet(this, _Channel_nextMessageIndex, "f")];
            __classPrivateFieldGet(this, _Channel_onmessage, "f").call(this, message2);
            delete __classPrivateFieldGet(this, _Channel_pendingMessages, "f")[__classPrivateFieldGet(this, _Channel_nextMessageIndex, "f")];
            __classPrivateFieldSet(this, _Channel_nextMessageIndex, __classPrivateFieldGet(this, _Channel_nextMessageIndex, "f") + 1, "f");
          }
          if (__classPrivateFieldGet(this, _Channel_nextMessageIndex, "f") === __classPrivateFieldGet(this, _Channel_messageEndIndex, "f")) {
            this.cleanupCallback();
          }
        } else {
          __classPrivateFieldGet(this, _Channel_pendingMessages, "f")[index] = message;
        }
      });
    }
    cleanupCallback() {
      window.__TAURI_INTERNALS__.unregisterCallback(this.id);
    }
    set onmessage(handler) {
      __classPrivateFieldSet(this, _Channel_onmessage, handler, "f");
    }
    get onmessage() {
      return __classPrivateFieldGet(this, _Channel_onmessage, "f");
    }
    [(_Channel_onmessage = new WeakMap, _Channel_nextMessageIndex = new WeakMap, _Channel_pendingMessages = new WeakMap, _Channel_messageEndIndex = new WeakMap, SERIALIZE_TO_IPC_FN)]() {
      return `__CHANNEL__:${this.id}`;
    }
    toJSON() {
      return this[SERIALIZE_TO_IPC_FN]();
    }
  }
  async function invoke(cmd, args = {}, options) {
    return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
  }
  class Resource {
    get rid() {
      return __classPrivateFieldGet(this, _Resource_rid, "f");
    }
    constructor(rid) {
      _Resource_rid.set(this, undefined);
      __classPrivateFieldSet(this, _Resource_rid, rid, "f");
    }
    async close() {
      return invoke("plugin:resources|close", {
        rid: this.rid
      });
    }
  }
  _Resource_rid = new WeakMap;

  // node_modules/@tauri-apps/api/dpi.js
  class LogicalSize {
    constructor(...args) {
      this.type = "Logical";
      if (args.length === 1) {
        if ("Logical" in args[0]) {
          this.width = args[0].Logical.width;
          this.height = args[0].Logical.height;
        } else {
          this.width = args[0].width;
          this.height = args[0].height;
        }
      } else {
        this.width = args[0];
        this.height = args[1];
      }
    }
    toPhysical(scaleFactor) {
      return new PhysicalSize(this.width * scaleFactor, this.height * scaleFactor);
    }
    [SERIALIZE_TO_IPC_FN]() {
      return {
        width: this.width,
        height: this.height
      };
    }
    toJSON() {
      return this[SERIALIZE_TO_IPC_FN]();
    }
  }

  class PhysicalSize {
    constructor(...args) {
      this.type = "Physical";
      if (args.length === 1) {
        if ("Physical" in args[0]) {
          this.width = args[0].Physical.width;
          this.height = args[0].Physical.height;
        } else {
          this.width = args[0].width;
          this.height = args[0].height;
        }
      } else {
        this.width = args[0];
        this.height = args[1];
      }
    }
    toLogical(scaleFactor) {
      return new LogicalSize(this.width / scaleFactor, this.height / scaleFactor);
    }
    [SERIALIZE_TO_IPC_FN]() {
      return {
        width: this.width,
        height: this.height
      };
    }
    toJSON() {
      return this[SERIALIZE_TO_IPC_FN]();
    }
  }

  class Size {
    constructor(size) {
      this.size = size;
    }
    toLogical(scaleFactor) {
      return this.size instanceof LogicalSize ? this.size : this.size.toLogical(scaleFactor);
    }
    toPhysical(scaleFactor) {
      return this.size instanceof PhysicalSize ? this.size : this.size.toPhysical(scaleFactor);
    }
    [SERIALIZE_TO_IPC_FN]() {
      return {
        [`${this.size.type}`]: {
          width: this.size.width,
          height: this.size.height
        }
      };
    }
    toJSON() {
      return this[SERIALIZE_TO_IPC_FN]();
    }
  }

  class LogicalPosition {
    constructor(...args) {
      this.type = "Logical";
      if (args.length === 1) {
        if ("Logical" in args[0]) {
          this.x = args[0].Logical.x;
          this.y = args[0].Logical.y;
        } else {
          this.x = args[0].x;
          this.y = args[0].y;
        }
      } else {
        this.x = args[0];
        this.y = args[1];
      }
    }
    toPhysical(scaleFactor) {
      return new PhysicalPosition(this.x * scaleFactor, this.y * scaleFactor);
    }
    [SERIALIZE_TO_IPC_FN]() {
      return {
        x: this.x,
        y: this.y
      };
    }
    toJSON() {
      return this[SERIALIZE_TO_IPC_FN]();
    }
  }

  class PhysicalPosition {
    constructor(...args) {
      this.type = "Physical";
      if (args.length === 1) {
        if ("Physical" in args[0]) {
          this.x = args[0].Physical.x;
          this.y = args[0].Physical.y;
        } else {
          this.x = args[0].x;
          this.y = args[0].y;
        }
      } else {
        this.x = args[0];
        this.y = args[1];
      }
    }
    toLogical(scaleFactor) {
      return new LogicalPosition(this.x / scaleFactor, this.y / scaleFactor);
    }
    [SERIALIZE_TO_IPC_FN]() {
      return {
        x: this.x,
        y: this.y
      };
    }
    toJSON() {
      return this[SERIALIZE_TO_IPC_FN]();
    }
  }

  class Position {
    constructor(position) {
      this.position = position;
    }
    toLogical(scaleFactor) {
      return this.position instanceof LogicalPosition ? this.position : this.position.toLogical(scaleFactor);
    }
    toPhysical(scaleFactor) {
      return this.position instanceof PhysicalPosition ? this.position : this.position.toPhysical(scaleFactor);
    }
    [SERIALIZE_TO_IPC_FN]() {
      return {
        [`${this.position.type}`]: {
          x: this.position.x,
          y: this.position.y
        }
      };
    }
    toJSON() {
      return this[SERIALIZE_TO_IPC_FN]();
    }
  }

  // node_modules/@tauri-apps/api/event.js
  var TauriEvent;
  (function(TauriEvent2) {
    TauriEvent2["WINDOW_RESIZED"] = "tauri://resize";
    TauriEvent2["WINDOW_MOVED"] = "tauri://move";
    TauriEvent2["WINDOW_CLOSE_REQUESTED"] = "tauri://close-requested";
    TauriEvent2["WINDOW_DESTROYED"] = "tauri://destroyed";
    TauriEvent2["WINDOW_FOCUS"] = "tauri://focus";
    TauriEvent2["WINDOW_BLUR"] = "tauri://blur";
    TauriEvent2["WINDOW_SCALE_FACTOR_CHANGED"] = "tauri://scale-change";
    TauriEvent2["WINDOW_THEME_CHANGED"] = "tauri://theme-changed";
    TauriEvent2["WINDOW_CREATED"] = "tauri://window-created";
    TauriEvent2["WINDOW_SUSPENDED"] = "tauri://suspended";
    TauriEvent2["WINDOW_RESUMED"] = "tauri://resumed";
    TauriEvent2["WEBVIEW_CREATED"] = "tauri://webview-created";
    TauriEvent2["DRAG_ENTER"] = "tauri://drag-enter";
    TauriEvent2["DRAG_OVER"] = "tauri://drag-over";
    TauriEvent2["DRAG_DROP"] = "tauri://drag-drop";
    TauriEvent2["DRAG_LEAVE"] = "tauri://drag-leave";
  })(TauriEvent || (TauriEvent = {}));
  async function _unlisten(event, eventId) {
    window.__TAURI_EVENT_PLUGIN_INTERNALS__.unregisterListener(event, eventId);
    await invoke("plugin:event|unlisten", {
      event,
      eventId
    });
  }
  async function listen(event, handler, options) {
    var _a;
    const target = typeof (options === null || options === undefined ? undefined : options.target) === "string" ? { kind: "AnyLabel", label: options.target } : (_a = options === null || options === undefined ? undefined : options.target) !== null && _a !== undefined ? _a : { kind: "Any" };
    return invoke("plugin:event|listen", {
      event,
      target,
      handler: transformCallback(handler)
    }).then((eventId) => {
      return async () => _unlisten(event, eventId);
    });
  }
  async function once(event, handler, options) {
    return listen(event, (eventData) => {
      _unlisten(event, eventData.id);
      handler(eventData);
    }, options);
  }
  async function emit(event, payload) {
    await invoke("plugin:event|emit", {
      event,
      payload
    });
  }
  async function emitTo(target, event, payload) {
    const eventTarget = typeof target === "string" ? { kind: "AnyLabel", label: target } : target;
    await invoke("plugin:event|emit_to", {
      target: eventTarget,
      event,
      payload
    });
  }
  // node_modules/@tauri-apps/api/image.js
  class Image extends Resource {
    constructor(rid) {
      super(rid);
    }
    static async new(rgba, width, height) {
      return invoke("plugin:image|new", {
        rgba: transformImage(rgba),
        width,
        height
      }).then((rid) => new Image(rid));
    }
    static async fromBytes(bytes) {
      return invoke("plugin:image|from_bytes", {
        bytes: transformImage(bytes)
      }).then((rid) => new Image(rid));
    }
    static async fromPath(path) {
      return invoke("plugin:image|from_path", { path }).then((rid) => new Image(rid));
    }
    async rgba() {
      return invoke("plugin:image|rgba", {
        rid: this.rid
      }).then((buffer) => new Uint8Array(buffer));
    }
    async size() {
      return invoke("plugin:image|size", { rid: this.rid });
    }
  }
  function transformImage(image) {
    const ret = image == null ? null : typeof image === "string" ? image : image instanceof Image ? image.rid : image;
    return ret;
  }

  // node_modules/@tauri-apps/api/window.js
  var UserAttentionType;
  (function(UserAttentionType2) {
    UserAttentionType2[UserAttentionType2["Critical"] = 1] = "Critical";
    UserAttentionType2[UserAttentionType2["Informational"] = 2] = "Informational";
  })(UserAttentionType || (UserAttentionType = {}));

  class CloseRequestedEvent {
    constructor(event) {
      this._preventDefault = false;
      this.event = event.event;
      this.id = event.id;
    }
    preventDefault() {
      this._preventDefault = true;
    }
    isPreventDefault() {
      return this._preventDefault;
    }
  }
  var ProgressBarStatus;
  (function(ProgressBarStatus2) {
    ProgressBarStatus2["None"] = "none";
    ProgressBarStatus2["Normal"] = "normal";
    ProgressBarStatus2["Indeterminate"] = "indeterminate";
    ProgressBarStatus2["Paused"] = "paused";
    ProgressBarStatus2["Error"] = "error";
  })(ProgressBarStatus || (ProgressBarStatus = {}));
  function getCurrentWindow() {
    return new Window(window.__TAURI_INTERNALS__.metadata.currentWindow.label, {
      skip: true
    });
  }
  async function getAllWindows() {
    return invoke("plugin:window|get_all_windows").then((windows) => windows.map((w) => new Window(w, {
      skip: true
    })));
  }
  var localTauriEvents = ["tauri://created", "tauri://error"];

  class Window {
    constructor(label, options = {}) {
      var _a;
      this.label = label;
      this.listeners = Object.create(null);
      if (!(options === null || options === undefined ? undefined : options.skip)) {
        invoke("plugin:window|create", {
          options: {
            ...options,
            parent: typeof options.parent === "string" ? options.parent : (_a = options.parent) === null || _a === undefined ? undefined : _a.label,
            label
          }
        }).then(async () => this.emit("tauri://created")).catch(async (e) => this.emit("tauri://error", e));
      }
    }
    static async getByLabel(label) {
      var _a;
      return (_a = (await getAllWindows()).find((w) => w.label === label)) !== null && _a !== undefined ? _a : null;
    }
    static getCurrent() {
      return getCurrentWindow();
    }
    static async getAll() {
      return getAllWindows();
    }
    static async getFocusedWindow() {
      for (const w of await getAllWindows()) {
        if (await w.isFocused()) {
          return w;
        }
      }
      return null;
    }
    async listen(event, handler) {
      if (this._handleTauriEvent(event, handler)) {
        return () => {
          const listeners = this.listeners[event];
          listeners.splice(listeners.indexOf(handler), 1);
        };
      }
      return listen(event, handler, {
        target: { kind: "Window", label: this.label }
      });
    }
    async once(event, handler) {
      if (this._handleTauriEvent(event, handler)) {
        return () => {
          const listeners = this.listeners[event];
          listeners.splice(listeners.indexOf(handler), 1);
        };
      }
      return once(event, handler, {
        target: { kind: "Window", label: this.label }
      });
    }
    async emit(event, payload) {
      if (localTauriEvents.includes(event)) {
        for (const handler of this.listeners[event] || []) {
          handler({
            event,
            id: -1,
            payload
          });
        }
        return;
      }
      return emit(event, payload);
    }
    async emitTo(target, event, payload) {
      if (localTauriEvents.includes(event)) {
        for (const handler of this.listeners[event] || []) {
          handler({
            event,
            id: -1,
            payload
          });
        }
        return;
      }
      return emitTo(target, event, payload);
    }
    _handleTauriEvent(event, handler) {
      if (localTauriEvents.includes(event)) {
        if (!(event in this.listeners)) {
          this.listeners[event] = [handler];
        } else {
          this.listeners[event].push(handler);
        }
        return true;
      }
      return false;
    }
    async scaleFactor() {
      return invoke("plugin:window|scale_factor", {
        label: this.label
      });
    }
    async innerPosition() {
      return invoke("plugin:window|inner_position", {
        label: this.label
      }).then((p) => new PhysicalPosition(p));
    }
    async outerPosition() {
      return invoke("plugin:window|outer_position", {
        label: this.label
      }).then((p) => new PhysicalPosition(p));
    }
    async innerSize() {
      return invoke("plugin:window|inner_size", {
        label: this.label
      }).then((s) => new PhysicalSize(s));
    }
    async outerSize() {
      return invoke("plugin:window|outer_size", {
        label: this.label
      }).then((s) => new PhysicalSize(s));
    }
    async isFullscreen() {
      return invoke("plugin:window|is_fullscreen", {
        label: this.label
      });
    }
    async isMinimized() {
      return invoke("plugin:window|is_minimized", {
        label: this.label
      });
    }
    async isMaximized() {
      return invoke("plugin:window|is_maximized", {
        label: this.label
      });
    }
    async isFocused() {
      return invoke("plugin:window|is_focused", {
        label: this.label
      });
    }
    async isDecorated() {
      return invoke("plugin:window|is_decorated", {
        label: this.label
      });
    }
    async isResizable() {
      return invoke("plugin:window|is_resizable", {
        label: this.label
      });
    }
    async isMaximizable() {
      return invoke("plugin:window|is_maximizable", {
        label: this.label
      });
    }
    async isMinimizable() {
      return invoke("plugin:window|is_minimizable", {
        label: this.label
      });
    }
    async isClosable() {
      return invoke("plugin:window|is_closable", {
        label: this.label
      });
    }
    async isVisible() {
      return invoke("plugin:window|is_visible", {
        label: this.label
      });
    }
    async title() {
      return invoke("plugin:window|title", {
        label: this.label
      });
    }
    async theme() {
      return invoke("plugin:window|theme", {
        label: this.label
      });
    }
    async isAlwaysOnTop() {
      return invoke("plugin:window|is_always_on_top", {
        label: this.label
      });
    }
    async activityName() {
      return invoke("plugin:window|activity_name", {
        label: this.label
      });
    }
    async sceneIdentifier() {
      return invoke("plugin:window|scene_identifier", {
        label: this.label
      });
    }
    async center() {
      return invoke("plugin:window|center", {
        label: this.label
      });
    }
    async requestUserAttention(requestType) {
      let requestType_ = null;
      if (requestType) {
        if (requestType === UserAttentionType.Critical) {
          requestType_ = { type: "Critical" };
        } else {
          requestType_ = { type: "Informational" };
        }
      }
      return invoke("plugin:window|request_user_attention", {
        label: this.label,
        value: requestType_
      });
    }
    async setResizable(resizable) {
      return invoke("plugin:window|set_resizable", {
        label: this.label,
        value: resizable
      });
    }
    async setEnabled(enabled) {
      return invoke("plugin:window|set_enabled", {
        label: this.label,
        value: enabled
      });
    }
    async isEnabled() {
      return invoke("plugin:window|is_enabled", {
        label: this.label
      });
    }
    async setMaximizable(maximizable) {
      return invoke("plugin:window|set_maximizable", {
        label: this.label,
        value: maximizable
      });
    }
    async setMinimizable(minimizable) {
      return invoke("plugin:window|set_minimizable", {
        label: this.label,
        value: minimizable
      });
    }
    async setClosable(closable) {
      return invoke("plugin:window|set_closable", {
        label: this.label,
        value: closable
      });
    }
    async setTitle(title) {
      return invoke("plugin:window|set_title", {
        label: this.label,
        value: title
      });
    }
    async maximize() {
      return invoke("plugin:window|maximize", {
        label: this.label
      });
    }
    async unmaximize() {
      return invoke("plugin:window|unmaximize", {
        label: this.label
      });
    }
    async toggleMaximize() {
      return invoke("plugin:window|toggle_maximize", {
        label: this.label
      });
    }
    async minimize() {
      return invoke("plugin:window|minimize", {
        label: this.label
      });
    }
    async unminimize() {
      return invoke("plugin:window|unminimize", {
        label: this.label
      });
    }
    async show() {
      return invoke("plugin:window|show", {
        label: this.label
      });
    }
    async hide() {
      return invoke("plugin:window|hide", {
        label: this.label
      });
    }
    async close() {
      return invoke("plugin:window|close", {
        label: this.label
      });
    }
    async destroy() {
      return invoke("plugin:window|destroy", {
        label: this.label
      });
    }
    async setDecorations(decorations) {
      return invoke("plugin:window|set_decorations", {
        label: this.label,
        value: decorations
      });
    }
    async setShadow(enable) {
      return invoke("plugin:window|set_shadow", {
        label: this.label,
        value: enable
      });
    }
    async setEffects(effects) {
      return invoke("plugin:window|set_effects", {
        label: this.label,
        value: effects
      });
    }
    async clearEffects() {
      return invoke("plugin:window|set_effects", {
        label: this.label,
        value: null
      });
    }
    async setAlwaysOnTop(alwaysOnTop) {
      return invoke("plugin:window|set_always_on_top", {
        label: this.label,
        value: alwaysOnTop
      });
    }
    async setAlwaysOnBottom(alwaysOnBottom) {
      return invoke("plugin:window|set_always_on_bottom", {
        label: this.label,
        value: alwaysOnBottom
      });
    }
    async setContentProtected(protected_) {
      return invoke("plugin:window|set_content_protected", {
        label: this.label,
        value: protected_
      });
    }
    async setSize(size) {
      return invoke("plugin:window|set_size", {
        label: this.label,
        value: size instanceof Size ? size : new Size(size)
      });
    }
    async setMinSize(size) {
      return invoke("plugin:window|set_min_size", {
        label: this.label,
        value: size instanceof Size ? size : size ? new Size(size) : null
      });
    }
    async setMaxSize(size) {
      return invoke("plugin:window|set_max_size", {
        label: this.label,
        value: size instanceof Size ? size : size ? new Size(size) : null
      });
    }
    async setSizeConstraints(constraints) {
      function logical(pixel) {
        return pixel ? { Logical: pixel } : null;
      }
      return invoke("plugin:window|set_size_constraints", {
        label: this.label,
        value: {
          minWidth: logical(constraints === null || constraints === undefined ? undefined : constraints.minWidth),
          minHeight: logical(constraints === null || constraints === undefined ? undefined : constraints.minHeight),
          maxWidth: logical(constraints === null || constraints === undefined ? undefined : constraints.maxWidth),
          maxHeight: logical(constraints === null || constraints === undefined ? undefined : constraints.maxHeight)
        }
      });
    }
    async setPosition(position) {
      return invoke("plugin:window|set_position", {
        label: this.label,
        value: position instanceof Position ? position : new Position(position)
      });
    }
    async setFullscreen(fullscreen) {
      return invoke("plugin:window|set_fullscreen", {
        label: this.label,
        value: fullscreen
      });
    }
    async setSimpleFullscreen(fullscreen) {
      return invoke("plugin:window|set_simple_fullscreen", {
        label: this.label,
        value: fullscreen
      });
    }
    async setFocus() {
      return invoke("plugin:window|set_focus", {
        label: this.label
      });
    }
    async setFocusable(focusable) {
      return invoke("plugin:window|set_focusable", {
        label: this.label,
        value: focusable
      });
    }
    async setIcon(icon) {
      return invoke("plugin:window|set_icon", {
        label: this.label,
        value: transformImage(icon)
      });
    }
    async setSkipTaskbar(skip) {
      return invoke("plugin:window|set_skip_taskbar", {
        label: this.label,
        value: skip
      });
    }
    async setCursorGrab(grab) {
      return invoke("plugin:window|set_cursor_grab", {
        label: this.label,
        value: grab
      });
    }
    async setCursorVisible(visible) {
      return invoke("plugin:window|set_cursor_visible", {
        label: this.label,
        value: visible
      });
    }
    async setCursorIcon(icon) {
      return invoke("plugin:window|set_cursor_icon", {
        label: this.label,
        value: icon
      });
    }
    async setBackgroundColor(color) {
      return invoke("plugin:window|set_background_color", { color });
    }
    async setCursorPosition(position) {
      return invoke("plugin:window|set_cursor_position", {
        label: this.label,
        value: position instanceof Position ? position : new Position(position)
      });
    }
    async setIgnoreCursorEvents(ignore) {
      return invoke("plugin:window|set_ignore_cursor_events", {
        label: this.label,
        value: ignore
      });
    }
    async startDragging() {
      return invoke("plugin:window|start_dragging", {
        label: this.label
      });
    }
    async startResizeDragging(direction) {
      return invoke("plugin:window|start_resize_dragging", {
        label: this.label,
        value: direction
      });
    }
    async setBadgeCount(count) {
      return invoke("plugin:window|set_badge_count", {
        label: this.label,
        value: count
      });
    }
    async setBadgeLabel(label) {
      return invoke("plugin:window|set_badge_label", {
        label: this.label,
        value: label
      });
    }
    async setOverlayIcon(icon) {
      return invoke("plugin:window|set_overlay_icon", {
        label: this.label,
        value: icon ? transformImage(icon) : undefined
      });
    }
    async setProgressBar(state) {
      return invoke("plugin:window|set_progress_bar", {
        label: this.label,
        value: state
      });
    }
    async setVisibleOnAllWorkspaces(visible) {
      return invoke("plugin:window|set_visible_on_all_workspaces", {
        label: this.label,
        value: visible
      });
    }
    async setTitleBarStyle(style) {
      return invoke("plugin:window|set_title_bar_style", {
        label: this.label,
        value: style
      });
    }
    async setTheme(theme) {
      return invoke("plugin:window|set_theme", {
        label: this.label,
        value: theme
      });
    }
    async onResized(handler) {
      return this.listen(TauriEvent.WINDOW_RESIZED, (e) => {
        e.payload = new PhysicalSize(e.payload);
        handler(e);
      });
    }
    async onMoved(handler) {
      return this.listen(TauriEvent.WINDOW_MOVED, (e) => {
        e.payload = new PhysicalPosition(e.payload);
        handler(e);
      });
    }
    async onCloseRequested(handler) {
      return this.listen(TauriEvent.WINDOW_CLOSE_REQUESTED, async (event) => {
        const evt = new CloseRequestedEvent(event);
        await handler(evt);
        if (!evt.isPreventDefault()) {
          await this.destroy();
        }
      });
    }
    async onDragDropEvent(handler) {
      const unlistenDrag = await this.listen(TauriEvent.DRAG_ENTER, (event) => {
        handler({
          ...event,
          payload: {
            type: "enter",
            paths: event.payload.paths,
            position: new PhysicalPosition(event.payload.position)
          }
        });
      });
      const unlistenDragOver = await this.listen(TauriEvent.DRAG_OVER, (event) => {
        handler({
          ...event,
          payload: {
            type: "over",
            position: new PhysicalPosition(event.payload.position)
          }
        });
      });
      const unlistenDrop = await this.listen(TauriEvent.DRAG_DROP, (event) => {
        handler({
          ...event,
          payload: {
            type: "drop",
            paths: event.payload.paths,
            position: new PhysicalPosition(event.payload.position)
          }
        });
      });
      const unlistenCancel = await this.listen(TauriEvent.DRAG_LEAVE, (event) => {
        handler({ ...event, payload: { type: "leave" } });
      });
      return () => {
        unlistenDrag();
        unlistenDrop();
        unlistenDragOver();
        unlistenCancel();
      };
    }
    async onFocusChanged(handler) {
      const unlistenFocus = await this.listen(TauriEvent.WINDOW_FOCUS, (event) => {
        handler({ ...event, payload: true });
      });
      const unlistenBlur = await this.listen(TauriEvent.WINDOW_BLUR, (event) => {
        handler({ ...event, payload: false });
      });
      return () => {
        unlistenFocus();
        unlistenBlur();
      };
    }
    async onScaleChanged(handler) {
      return this.listen(TauriEvent.WINDOW_SCALE_FACTOR_CHANGED, handler);
    }
    async onThemeChanged(handler) {
      return this.listen(TauriEvent.WINDOW_THEME_CHANGED, handler);
    }
  }
  var BackgroundThrottlingPolicy;
  (function(BackgroundThrottlingPolicy2) {
    BackgroundThrottlingPolicy2["Disabled"] = "disabled";
    BackgroundThrottlingPolicy2["Throttle"] = "throttle";
    BackgroundThrottlingPolicy2["Suspend"] = "suspend";
  })(BackgroundThrottlingPolicy || (BackgroundThrottlingPolicy = {}));
  var ScrollBarStyle;
  (function(ScrollBarStyle2) {
    ScrollBarStyle2["Default"] = "default";
    ScrollBarStyle2["FluentOverlay"] = "fluentOverlay";
  })(ScrollBarStyle || (ScrollBarStyle = {}));
  var Effect;
  (function(Effect2) {
    Effect2["AppearanceBased"] = "appearanceBased";
    Effect2["Light"] = "light";
    Effect2["Dark"] = "dark";
    Effect2["MediumLight"] = "mediumLight";
    Effect2["UltraDark"] = "ultraDark";
    Effect2["Titlebar"] = "titlebar";
    Effect2["Selection"] = "selection";
    Effect2["Menu"] = "menu";
    Effect2["Popover"] = "popover";
    Effect2["Sidebar"] = "sidebar";
    Effect2["HeaderView"] = "headerView";
    Effect2["Sheet"] = "sheet";
    Effect2["WindowBackground"] = "windowBackground";
    Effect2["HudWindow"] = "hudWindow";
    Effect2["FullScreenUI"] = "fullScreenUI";
    Effect2["Tooltip"] = "tooltip";
    Effect2["ContentBackground"] = "contentBackground";
    Effect2["UnderWindowBackground"] = "underWindowBackground";
    Effect2["UnderPageBackground"] = "underPageBackground";
    Effect2["Mica"] = "mica";
    Effect2["Blur"] = "blur";
    Effect2["Acrylic"] = "acrylic";
    Effect2["Tabbed"] = "tabbed";
    Effect2["TabbedDark"] = "tabbedDark";
    Effect2["TabbedLight"] = "tabbedLight";
  })(Effect || (Effect = {}));
  var EffectState;
  (function(EffectState2) {
    EffectState2["FollowsWindowActiveState"] = "followsWindowActiveState";
    EffectState2["Active"] = "active";
    EffectState2["Inactive"] = "inactive";
  })(EffectState || (EffectState = {}));

  // node_modules/@tauri-apps/api/webview.js
  function getCurrentWebview() {
    return new Webview(getCurrentWindow(), window.__TAURI_INTERNALS__.metadata.currentWebview.label, {
      skip: true
    });
  }
  async function getAllWebviews() {
    return invoke("plugin:webview|get_all_webviews").then((webviews) => webviews.map((w) => new Webview(new Window(w.windowLabel, {
      skip: true
    }), w.label, {
      skip: true
    })));
  }
  var localTauriEvents2 = ["tauri://created", "tauri://error"];

  class Webview {
    constructor(window2, label, options) {
      this.window = window2;
      this.label = label;
      this.listeners = Object.create(null);
      if (!(options === null || options === undefined ? undefined : options.skip)) {
        invoke("plugin:webview|create_webview", {
          windowLabel: window2.label,
          options: {
            ...options,
            label
          }
        }).then(async () => this.emit("tauri://created")).catch(async (e) => this.emit("tauri://error", e));
      }
    }
    static async getByLabel(label) {
      var _a;
      return (_a = (await getAllWebviews()).find((w) => w.label === label)) !== null && _a !== undefined ? _a : null;
    }
    static getCurrent() {
      return getCurrentWebview();
    }
    static async getAll() {
      return getAllWebviews();
    }
    async listen(event, handler) {
      if (this._handleTauriEvent(event, handler)) {
        return () => {
          const listeners = this.listeners[event];
          listeners.splice(listeners.indexOf(handler), 1);
        };
      }
      return listen(event, handler, {
        target: { kind: "Webview", label: this.label }
      });
    }
    async once(event, handler) {
      if (this._handleTauriEvent(event, handler)) {
        return () => {
          const listeners = this.listeners[event];
          listeners.splice(listeners.indexOf(handler), 1);
        };
      }
      return once(event, handler, {
        target: { kind: "Webview", label: this.label }
      });
    }
    async emit(event, payload) {
      if (localTauriEvents2.includes(event)) {
        for (const handler of this.listeners[event] || []) {
          handler({
            event,
            id: -1,
            payload
          });
        }
        return;
      }
      return emit(event, payload);
    }
    async emitTo(target, event, payload) {
      if (localTauriEvents2.includes(event)) {
        for (const handler of this.listeners[event] || []) {
          handler({
            event,
            id: -1,
            payload
          });
        }
        return;
      }
      return emitTo(target, event, payload);
    }
    _handleTauriEvent(event, handler) {
      if (localTauriEvents2.includes(event)) {
        if (!(event in this.listeners)) {
          this.listeners[event] = [handler];
        } else {
          this.listeners[event].push(handler);
        }
        return true;
      }
      return false;
    }
    async position() {
      return invoke("plugin:webview|webview_position", {
        label: this.label
      }).then((p) => new PhysicalPosition(p));
    }
    async size() {
      return invoke("plugin:webview|webview_size", {
        label: this.label
      }).then((s) => new PhysicalSize(s));
    }
    async close() {
      return invoke("plugin:webview|webview_close", {
        label: this.label
      });
    }
    async setSize(size) {
      return invoke("plugin:webview|set_webview_size", {
        label: this.label,
        value: size instanceof Size ? size : new Size(size)
      });
    }
    async setPosition(position) {
      return invoke("plugin:webview|set_webview_position", {
        label: this.label,
        value: position instanceof Position ? position : new Position(position)
      });
    }
    async setFocus() {
      return invoke("plugin:webview|set_webview_focus", {
        label: this.label
      });
    }
    async setAutoResize(autoResize) {
      return invoke("plugin:webview|set_webview_auto_resize", {
        label: this.label,
        value: autoResize
      });
    }
    async hide() {
      return invoke("plugin:webview|webview_hide", {
        label: this.label
      });
    }
    async show() {
      return invoke("plugin:webview|webview_show", {
        label: this.label
      });
    }
    async setZoom(scaleFactor) {
      return invoke("plugin:webview|set_webview_zoom", {
        label: this.label,
        value: scaleFactor
      });
    }
    async reparent(window2) {
      return invoke("plugin:webview|reparent", {
        label: this.label,
        window: typeof window2 === "string" ? window2 : window2.label
      });
    }
    async clearAllBrowsingData() {
      return invoke("plugin:webview|clear_all_browsing_data");
    }
    async setBackgroundColor(color) {
      return invoke("plugin:webview|set_webview_background_color", { color });
    }
    async onDragDropEvent(handler) {
      const unlistenDragEnter = await this.listen(TauriEvent.DRAG_ENTER, (event) => {
        handler({
          ...event,
          payload: {
            type: "enter",
            paths: event.payload.paths,
            position: new PhysicalPosition(event.payload.position)
          }
        });
      });
      const unlistenDragOver = await this.listen(TauriEvent.DRAG_OVER, (event) => {
        handler({
          ...event,
          payload: {
            type: "over",
            position: new PhysicalPosition(event.payload.position)
          }
        });
      });
      const unlistenDragDrop = await this.listen(TauriEvent.DRAG_DROP, (event) => {
        handler({
          ...event,
          payload: {
            type: "drop",
            paths: event.payload.paths,
            position: new PhysicalPosition(event.payload.position)
          }
        });
      });
      const unlistenDragLeave = await this.listen(TauriEvent.DRAG_LEAVE, (event) => {
        handler({ ...event, payload: { type: "leave" } });
      });
      return () => {
        unlistenDragEnter();
        unlistenDragDrop();
        unlistenDragOver();
        unlistenDragLeave();
      };
    }
  }

  // node_modules/@tauri-apps/api/webviewWindow.js
  function getCurrentWebviewWindow() {
    const webview = getCurrentWebview();
    return new WebviewWindow(webview.label, { skip: true });
  }
  async function getAllWebviewWindows() {
    return invoke("plugin:window|get_all_windows").then((windows) => windows.map((w) => new WebviewWindow(w, {
      skip: true
    })));
  }

  class WebviewWindow {
    constructor(label, options = {}) {
      var _a;
      this.label = label;
      this.listeners = Object.create(null);
      if (!(options === null || options === undefined ? undefined : options.skip)) {
        invoke("plugin:webview|create_webview_window", {
          options: {
            ...options,
            parent: typeof options.parent === "string" ? options.parent : (_a = options.parent) === null || _a === undefined ? undefined : _a.label,
            label
          }
        }).then(async () => this.emit("tauri://created")).catch(async (e) => this.emit("tauri://error", e));
      }
    }
    static async getByLabel(label) {
      var _a;
      const webview = (_a = (await getAllWebviewWindows()).find((w) => w.label === label)) !== null && _a !== undefined ? _a : null;
      if (webview) {
        return new WebviewWindow(webview.label, { skip: true });
      }
      return null;
    }
    static getCurrent() {
      return getCurrentWebviewWindow();
    }
    static async getAll() {
      return getAllWebviewWindows();
    }
    async listen(event, handler) {
      if (this._handleTauriEvent(event, handler)) {
        return () => {
          const listeners = this.listeners[event];
          listeners.splice(listeners.indexOf(handler), 1);
        };
      }
      return listen(event, handler, {
        target: { kind: "WebviewWindow", label: this.label }
      });
    }
    async once(event, handler) {
      if (this._handleTauriEvent(event, handler)) {
        return () => {
          const listeners = this.listeners[event];
          listeners.splice(listeners.indexOf(handler), 1);
        };
      }
      return once(event, handler, {
        target: { kind: "WebviewWindow", label: this.label }
      });
    }
    async setBackgroundColor(color) {
      return invoke("plugin:window|set_background_color", { color }).then(() => {
        return invoke("plugin:webview|set_webview_background_color", { color });
      });
    }
  }
  applyMixins(WebviewWindow, [Window, Webview]);
  function applyMixins(baseClass, extendedClasses) {
    (Array.isArray(extendedClasses) ? extendedClasses : [extendedClasses]).forEach((extendedClass) => {
      Object.getOwnPropertyNames(extendedClass.prototype).forEach((name) => {
        var _a;
        if (typeof baseClass.prototype === "object" && baseClass.prototype && name in baseClass.prototype)
          return;
        Object.defineProperty(baseClass.prototype, name, (_a = Object.getOwnPropertyDescriptor(extendedClass.prototype, name)) !== null && _a !== undefined ? _a : Object.create(null));
      });
    });
  }

  // src-tauri/src/typescript/domModifier.ts
  function removeSeeProjectPage() {
    const removeTarget = () => {
      const items = document.querySelectorAll(".menu-bar_menu-bar-item_264qQ");
      items.forEach((item) => {
        if (item.textContent?.includes("See Project Page")) {
          item.remove();
        }
      });
    };
    removeTarget();
    const menuBar = document.querySelector(".menu-bar_menu-bar_1gLUp");
    if (menuBar) {
      const observer = new MutationObserver(() => {
        removeTarget();
      });
      observer.observe(menuBar, {
        childList: true,
        subtree: true
      });
    }
  }
  function removeBackToHome() {
    const removeTarget = () => {
      const homeLink = document.querySelector(".menu-bar_feedback-link_2Op70");
      if (homeLink) {
        const parentItem = homeLink.closest(".menu-bar_menu-bar-item_264qQ");
        parentItem?.remove();
      }
    };
    removeTarget();
    const menuBar = document.querySelector(".menu-bar_menu-bar_1gLUp");
    if (menuBar) {
      const observer = new MutationObserver(() => {
        removeTarget();
      });
      observer.observe(menuBar, {
        childList: true,
        subtree: true
      });
    }
  }
  function modifyEditor() {
    removeBackToHome();
    removeSeeProjectPage();
  }

  // src-tauri/src/typescript/script.ts
  (function() {
    modifyEditor();
    const _open = window.open;
    Object.defineProperty(window, "open", {
      writable: true,
      configurable: true,
      value: function(url, target, features) {
        if (!url)
          return null;
        const urlString = url.toString();
        if (urlString.includes("addons")) {
          const WINDOW_LABEL = "addons-settings";
          WebviewWindow.getByLabel(WINDOW_LABEL).then(async (existingWindow) => {
            if (existingWindow) {
              await existingWindow.unminimize();
              await existingWindow.setFocus();
            } else {
              const newWebview = new WebviewWindow(WINDOW_LABEL, {
                url: url.toString(),
                title: "Addons Settings",
                width: 800,
                height: 600,
                resizable: true
              });
              newWebview.once("tauri://error", (err) => {
                console.error("Failed to create window:", err);
              });
            }
          }).catch(console.error);
          return null;
        }
        if (urlString.startsWith("http://") || urlString.startsWith("https://")) {
          invoke("open_external", { url: urlString }).catch(console.error);
          return null;
        }
        const resolved = new URL(urlString, window.location.href).href;
        invoke("open_external", { url: resolved }).catch(console.error);
        return null;
      }
    });
  })();
})();
