use tauri::{Manager, PhysicalPosition, PhysicalSize, WebviewWindow};

#[tauri::command]
pub fn set_window_size(window: WebviewWindow, width: u32, height: u32) -> Result<(), String> {
    window
        .set_size(PhysicalSize::new(width, height))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_window_min_size(window: WebviewWindow, width: u32, height: u32) -> Result<(), String> {
    window
        .set_min_size(Some(PhysicalSize::new(width, height)))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_window_max_size(window: WebviewWindow, width: u32, height: u32) -> Result<(), String> {
    window
        .set_max_size(Some(PhysicalSize::new(width, height)))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_window_position(window: WebviewWindow, x: i32, y: i32) -> Result<(), String> {
    window
        .set_position(PhysicalPosition::new(x, y))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn center_window(window: WebviewWindow) -> Result<(), String> {
    window.center().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_window_resizable(window: WebviewWindow, resizable: bool) -> Result<(), String> {
    window.set_resizable(resizable).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_window_fullscreen(window: WebviewWindow, fullscreen: bool) -> Result<(), String> {
    window.set_fullscreen(fullscreen).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn maximize_window(window: WebviewWindow) -> Result<(), String> {
    window.maximize().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn unmaximize_window(window: WebviewWindow) -> Result<(), String> {
    window.unmaximize().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn minimize_window(window: WebviewWindow) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_window_always_on_top(window: WebviewWindow, always_on_top: bool) -> Result<(), String> {
    window
        .set_always_on_top(always_on_top)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_window_size(window: WebviewWindow) -> Result<(u32, u32), String> {
    let size = window.inner_size().map_err(|e| e.to_string())?;
    Ok((size.width, size.height))
}

#[tauri::command]
pub fn eval_in_window(app: tauri::AppHandle, label: String, script: String) -> Result<(), String> {
    let window = app
        .get_webview_window(&label)
        .ok_or_else(|| format!("window with label {label} not found"))?;
    window.eval(&script).map_err(|e| e.to_string())
}
