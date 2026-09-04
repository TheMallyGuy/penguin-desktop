use std::fs;
use std::path::PathBuf;
use tauri::Emitter;
use tauri::Manager;

struct PendingFile {
    path: String,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn open_external(url: String) -> Result<(), String> {
    tauri_plugin_opener::open_url(&url, None::<&str>).map_err(|e| e.to_string())
}

#[tauri::command]
fn read_file(file: String) -> Result<Vec<u8>, String> {
    std::fs::read(file).map_err(|e| e.to_string())
}

fn inject_js_files(webview: &tauri::Webview) {
    let mut backed_js_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    backed_js_dir.push("src");
    backed_js_dir.push("baked_js");

    if !backed_js_dir.exists() {
        return;
    }

    let mut entries: Vec<_> = fs::read_dir(&backed_js_dir)
        .expect("failed to read baked_js directory")
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().map_or(false, |ext| ext == "js"))
        .collect();

    entries.sort_by_key(|e| e.path());

    for entry in entries {
        let path = entry.path();
        let content = fs::read_to_string(&path)
            .unwrap_or_else(|e| panic!("failed to read {}: {}", path.display(), e));
        if let Err(e) = webview.eval(&content) {
            eprintln!("failed to eval {}: {}", path.display(), e);
        } else {
            println!("injected {}", path.display());
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_drpc::init())
        .invoke_handler(tauri::generate_handler![greet, open_external, read_file])
        .on_page_load(|webview, _event| {
            inject_js_files(webview);

            if let Some(pending) = webview.try_state::<PendingFile>() {
                let path = pending.path.clone();
                let webview_label = webview.label().to_string();
                let app_handle = webview.app_handle().clone();
                std::thread::spawn(move || {
                    //std::thread::sleep(std::time::Duration::from_secs(1));
                    let webview = app_handle.get_webview_window(&webview_label).unwrap();
                    if let Err(e) = webview.emit("file-open-pmp", path) {
                        eprintln!("failed to emit file-open-pmp: {}", e);
                    }
                });
            }
        })
        .setup(|app| {
            let args: Vec<String> = std::env::args().collect();

            if let Some(file_path) = args.get(1) {
                println!("opened with file: {}", file_path);

                app.manage(PendingFile {
                    path: file_path.clone(),
                });
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app_handle, _event| {});
}
